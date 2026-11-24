import { supabase } from './client'
import {
  DemoOrder,
  DemoParent,
  ReconciliationBatch,
  ReconciliationLineItem,
  ShipmentAttempt,
  OrderStatus,
  PaymentStatus,
  RefusalFeeStatus,
  ShipmentStatus,
} from '@/lib/admin-demo/types'

// Map Supabase JSON order record to domain DemoOrder
export function mapSupabaseOrderToDomain(order: any): DemoOrder {
  const child = Array.isArray(order.children) ? order.children[0] : order.children || {}
  const parent = Array.isArray(order.parents) ? order.parents[0] : order.parents || {}
  const shipmentsList = Array.isArray(order.shipments) ? order.shipments : []
  const paymentsList = Array.isArray(order.payments) ? order.payments : []
  const enrollmentsList = Array.isArray(order.enrollments) ? order.enrollments : []
  const enrollment = enrollmentsList[0] || {}
  const payment = paymentsList[0] || {}

  const mappedShipments: ShipmentAttempt[] = shipmentsList.map((shp: any) => ({
    id: shp.id,
    attemptNumber: shp.attempt_number || 1,
    isCurrentAttempt: shp.is_current_attempt ?? true,
    courierName: shp.courier || 'Steadfast',
    consignmentId: shp.consignment_id || '',
    trackingCode: shp.tracking_code || '',
    status: (shp.status || 'pending') as ShipmentStatus,
    codCollectionTarget: Number(shp.cod_target || 1080),
    refusalFeeStatus: (shp.refusal_fee_status || 'none') as RefusalFeeStatus,
    refusalFeeAmount: Number(shp.refusal_fee_amount || 0),
    courierReturnCost: Number(shp.courier_return_cost || 0),
    shippedAt: shp.shipped_at || shp.created_at,
    deliveredAt: shp.delivered_at,
    notes: shp.notes,
  }))

  const isPaid = payment.status === 'verified_reconciled' || payment.status === 'verified'
  const mappedPaymentStatus: PaymentStatus =
    payment.status === 'verified_reconciled'
      ? 'verified'
      : ((payment.status || 'pending') as PaymentStatus)

  return {
    id: order.id,
    orderNumber: order.order_number,
    parentId: order.parent_id,
    parentName: parent.full_name || 'অভিভাবক',
    parentPhone: parent.phone || order.shipping_phone || '',
    childId: order.child_id,
    childName: child.full_name || 'শিক্ষার্থী',
    childAge: child.age || 6,
    packageTitle: 'KidsEngregy সম্পূর্ণ লার্নিং প্যাকেজ (৪–১০ বছর)',
    packagePrice: Number(order.package_price || 990),
    deliveryFee: Number(order.delivery_fee || 90),
    totalAmount: Number(order.total_amount || 1080),
    shippingDistrict: order.shipping_district || 'ঢাকা',
    shippingThana: '',
    shippingAddress: order.shipping_address || '',
    recipientPhone: order.shipping_phone || parent.phone || '',
    orderStatus: (order.order_status || 'pending') as OrderStatus,
    paymentStatus: mappedPaymentStatus,
    reconciliationStatus: isPaid ? 'reconciled' : 'pending_reconciliation',
    createdAt: order.created_at,
    updatedAt: order.updated_at || order.created_at,
    shipments: mappedShipments,
    enrollmentStatus: enrollment.learning_access_activated ? 'active' : 'pending',
    enrollmentActivatedAt: enrollment.activated_at,
    whatsappStatus: enrollment.learning_access_activated ? 'link_revealed' : 'not_invited',
    classroomStatus: enrollment.learning_access_activated ? 'enrolled' : 'not_invited',
    selectedClassroomEmail:
      enrollment.selected_classroom_email || enrollment.classroom_email || parent.google_email || '',
    classroomEmailType: (enrollment.classroom_email_type || 'parent') as 'parent' | 'student',
    notes: order.notes || order.order_notes || child.notes,
  }
}

// 1. Fetch All Live Orders
export async function fetchLiveAdminOrders(): Promise<DemoOrder[]> {
  try {
    // Query live tables directly (orders uses `notes` column; avoids RPC column mismatch)
    const { data, error } = await supabase
      .from('orders')
      .select('*, children(*), parents(*), shipments(*), payments(*), enrollments(*)')
      .order('created_at', { ascending: false })

    if (!error && Array.isArray(data)) {
      return data.map(mapSupabaseOrderToDomain)
    }

    // Fallback to RPC if RLS restricts direct select
    const { data: rpcData, error: rpcError } = await supabase.rpc('admin_get_all_orders')
    if (!rpcError && Array.isArray(rpcData)) {
      return rpcData.map(mapSupabaseOrderToDomain)
    }

    if (error) console.warn('Direct order fetch warning:', error.message)
    if (rpcError) console.warn('RPC order fetch warning:', rpcError.message)
    return []
  } catch (err) {
    console.error('Fetch live orders error:', err)
    return []
  }
}

