-- ==============================================================================
-- Migration 05: Admin Full Access, RLS Open Policies & Operational Functions
-- Ensures Supabase tables and RPC functions are 100% accessible to Admin & Web
-- ==============================================================================

-- 1. Ensure extensions and tables exist
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Open RLS Policies for Orders, Shipments, Payments, Enrollments, Parents, Children, Batches
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies if present
DROP POLICY IF EXISTS "Parents can view own profile" ON public.parents;
DROP POLICY IF EXISTS "Parents can update own profile" ON public.parents;
DROP POLICY IF EXISTS "Allow all on parents" ON public.parents;
CREATE POLICY "Allow all on parents" ON public.parents FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Parents can view own children" ON public.children;
DROP POLICY IF EXISTS "Parents can insert own children" ON public.children;
DROP POLICY IF EXISTS "Parents can update own children" ON public.children;
DROP POLICY IF EXISTS "Allow all on children" ON public.children;
CREATE POLICY "Allow all on children" ON public.children FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Parents can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Parents can create own order" ON public.orders;
DROP POLICY IF EXISTS "Allow all on orders" ON public.orders;
CREATE POLICY "Allow all on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on shipments" ON public.shipments;
CREATE POLICY "Allow all on shipments" ON public.shipments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on payments" ON public.payments;
CREATE POLICY "Allow all on payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Parents can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Parents can update classroom email" ON public.enrollments;
DROP POLICY IF EXISTS "Allow all on enrollments" ON public.enrollments;
CREATE POLICY "Allow all on enrollments" ON public.enrollments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on batches" ON public.reconciliation_batches;
CREATE POLICY "Allow all on batches" ON public.reconciliation_batches FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on items" ON public.reconciliation_items;
CREATE POLICY "Allow all on items" ON public.reconciliation_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow all on app_settings" ON public.app_settings;
CREATE POLICY "Allow all on app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- 3. Grant table permissions to public roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. Helper Function: Admin Mark Shipment Delivered
CREATE OR REPLACE FUNCTION public.admin_mark_shipment_delivered(
  p_order_id UUID,
  p_shipment_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shipment public.shipments%ROWTYPE;
  v_order public.orders%ROWTYPE;
  v_payment public.payments%ROWTYPE;
  v_activated BOOLEAN := false;
BEGIN
  -- 1. Update Shipment to Delivered
  UPDATE public.shipments
  SET
    status = 'delivered',
    delivered_at = COALESCE(delivered_at, now()),
    notes = CASE WHEN p_notes IS NOT NULL THEN COALESCE(notes || ' | ', '') || p_notes ELSE notes END,
    updated_at = now()
  WHERE id = p_shipment_id AND order_id = p_order_id
  RETURNING * INTO v_shipment;

  -- 2. Update Order to Delivered
  UPDATE public.orders
  SET
    order_status = 'delivered',
    updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  -- 3. Update payment status to collected_by_courier
  UPDATE public.payments
  SET
    status = CASE WHEN status = 'verified_reconciled' THEN 'verified_reconciled' ELSE 'collected_by_courier' END,
    updated_at = now()
  WHERE order_id = p_order_id AND (shipment_id = p_shipment_id OR shipment_id IS NULL)
  RETURNING * INTO v_payment;

  -- 4. Dual-Gate Check: If payment was already verified/reconciled, activate enrollment!
  IF v_payment.status = 'verified_reconciled' THEN
    UPDATE public.enrollments
    SET
      learning_access_activated = true,
      activated_at = COALESCE(activated_at, now()),
      updated_at = now()
    WHERE order_id = p_order_id;
    v_activated := true;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'shipment_id', p_shipment_id,
    'order_status', v_order.order_status,
    'shipment_status', v_shipment.status,
    'payment_status', v_payment.status,
    'dual_gate_activated', v_activated
  );
END;
$$;

-- 5. Helper Function: Admin Verify Refusal Fee
CREATE OR REPLACE FUNCTION public.admin_verify_refusal_fee(
  p_order_id UUID,
  p_shipment_id UUID,
  p_verified_status TEXT, -- 'verified_collected' or 'waived'
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.shipments
  SET
    refusal_fee_status = p_verified_status::refusal_fee_status_type,
    notes = CASE WHEN p_notes IS NOT NULL THEN COALESCE(notes || ' | ', '') || p_notes ELSE notes END,
    updated_at = now()
  WHERE id = p_shipment_id AND order_id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'shipment_id', p_shipment_id,
    'refusal_fee_status', p_verified_status
  );
END;
$$;

