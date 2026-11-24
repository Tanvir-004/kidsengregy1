-- ==============================================================================
-- KidsEngregy V1 - Unified & Fail-Safe Order Placement Functions
-- Fixes "Could not find function in schema cache" by defining BOTH:
-- 1. create_package_order_v1(...)
-- 2. place_package_order(...)
-- ==============================================================================

-- 1. Decouple public.parents from auth.users hard foreign key
ALTER TABLE public.parents DROP CONSTRAINT IF EXISTS parents_id_fkey;
ALTER TABLE public.parents ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_parents_phone ON public.parents (phone);
CREATE INDEX IF NOT EXISTS idx_parents_auth_user ON public.parents (auth_user_id);

-- 2. Function: create_package_order_v1
CREATE OR REPLACE FUNCTION public.create_package_order_v1(
  p_parent_name TEXT,
  p_parent_phone TEXT,
  p_parent_email TEXT,
  p_child_name TEXT,
  p_child_age INT,
  p_shipping_district TEXT,
  p_shipping_address TEXT,
  p_classroom_email TEXT DEFAULT NULL,
  p_classroom_email_type TEXT DEFAULT 'parent',
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_uid UUID;
  v_parent_id UUID;
  v_child_id UUID;
  v_order_id UUID;
  v_shipment_id UUID;
  v_order_number TEXT;
  v_tracking_code TEXT;
  v_random_suffix TEXT;
  v_classroom_email TEXT;
  v_clean_phone TEXT;
BEGIN
  v_clean_phone := trim(p_parent_phone);

  IF p_child_age < 4 OR p_child_age > 10 THEN
    RAISE EXCEPTION 'Child age must be between 4 and 10 years. Provided: %', p_child_age;
  END IF;

  v_auth_uid := auth.uid();

  IF v_auth_uid IS NOT NULL THEN
    SELECT id INTO v_parent_id FROM public.parents WHERE auth_user_id = v_auth_uid OR id = v_auth_uid LIMIT 1;
  END IF;

  IF v_parent_id IS NULL THEN
    SELECT id INTO v_parent_id FROM public.parents WHERE phone = v_clean_phone LIMIT 1;
  END IF;

  IF v_parent_id IS NULL THEN
    INSERT INTO public.parents (auth_user_id, full_name, phone, google_email)
    VALUES (v_auth_uid, trim(p_parent_name), v_clean_phone, trim(p_parent_email))
    RETURNING id INTO v_parent_id;
  ELSE
    UPDATE public.parents
    SET
      auth_user_id = COALESCE(v_auth_uid, auth_user_id),
      full_name = trim(p_parent_name),
      google_email = COALESCE(NULLIF(trim(p_parent_email), ''), google_email),
      updated_at = now()
    WHERE id = v_parent_id;
  END IF;

  INSERT INTO public.children (parent_id, full_name, age, notes)
  VALUES (v_parent_id, trim(p_child_name), p_child_age, p_notes)
  RETURNING id INTO v_child_id;

  v_random_suffix := lpad(floor(random() * 90000 + 10000)::text, 5, '0');
  v_order_number := 'KE-2026-' || v_random_suffix;
  v_tracking_code := 'STDF-' || v_random_suffix;

  INSERT INTO public.orders (
    order_number, parent_id, child_id, package_price, delivery_fee,
    total_amount, payment_method, order_status, shipping_district,
    shipping_address, shipping_phone, notes
  )
  VALUES (
    v_order_number, v_parent_id, v_child_id, 990.00, 90.00,
    1080.00, 'cod', 'confirmed', trim(p_shipping_district),
    trim(p_shipping_address), v_clean_phone, p_notes
  )
  RETURNING id INTO v_order_id;

  INSERT INTO public.shipments (
    order_id, attempt_number, is_current_attempt, courier,
    consignment_id, tracking_code, cod_target, status,
    dispatched_at, refusal_fee_status, refusal_fee_amount,
    courier_return_cost, notes
  )
  VALUES (
    v_order_id, 1, true, 'steadfast', 'CP-' || v_random_suffix,
    v_tracking_code, 1080.00, 'in_transit', now(),
    'not_applicable', 0.00, 0.00, 'Initial package shipment attempt #1'
  )
  RETURNING id INTO v_shipment_id;

  INSERT INTO public.payments (
    order_id, shipment_id, amount, method, status, transaction_type
  )
  VALUES (
    v_order_id, v_shipment_id, 1080.00, 'cod', 'pending', 'package_payment'
  );

  IF p_classroom_email IS NOT NULL AND trim(p_classroom_email) <> '' THEN
    v_classroom_email := trim(p_classroom_email);
  ELSE
    v_classroom_email := trim(p_parent_email);
  END IF;

  INSERT INTO public.enrollments (
    order_id, child_id, learning_access_activated,
    selected_classroom_email, classroom_email_type,
    classroom_status, whatsapp_status
  )
  VALUES (
    v_order_id, v_child_id, false, v_classroom_email,
    COALESCE(p_classroom_email_type, 'parent'), 'pending', 'not_revealed'
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

-- 3. Function: place_package_order (Backward compatibility alias)
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
SET search_path = public
AS $$
BEGIN
  RETURN public.create_package_order_v1(
    'অভিভাবক',
    p_shipping_phone,
    COALESCE(p_classroom_email, 'info@kidsengregy.com'),
    p_child_name,
    p_child_age,
    p_shipping_district,
    p_shipping_address,
    p_classroom_email,
    p_classroom_email_type,
    p_notes
  );
END;
$$;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION public.create_package_order_v1 TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.place_package_order TO anon, authenticated, service_role;
