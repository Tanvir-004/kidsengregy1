-- ==============================================================================
-- Migration: Auth Auto-Profile Trigger, Order Placement Procedure, & RLS Updates
-- ==============================================================================

-- 1. Auto-create parent profile when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.parents (id, full_name, phone, google_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'অভিভাবক'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = CASE WHEN EXCLUDED.full_name <> 'অভিভাবক' THEN EXCLUDED.full_name ELSE parents.full_name END,
    phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE parents.phone END,
    google_email = COALESCE(EXCLUDED.google_email, parents.google_email),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Allow parents to insert/update their own profile directly
DROP POLICY IF EXISTS "Parents can insert own profile" ON public.parents;
CREATE POLICY "Parents can insert own profile" ON public.parents
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Atomic Order Placement Function
CREATE OR REPLACE FUNCTION public.place_package_order(
  p_child_name TEXT,
  p_child_age INT,
  p_shipping_district TEXT,
  p_shipping_address TEXT,
  p_shipping_phone TEXT,
  p_classroom_email TEXT DEFAULT NULL,
  p_classroom_email_type TEXT DEFAULT 'parent',
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_parent_id UUID;
  v_child_id UUID;
  v_order_id UUID;
  v_shipment_id UUID;
  v_order_number TEXT;
  v_tracking_code TEXT;
  v_random_suffix TEXT;
  v_classroom_email TEXT;
  v_parent_email TEXT;
BEGIN
  -- 1. Ensure caller is authenticated
  v_parent_id := auth.uid();
  IF v_parent_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required. No guest checkout allowed.';
  END IF;

  -- 2. Validate child age (4–10 years strictly enforced)
  IF p_child_age < 4 OR p_child_age > 10 THEN
    RAISE EXCEPTION 'Child age must be between 4 and 10 years. Provided: %', p_child_age;
  END IF;

  -- 3. Get parent details
  SELECT google_email INTO v_parent_email FROM public.parents WHERE id = v_parent_id;

  -- 4. Create child record under this parent
  INSERT INTO public.children (parent_id, full_name, age, notes)
  VALUES (v_parent_id, trim(p_child_name), p_child_age, p_notes)
  RETURNING id INTO v_child_id;

  -- 5. Generate distinct order number e.g. KE-2026-XXXXX
  v_random_suffix := lpad(floor(random() * 90000 + 10000)::text, 5, '0');
  v_order_number := 'KE-2026-' || v_random_suffix;
  v_tracking_code := 'STDF-' || v_random_suffix;

  -- 6. Insert Order (৳990 package + ৳90 delivery = ৳1,080 COD)
  INSERT INTO public.orders (
    order_number,
    parent_id,
    child_id,
    package_price,
    delivery_fee,
    total_amount,
    payment_method,
    order_status,
    shipping_district,
    shipping_address,
    shipping_phone,
    notes
  )
  VALUES (
    v_order_number,
    v_parent_id,
    v_child_id,
    990.00,
    90.00,
    1080.00,
    'cod',
    'confirmed',
    trim(p_shipping_district),
    trim(p_shipping_address),
    trim(p_shipping_phone),
    p_notes
  )
  RETURNING id INTO v_order_id;

  -- 7. Insert Initial Shipment Attempt #1
  INSERT INTO public.shipments (
    order_id,
    attempt_number,
    is_current_attempt,
    courier,
    consignment_id,
    tracking_code,
    cod_target,
    status,
    dispatched_at,
    refusal_fee_status,
    refusal_fee_amount,
    courier_return_cost,
    notes
  )
  VALUES (
    v_order_id,
    1,
    true,
    'steadfast',
    'CP-' || v_random_suffix,
    v_tracking_code,
    1080.00,
    'in_transit',
    now(),
    'not_applicable',
    0.00,
    0.00,
    'Initial package shipment attempt #1'
  )
  RETURNING id INTO v_shipment_id;

  -- 8. Insert Payment Ledger record
  INSERT INTO public.payments (
    order_id,
    shipment_id,
    amount,
    method,
    status,
    transaction_type
  )
  VALUES (
    v_order_id,
    v_shipment_id,
    1080.00,
    'cod',
    'pending',
    'package_payment'
  );

  -- 9. Determine classroom email
  IF p_classroom_email IS NOT NULL AND trim(p_classroom_email) <> '' THEN
    v_classroom_email := trim(p_classroom_email);
  ELSE
    v_classroom_email := v_parent_email;
  END IF;

  -- 10. Insert Enrollment record (learning_access_activated is strictly FALSE until dual-gate is satisfied)
  INSERT INTO public.enrollments (
    order_id,
    child_id,
    learning_access_activated,
    selected_classroom_email,
    classroom_email_type,
    classroom_status,
    whatsapp_status
  )
  VALUES (
    v_order_id,
    v_child_id,
    false,
    v_classroom_email,
    COALESCE(p_classroom_email_type, 'parent'),
    'pending',
    'not_revealed'
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'child_id', v_child_id,
    'child_name', p_child_name,
    'total_amount', 1080.00,
    'payment_method', 'cod',
    'tracking_code', v_tracking_code,
    'status', 'confirmed'
  );
END;
$$;

-- 4. Additional RLS read policies for parents on shipments & payments
DROP POLICY IF EXISTS "Parents can view shipments for their orders" ON public.shipments;
CREATE POLICY "Parents can view shipments for their orders" ON public.shipments
  FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE parent_id = auth.uid())
  );

DROP POLICY IF EXISTS "Parents can view payments for their orders" ON public.payments;
CREATE POLICY "Parents can view payments for their orders" ON public.payments
  FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE parent_id = auth.uid())
  );