// 2. Fetch All Live Parents & Children
export async function fetchLiveAdminParents(): Promise<DemoParent[]> {
  try {
    const { data, error } = await supabase
      .from('parents')
      .select('*, children(*)')
      .order('created_at', { ascending: false })

    if (!error && Array.isArray(data)) {
      return data.map((p: any) => ({
        id: p.id,
        fullName: p.full_name,
        phone: p.phone,
        googleEmail: p.google_email,
        district: 'ঢাকা',
        thana: '',
        address: '',
        joinedAt: p.created_at,
        children: (p.children || []).map((c: any) => ({
          id: c.id,
          parentId: p.id,
          fullName: c.full_name,
          age: c.age,
          gender: 'other',
          gradeOrLevel: `${c.age} বছর`,
          notes: c.notes,
        })),
      }))
    }

    // Fallback to RPC if RLS restricts direct select
    const { data: rpcData, error: rpcError } = await supabase.rpc('admin_get_all_parents')
    if (!rpcError && Array.isArray(rpcData)) {
      return rpcData.map((p: any) => ({
        id: p.id,
        fullName: p.full_name,
        phone: p.phone,
        googleEmail: p.google_email,
        district: 'ঢাকা',
        thana: '',
        address: '',
        joinedAt: p.created_at,
        children: (p.children || []).map((c: any) => ({
          id: c.id,
          parentId: p.id,
          fullName: c.full_name,
          age: c.age,
          gender: 'other',
          gradeOrLevel: `${c.age} বছর`,
          notes: c.notes,
        })),
      }))
    }

    return []
  } catch (err) {
    console.error('Fetch live parents error:', err)
    return []
  }
}

// 3. Fetch All Live Reconciliation Batches
export async function fetchLiveAdminBatches(): Promise<ReconciliationBatch[]> {
  try {
    const { data, error } = await supabase
      .from('reconciliation_batches')
      .select('*, reconciliation_items(*)')
      .order('created_at', { ascending: false })

    if (!error && Array.isArray(data)) {
      return data.map((b: any) => ({
        id: b.id,
        batchNumber: b.batch_number,
        reconciliationDate: b.reconciled_date,
        courierInvoiceId: b.invoice_reference || '',
        courierName: b.courier || 'Steadfast',
        totalExpectedAmount: Number(b.total_expected_amount || 0),
        totalRemittedAmount: Number(b.total_remitted_amount || 0),
        discrepancyAmount: Number(b.discrepancy_amount || 0),
        parcelsCount: (b.reconciliation_items || []).length,
        status: b.status === 'reconciled' ? 'approved' : 'discrepancy',
        reconciledBy: 'অপারেশনস ম্যানেজার',
        reconciledAt: b.created_at,
        notes: b.notes,
        items: (b.reconciliation_items || []).map((item: any) => ({
          id: item.id,
          consignmentId: item.consignment_id,
          orderNumber: 'ম্যাচড অর্ডার',
          recipientName: 'শিক্ষার্থী',
          expectedAmount: Number(item.expected_amount || 0),
          remittedAmount: Number(item.remitted_amount || 0),
          discrepancy: Number(item.discrepancy_amount || 0),
          settlementStatus: item.match_status === 'matched' ? 'matched' : 'underpaid',
          shipmentStatus: 'delivered',
          notes: item.notes,
        })),
      }))
    }

    // Fallback to RPC if RLS restricts direct select
    const { data: rpcData, error: rpcError } = await supabase.rpc('admin_get_all_batches')
    if (!rpcError && Array.isArray(rpcData)) {
      return rpcData.map((b: any) => ({
        id: b.id,
        batchNumber: b.batch_number,
        reconciliationDate: b.reconciled_date,
        courierInvoiceId: b.invoice_reference || '',
        courierName: b.courier || 'Steadfast',
        totalExpectedAmount: Number(b.total_expected_amount || 0),
        totalRemittedAmount: Number(b.total_remitted_amount || 0),
        discrepancyAmount: Number(b.discrepancy_amount || 0),
        parcelsCount: (b.items || []).length,
        status: b.status === 'reconciled' ? 'approved' : 'discrepancy',
        reconciledBy: 'অপারেশনস ম্যানেজার',
        reconciledAt: b.created_at,
        notes: b.notes,
        items: (b.items || []).map((item: any) => ({
          id: item.id,
          consignmentId: item.consignment_id,
          orderNumber: 'ম্যাচড অর্ডার',
          recipientName: 'শিক্ষার্থী',
          expectedAmount: Number(item.expected_amount || 0),
          remittedAmount: Number(item.remitted_amount || 0),
          discrepancy: Number(item.discrepancy_amount || 0),
          settlementStatus: item.match_status === 'matched' ? 'matched' : 'underpaid',
          shipmentStatus: 'delivered',
          notes: item.notes,
        })),
      }))
    }

    return []
  } catch (err) {
    console.error('Fetch live batches error:', err)
    return []
  }
}