-- 6. Helper Function: Admin Update Consignment
CREATE OR REPLACE FUNCTION public.admin_update_consignment(
  p_shipment_id UUID,
  p_consignment_id TEXT,
  p_tracking_code TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.shipments
  SET
    consignment_id = trim(p_consignment_id),
    tracking_code = COALESCE(trim(p_tracking_code), tracking_code),
    updated_at = now()
  WHERE id = p_shipment_id;

  RETURN jsonb_build_object(
    'success', true,
    'shipment_id', p_shipment_id,
    'consignment_id', trim(p_consignment_id)
  );
END;
$$;

-- 7. Helper Function: Admin Update Classroom Email
CREATE OR REPLACE FUNCTION public.admin_update_classroom_email(
  p_order_id UUID,
  p_email TEXT,
  p_email_type TEXT DEFAULT 'parent'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.enrollments
  SET
    selected_classroom_email = trim(p_email),
    classroom_email_type = trim(p_email_type),
    updated_at = now()
  WHERE order_id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'classroom_email', trim(p_email)
  );
END;
$$;

-- 8. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.admin_mark_shipment_delivered TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_verify_refusal_fee TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_consignment TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_classroom_email TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.redispatch_order TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reconcile_daily_batch TO anon, authenticated, service_role;


-- 9. Fetch All Orders with Joined Relations
CREATE OR REPLACE FUNCTION public.admin_get_all_orders()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'parent_id', o.parent_id,
      'child_id', o.child_id,
      'package_price', o.package_price,
      'delivery_fee', o.delivery_fee,
      'total_amount', o.total_amount,
      'payment_method', o.payment_method,
      'order_status', o.order_status,
      'shipping_district', o.shipping_district,
      'shipping_address', o.shipping_address,
      'shipping_phone', o.shipping_phone,
      'notes', o.notes,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'children', jsonb_build_object(
        'id', c.id,
        'full_name', c.full_name,
        'age', c.age,
        'notes', c.notes
      ),
      'parents', jsonb_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'phone', p.phone,
        'google_email', p.google_email
      ),
      'shipments', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', s.id,
          'attempt_number', s.attempt_number,
          'is_current_attempt', s.is_current_attempt,
          'courier', s.courier,
          'consignment_id', s.consignment_id,
          'tracking_code', s.tracking_code,
          'cod_target', s.cod_target,
          'status', s.status,
          'shipped_at', s.shipped_at,
          'delivered_at', s.delivered_at,
          'refusal_fee_status', s.refusal_fee_status,
          'refusal_fee_amount', s.refusal_fee_amount,
          'courier_return_cost', s.courier_return_cost,
          'notes', s.notes,
          'created_at', s.created_at
        ) ORDER BY s.attempt_number ASC)
        FROM public.shipments s WHERE s.order_id = o.id
      ), '[]'::jsonb),
      'payments', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', pay.id,
          'amount', pay.amount,
          'status', pay.status,
          'verified_at', pay.verified_at,
          'created_at', pay.created_at
        ))
        FROM public.payments pay WHERE pay.order_id = o.id
      ), '[]'::jsonb),
      'enrollments', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', e.id,
          'selected_classroom_email', e.selected_classroom_email,
          'classroom_email_type', e.classroom_email_type,
          'learning_access_activated', e.learning_access_activated,
          'activated_at', e.activated_at,
          'classroom_status', e.classroom_status,
          'whatsapp_status', e.whatsapp_status
        ))
        FROM public.enrollments e WHERE e.order_id = o.id
      ), '[]'::jsonb)
    ) ORDER BY o.created_at DESC
  ), '[]'::jsonb) INTO v_result
  FROM public.orders o
  LEFT JOIN public.children c ON o.child_id = c.id
  LEFT JOIN public.parents p ON o.parent_id = p.id;

  RETURN v_result;
END;
$$;

-- 10. Fetch All Parents with Children and Orders
CREATE OR REPLACE FUNCTION public.admin_get_all_parents()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'phone', p.phone,
      'google_email', p.google_email,
      'created_at', p.created_at,
      'children', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', c.id,
          'full_name', c.full_name,
          'age', c.age,
          'notes', c.notes
        ))
        FROM public.children c WHERE c.parent_id = p.id
      ), '[]'::jsonb),
      'orders', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', o.id,
          'order_number', o.order_number,
          'total_amount', o.total_amount,
          'order_status', o.order_status,
          'created_at', o.created_at
        ) ORDER BY o.created_at DESC)
        FROM public.orders o WHERE o.parent_id = p.id
      ), '[]'::jsonb)
    ) ORDER BY p.created_at DESC
  ), '[]'::jsonb) INTO v_result
  FROM public.parents p;

  RETURN v_result;
END;
$$;

-- 11. Fetch All Reconciliation Batches with Items
CREATE OR REPLACE FUNCTION public.admin_get_all_batches()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', b.id,
      'batch_number', b.batch_number,
      'courier', b.courier,
      'invoice_reference', b.invoice_reference,
      'reconciled_date', b.reconciled_date,
      'total_expected_amount', b.total_expected_amount,
      'total_remitted_amount', b.total_remitted_amount,
      'discrepancy_amount', b.discrepancy_amount,
      'status', b.status,
      'notes', b.notes,
      'created_at', b.created_at,
      'items', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', i.id,
          'consignment_id', i.consignment_id,
          'expected_amount', i.expected_amount,
          'remitted_amount', i.remitted_amount,
          'discrepancy_amount', i.discrepancy_amount,
          'match_status', i.match_status,
          'notes', i.notes
        ))
        FROM public.reconciliation_items i WHERE i.batch_id = b.id
      ), '[]'::jsonb)
    ) ORDER BY b.created_at DESC
  ), '[]'::jsonb) INTO v_result
  FROM public.reconciliation_batches b;

  RETURN v_result;
END;
$$;

-- 12. Public lookup for Order Success page
CREATE OR REPLACE FUNCTION public.get_order_by_number(p_order_number TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'total_amount', o.total_amount,
    'order_status', o.order_status,
    'shipping_district', o.shipping_district,
    'shipping_address', o.shipping_address,
    'shipping_phone', o.shipping_phone,
    'created_at', o.created_at,
    'children', jsonb_build_object(
      'full_name', c.full_name,
      'age', c.age
    ),
    'shipments', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'tracking_code', s.tracking_code,
        'consignment_id', s.consignment_id,
        'status', s.status
      ))
      FROM public.shipments s WHERE s.order_id = o.id
    ), '[]'::jsonb)
  ) INTO v_result
  FROM public.orders o
  LEFT JOIN public.children c ON o.child_id = c.id
  WHERE o.order_number = trim(p_order_number)
  LIMIT 1;

  RETURN v_result;
END;
$$;

-- Grant execute to all
GRANT EXECUTE ON FUNCTION public.admin_get_all_orders TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_all_parents TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_all_batches TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_order_by_number TO anon, authenticated, service_role;
