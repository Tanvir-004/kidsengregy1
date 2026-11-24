export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_transit'
  | 'delivered'
  | 'returned'
  | 'cancelled'

export type PaymentStatus =
  | 'pending'
  | 'collected_by_courier'
  | 'verified'
  | 'failed'
  | 'refunded'

export type ReconciliationStatus =
  | 'pending_reconciliation'
  | 'reconciled'
  | 'discrepancy'

export type ShipmentStatus =
  | 'pending'
  | 'packed'
  | 'in_transit'
  | 'delivered'
  | 'refused'
  | 'returned'
  | 'cancelled'

export type RefusalFeeStatus =
  | 'none'
  | 'uncollected'
  | 'reported_collected'
  | 'verified_collected'
  | 'waived'

export type EnrollmentAccessStatus = 'pending' | 'active' | 'revoked'

export type WhatsAppStatus = 'not_invited' | 'link_revealed' | 'joined' | 'revoked'

export type ClassroomStatus = 'not_invited' | 'invited' | 'enrolled' | 'removed'

export interface ShipmentAttempt {
  id: string
  attemptNumber: number
  isCurrentAttempt: boolean
  courierName: string
  consignmentId: string
  trackingCode: string
  status: ShipmentStatus
  codCollectionTarget: number
  refusalFeeStatus: RefusalFeeStatus
  refusalFeeAmount: number
  refusalFeeReference?: string
  refusalFeeVerifiedAt?: string
  refusalFeeVerifiedBy?: string
  courierReturnCost?: number
  failureReason?: string
  shippedAt?: string
  deliveredAt?: string
  returnedAt?: string
  notes?: string
}

export interface DemoChild {
  id: string
  parentId: string
  fullName: string
  age: number
  gender: 'male' | 'female' | 'other'
  studentGoogleEmail?: string
  gradeOrLevel: string
  notes?: string
}

export interface DemoParent {
  id: string
  fullName: string
  phone: string
  googleEmail: string
  district: string
  thana: string
  address: string
  children: DemoChild[]
  joinedAt: string
}

export interface DemoOrder {
  id: string
  orderNumber: string
  parentId: string
  parentName: string
  parentPhone: string
  childId: string
  childName: string
  childAge: number
  packageTitle: string
  packagePrice: number
  deliveryFee: number
  totalAmount: number
  shippingDistrict: string
  shippingThana: string
  shippingAddress: string
  recipientPhone: string
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  reconciliationStatus: ReconciliationStatus
  reconciledBatchId?: string
  createdAt: string
  updatedAt: string
  shipments: ShipmentAttempt[]
  enrollmentStatus: EnrollmentAccessStatus
  enrollmentActivatedAt?: string
  whatsappStatus: WhatsAppStatus
  whatsappLinkRevealedAt?: string
  classroomStatus: ClassroomStatus
  selectedClassroomEmail: string
  classroomEmailType: 'parent' | 'student'
  notes?: string
}

export interface ReconciliationLineItem {
  id: string
  consignmentId: string
  orderNumber: string
  recipientName: string
  expectedAmount: number
  remittedAmount: number
  discrepancy: number
  settlementStatus: 'matched' | 'underpaid' | 'overpaid' | 'unmatched' | 'manually_resolved'
  shipmentStatus: ShipmentStatus
  notes?: string
}

export interface ReconciliationBatch {
  id: string
  batchNumber: string
  reconciliationDate: string
  courierInvoiceId: string
  courierName: string
  totalExpectedAmount: number
  totalRemittedAmount: number
  discrepancyAmount: number
  parcelsCount: number
  status: 'draft' | 'balanced' | 'discrepancy' | 'approved'
  reconciledBy: string
  reconciledAt: string
  notes?: string
  items: ReconciliationLineItem[]
}
