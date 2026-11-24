-- ==============================================================================
-- Migration 06: Fix Admin RPC Column Mismatches & Schema Cache Reload
-- Fixes: o.order_notes -> o.notes, e.classroom_email -> e.selected_classroom_email,
-- and ensures admin_get_all_orders, admin_get_all_parents, admin_get_all_batches exist.
-- ==============================================================================

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
    'selected_classroom_email', trim(p_email)
  );
END;
$$;

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
          'shipped_at', s.dispatched_at,
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

GRANT EXECUTE ON FUNCTION public.admin_update_classroom_email TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_all_orders TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_all_parents TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_all_batches TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