// 4. Mark Shipment Delivered in Supabase
export async function markLiveShipmentDelivered(orderId: string, shipmentId: string, notes?: string) {
  try {
    const { data, error } = await supabase.rpc('admin_mark_shipment_delivered', {
      p_order_id: orderId,
      p_shipment_id: shipmentId,
      p_notes: notes || null,
    })
    if (!error) return { success: true, data }

    // Fallback direct updates
    await supabase.from('shipments').update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      notes: notes || undefined,
    }).eq('id', shipmentId)

    await supabase.from('orders').update({
      order_status: 'delivered',
    }).eq('id', orderId)

    return { success: true }
  } catch (err: any) {
    console.error('Mark shipment delivered error:', err)
    return { success: false, error: err.message }
  }
}

// 5. Verify Refusal Fee in Supabase
export async function verifyLiveRefusalFee(
  orderId: string,
  shipmentId: string,
  verifiedStatus: 'verified_collected' | 'waived',
  notes: string
) {
  try {
    const { data, error } = await supabase.rpc('admin_verify_refusal_fee', {
      p_order_id: orderId,
      p_shipment_id: shipmentId,
      p_verified_status: verifiedStatus,
      p_notes: notes,
    })
    if (!error) return { success: true, data }

    await supabase.from('shipments').update({
      refusal_fee_status: verifiedStatus,
      notes: notes,
    }).eq('id', shipmentId)

    return { success: true }
  } catch (err: any) {
    console.error('Verify refusal fee error:', err)
    return { success: false, error: err.message }
  }
}

// 6. Redispatch Order in Supabase
export async function redispatchLiveOrder(
  orderId: string,
  consignmentId: string,
  trackingCode: string,
  courierReturnCost?: number,
  notes?: string
) {
  try {
    const { data, error } = await supabase.rpc('redispatch_order', {
      p_order_id: orderId,
      p_consignment_id: consignmentId,
      p_tracking_code: trackingCode,
      p_courier_return_cost: courierReturnCost || 60,
      p_notes: notes || 'রি-ডেসপ্যাচ',
    })
    if (error) {
      console.warn('Redispatch RPC warning:', error.message)
      return { success: false, error: error.message }
    }
    return { success: true, data }
  } catch (err: any) {
    console.error('Redispatch order error:', err)
    return { success: false, error: err.message }
  }
}

// 7. Daily Reconciliation in Supabase
export async function reconcileLiveDailyBatch(params: {
  invoiceId: string
  batchDate: string
  items: { consignmentId: string; remittedAmount: number }[]
  notes?: string
}) {
  try {
    const batchNumber = `REC-${params.batchDate.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`
    const { data, error } = await supabase.rpc('reconcile_daily_batch', {
      p_batch_number: batchNumber,
      p_invoice_reference: params.invoiceId,
      p_reconciled_by: null,
      p_items: params.items.map((it) => ({
        consignment_id: it.consignmentId,
        remitted_amount: it.remittedAmount,
      })),
      p_notes: params.notes || null,
    })

    if (error) {
      console.warn('Reconcile batch warning:', error.message)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      batchNumber: data?.batch_number || batchNumber,
      activatedCount: data?.activated_enrollments || 0,
      discrepancyCount: data?.discrepancies || 0,
    }
  } catch (err: any) {
    console.error('Reconcile daily batch error:', err)
    return { success: false, error: err.message }
  }
}

// 8. Update Classroom Email in Supabase
export async function updateLiveClassroomEmail(
  orderId: string,
  email: string,
  emailType: 'parent' | 'student'
) {
  try {
    const { error: directErr } = await supabase
      .from('enrollments')
      .update({
        selected_classroom_email: email.trim(),
        classroom_email_type: emailType,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)

    if (!directErr) return { success: true }

    const { error: rpcErr } = await supabase.rpc('admin_update_classroom_email', {
      p_order_id: orderId,
      p_email: email,
      p_email_type: emailType,
    })
    if (!rpcErr) return { success: true }

    return { success: false, error: directErr.message || rpcErr.message }
  } catch (err: any) {
    console.error('Update classroom email error:', err)
    return { success: false, error: err.message }
  }
}
