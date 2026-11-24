-- ==============================================================================
-- KidsEngregy V1 Production Database Schema & Stored Procedures
-- Framework: Supabase (PostgreSQL 15+)
-- Target age: 4–10 years
-- Payment: Cash on Delivery (COD) only (৳990 Package + ৳90 Delivery = ৳1,080)
-- Courier: Steadfast (Manual Consignment Tracking & Daily Remittance Reconciliation)
-- Access Rule: Dual-Gate (Confirmed Book Delivery + Verified Courier Remittance)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES
DO $$ BEGIN
  CREATE TYPE order_status_type AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'in_transit',
    'delivered',
    'returned',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE shipment_status_type AS ENUM (
    'in_transit',
    'delivered',
    'returned',
    'refused',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE refusal_fee_status_type AS ENUM (
    'not_applicable',
    'pending',
    'verified_collected',
    'waived'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_type AS ENUM (
    'pending',
    'collected_by_courier',
    'verified_reconciled',
    'failed',
    'refunded'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE match_status_type AS ENUM (
    'matched',
    'unmatched_consignment',
    'amount_discrepancy'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. PARENTS (Profiles linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.parents (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  google_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. CHILDREN (Multiple children under one parent, age 4–10 enforced)
CREATE TABLE IF NOT EXISTS public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INT NOT NULL CHECK (age >= 4 AND age <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. ORDERS (One persistent order number across multiple attempts)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE RESTRICT,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE RESTRICT,
  package_price NUMERIC(10,2) NOT NULL DEFAULT 990.00,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 90.00,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 1080.00,
  payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method = 'cod'),
  order_status order_status_type NOT NULL DEFAULT 'pending',
  shipping_district TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. SHIPMENTS (Steadfast shipments with atomic current attempt enforcement)
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL DEFAULT 1,
  is_current_attempt BOOLEAN NOT NULL DEFAULT true,
  courier TEXT NOT NULL DEFAULT 'steadfast',
  consignment_id TEXT NOT NULL,
  tracking_code TEXT NOT NULL,
  cod_target NUMERIC(10,2) NOT NULL DEFAULT 1080.00,
  status shipment_status_type NOT NULL DEFAULT 'in_transit',
  dispatched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  refusal_fee_status refusal_fee_status_type NOT NULL DEFAULT 'pending',
  refusal_fee_amount NUMERIC(10,2) NOT NULL DEFAULT 90.00,
  courier_return_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enforce exactly one is_current_attempt = true per order
CREATE UNIQUE INDEX IF NOT EXISTS idx_shipments_current_attempt
  ON public.shipments (order_id)
  WHERE is_current_attempt = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_shipments_order_attempt
  ON public.shipments (order_id, attempt_number);

CREATE INDEX IF NOT EXISTS idx_shipments_consignment_id
  ON public.shipments (consignment_id);

-- 7. PAYMENTS (Ledger of cash collected and settlement status)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  method TEXT NOT NULL DEFAULT 'cod',
  status payment_status_type NOT NULL DEFAULT 'pending',
  transaction_type TEXT NOT NULL DEFAULT 'package_payment' CHECK (transaction_type IN ('package_payment', 'redispatch_settlement')),
  collected_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. ENROLLMENTS (Learning access gate - activated only when Dual-Gate is satisfied)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  learning_access_activated BOOLEAN NOT NULL DEFAULT false,
  activated_at TIMESTAMPTZ,
  selected_classroom_email TEXT,
  classroom_email_type TEXT CHECK (classroom_email_type IN ('parent', 'student')),
  classroom_status TEXT NOT NULL DEFAULT 'pending' CHECK (classroom_status IN ('pending', 'invited', 'active')),
  whatsapp_status TEXT NOT NULL DEFAULT 'not_revealed' CHECK (whatsapp_status IN ('not_revealed', 'link_revealed', 'joined')),
  whatsapp_link_revealed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. RECONCILIATION BATCHES (Daily Steadfast settlement sheet)
CREATE TABLE IF NOT EXISTS public.reconciliation_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT NOT NULL UNIQUE,
  courier TEXT NOT NULL DEFAULT 'steadfast',
  invoice_reference TEXT NOT NULL,
  reconciled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reconciled_by UUID REFERENCES auth.users(id),
  total_expected_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_remitted_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  discrepancy_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'reconciled' CHECK (status IN ('reconciled', 'discrepancy_flagged', 'draft')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. RECONCILIATION ITEMS (Line items with duplicate protection & nullable foreign keys)
CREATE TABLE IF NOT EXISTS public.reconciliation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.reconciliation_batches(id) ON DELETE CASCADE,
  consignment_id TEXT NOT NULL,
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  expected_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  remitted_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  discrepancy_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  match_status match_status_type NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent duplicate consignment in same batch
CREATE UNIQUE INDEX IF NOT EXISTS idx_reconciliation_batch_consignment
  ON public.reconciliation_items (batch_id, consignment_id);

-- Prevent matching the same shipment twice across separate batches
CREATE UNIQUE INDEX IF NOT EXISTS idx_reconciliation_unique_matched_shipment
  ON public.reconciliation_items (shipment_id)
  WHERE match_status = 'matched' AND shipment_id IS NOT NULL;

-- 11. APP SETTINGS (Admin configurable links and support phone)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.app_settings (key, value, description)
VALUES
  ('support_phone', '01893225855', 'KidsEngregy customer support WhatsApp contact'),
  ('support_whatsapp_url', 'https://wa.me/8801893225855', 'Approved direct WhatsApp customer support URL'),
  ('whatsapp_learning_group_url', 'https://chat.whatsapp.com/sample-learning-invite-link', 'Shared reusable WhatsApp group invitation link revealed to enrolled parents'),
  ('google_classroom_invite_url', 'https://classroom.google.com/c/sample-code', 'Google Classroom invite link')
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- STORED PROCEDURES (Atomic Business Logic)
-- ==============================================================================

-- Procedure 1: Re-dispatch Order with Refusal Fee verification
CREATE OR REPLACE FUNCTION public.redispatch_order(
  p_order_id UUID,
  p_consignment_id TEXT,
  p_tracking_code TEXT,
  p_courier_return_cost NUMERIC(10,2) DEFAULT 0.00,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_current_shipment public.shipments%ROWTYPE;
  v_next_attempt_num INT;
  v_next_cod NUMERIC(10,2);
  v_new_shipment_id UUID;
BEGIN
  -- 1. Lock order for update
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  -- 2. Validate order status eligibility
  IF v_order.order_status NOT IN ('returned', 'cancelled') THEN
    RAISE EXCEPTION 'Order % is in state %, which cannot be re-dispatched. Must be returned.', v_order.order_number, v_order.order_status;
  END IF;

  -- 3. Lock current shipment for update
  SELECT * INTO v_current_shipment
  FROM public.shipments
  WHERE order_id = p_order_id AND is_current_attempt = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active current shipment found for order %', v_order.order_number;
  END IF;

  -- 4. Calculate next COD target based strictly on verified collection status
  -- If previous ৳90 refusal fee was verified collected by courier: customer already paid delivery, so next COD = ৳990.
  -- If NOT verified (waived, pending, or uncollected): next COD = ৳1,080.
  IF v_current_shipment.refusal_fee_status = 'verified_collected' THEN
    v_next_cod := 990.00;
  ELSE
    v_next_cod := 1080.00;
  END IF;

  v_next_attempt_num := v_current_shipment.attempt_number + 1;

  -- 5. Retire old shipment attempt
  UPDATE public.shipments
  SET
    is_current_attempt = false,
    updated_at = now()
  WHERE id = v_current_shipment.id;

  -- 6. Insert new shipment attempt atomically
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
    p_order_id,
    v_next_attempt_num,
    true,
    'steadfast',
    p_consignment_id,
    p_tracking_code,
    v_next_cod,
    'in_transit',
    now(),
    'not_applicable',
    0.00,
    p_courier_return_cost,
    COALESCE(p_notes, 'Re-dispatch attempt #' || v_next_attempt_num)
  )
  RETURNING id INTO v_new_shipment_id;

  -- 7. Update order status to processing / in_transit
  UPDATE public.orders
  SET
    order_status = 'in_transit',
    updated_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'new_shipment_id', v_new_shipment_id,
    'attempt_number', v_next_attempt_num,
    'cod_target', v_next_cod,
    'previous_refusal_fee_status', v_current_shipment.refusal_fee_status
  );
END;
$$;


-- Procedure 2: Daily Steadfast Batch Reconciliation & Dual-Gate Activation
CREATE OR REPLACE FUNCTION public.reconcile_daily_batch(
  p_batch_number TEXT,
  p_invoice_reference TEXT,
  p_reconciled_by UUID,
  p_items JSONB, -- Array of { "consignment_id": string, "remitted_amount": number }
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_batch_id UUID;
  v_item JSONB;
  v_consignment_id TEXT;
  v_remitted NUMERIC(10,2);
  v_shipment public.shipments%ROWTYPE;
  v_order public.orders%ROWTYPE;
  v_total_expected NUMERIC(10,2) := 0.00;
  v_total_remitted NUMERIC(10,2) := 0.00;
  v_total_discrepancy NUMERIC(10,2) := 0.00;
  v_match_status match_status_type;
  v_discrepancy NUMERIC(10,2);
  v_activated_count INT := 0;
  v_discrepancy_count INT := 0;
BEGIN
  -- 1. Create batch header
  INSERT INTO public.reconciliation_batches (
    batch_number,
    courier,
    invoice_reference,
    reconciled_date,
    reconciled_by,
    notes
  )
  VALUES (
    p_batch_number,
    'steadfast',
    p_invoice_reference,
    CURRENT_DATE,
    p_reconciled_by,
    p_notes
  )
  RETURNING id INTO v_batch_id;

  -- 2. Loop through submitted line items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_consignment_id := trim(v_item->>'consignment_id');
    v_remitted := (v_item->>'remitted_amount')::NUMERIC(10,2);
    v_total_remitted := v_total_remitted + v_remitted;

    -- Look up shipment attempt by consignment ID
    SELECT * INTO v_shipment
    FROM public.shipments
    WHERE consignment_id = v_consignment_id AND is_current_attempt = true
    FOR UPDATE;

    IF FOUND THEN
      -- Matched shipment
      SELECT * INTO v_order FROM public.orders WHERE id = v_shipment.order_id FOR UPDATE;

      v_total_expected := v_total_expected + v_shipment.cod_target;
      v_discrepancy := v_remitted - v_shipment.cod_target;
      v_total_discrepancy := v_total_discrepancy + v_discrepancy;

      IF v_discrepancy = 0 THEN
        v_match_status := 'matched';

        -- Update payment to verified_reconciled
        UPDATE public.payments
        SET
          status = 'verified_reconciled',
          verified_at = now()
        WHERE order_id = v_order.id AND (shipment_id = v_shipment.id OR shipment_id IS NULL);

        -- Dual-Gate Check: Activate enrollment ONLY IF shipment status is 'delivered'
        IF v_shipment.status = 'delivered' THEN
          UPDATE public.enrollments
          SET
            learning_access_activated = true,
            activated_at = COALESCE(activated_at, now()),
            updated_at = now()
          WHERE order_id = v_order.id;

          v_activated_count := v_activated_count + 1;
        END IF;

      ELSE
        v_match_status := 'amount_discrepancy';
        v_discrepancy_count := v_discrepancy_count + 1;
      END IF;

      -- Insert reconciliation line item with valid FKs
      INSERT INTO public.reconciliation_items (
        batch_id,
        consignment_id,
        shipment_id,
        order_id,
        expected_amount,
        remitted_amount,
        discrepancy_amount,
        match_status,
        notes
      )
      VALUES (
        v_batch_id,
        v_consignment_id,
        v_shipment.id,
        v_order.id,
        v_shipment.cod_target,
        v_remitted,
        v_discrepancy,
        v_match_status,
        'Matched to Order ' || v_order.order_number
      );

    ELSE
      -- Unmatched consignment: DO NOT INSERT RANDOM UUID. Nullable foreign keys.
      v_match_status := 'unmatched_consignment';
      v_discrepancy_count := v_discrepancy_count + 1;

      INSERT INTO public.reconciliation_items (
        batch_id,
        consignment_id,
        shipment_id,
        order_id,
        expected_amount,
        remitted_amount,
        discrepancy_amount,
        match_status,
        notes
      )
      VALUES (
        v_batch_id,
        v_consignment_id,
        NULL,
        NULL,
        0.00,
        v_remitted,
        v_remitted,
        v_match_status,
        'Consignment not found in active database shipments'
      );
    END IF;
  END LOOP;

  -- 3. Update batch header totals
  UPDATE public.reconciliation_batches
  SET
    total_expected_amount = v_total_expected,
    total_remitted_amount = v_total_remitted,
    discrepancy_amount = v_total_discrepancy,
    status = CASE WHEN v_discrepancy_count > 0 THEN 'discrepancy_flagged' ELSE 'reconciled' END
  WHERE id = v_batch_id;

  RETURN jsonb_build_object(
    'success', true,
    'batch_id', v_batch_id,
    'batch_number', p_batch_number,
    'total_expected', v_total_expected,
    'total_remitted', v_total_remitted,
    'discrepancy', v_total_discrepancy,
    'activated_enrollments', v_activated_count,
    'discrepancies', v_discrepancy_count
  );
END;
$$;

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Parents: can read & update only own profile
CREATE POLICY "Parents can view own profile" ON public.parents
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Parents can update own profile" ON public.parents
  FOR UPDATE USING (auth.uid() = id);

-- Children: parents can manage own children
CREATE POLICY "Parents can view own children" ON public.children
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can insert own children" ON public.children
  FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update own children" ON public.children
  FOR UPDATE USING (parent_id = auth.uid());

-- Orders: parents can view own orders and insert COD order
CREATE POLICY "Parents can view own orders" ON public.orders
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can create own order" ON public.orders
  FOR INSERT WITH CHECK (parent_id = auth.uid());

-- Enrollments: parents can view own enrollments
CREATE POLICY "Parents can view own enrollments" ON public.enrollments
  FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE parent_id = auth.uid())
  );

CREATE POLICY "Parents can update classroom email" ON public.enrollments
  FOR UPDATE USING (
    order_id IN (SELECT id FROM public.orders WHERE parent_id = auth.uid())
  );

-- App settings: public read access
CREATE POLICY "Public read app settings" ON public.app_settings
  FOR SELECT USING (true);
