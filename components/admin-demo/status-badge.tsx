import React from 'react'
import {
  OrderStatus,
  PaymentStatus,
  ReconciliationStatus,
  EnrollmentAccessStatus,
  RefusalFeeStatus,
  ShipmentStatus,
} from '@/lib/admin-demo/types'

interface BadgeProps {
  type: 'order' | 'payment' | 'reconciliation' | 'enrollment' | 'refusalFee' | 'shipment'
  value: string
  className?: string
}

export function StatusBadge({ type, value, className = '' }: BadgeProps) {
  let label = value
  let colorStyles = 'bg-gray-100 text-gray-700 border-gray-200'

  if (type === 'order') {
    const val = value as OrderStatus
    switch (val) {
      case 'pending':
        label = 'নতুন অপেক্ষমাণ'
        colorStyles = 'bg-amber-50 text-amber-800 border-amber-200'
        break
      case 'confirmed':
        label = 'কনফার্মড'
        colorStyles = 'bg-blue-50 text-blue-800 border-blue-200'
        break
      case 'in_transit':
        label = 'ইন-ট্রানজিট'
        colorStyles = 'bg-purple-50 text-purple-800 border-purple-200'
        break
      case 'delivered':
        label = 'ডেলিভারি সম্পন্ন'
        colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200'
        break
      case 'returned':
        label = 'রিটার্নড / রিফিউজড'
        colorStyles = 'bg-rose-50 text-rose-800 border-rose-200'
        break
      case 'cancelled':
        label = 'অর্ডার বাতিল'
        colorStyles = 'bg-zinc-100 text-zinc-600 border-zinc-200'
        break
    }
  } else if (type === 'payment') {
    const val = value as PaymentStatus
    switch (val) {
      case 'pending':
        label = 'ক্যাশ অন ডেলিভারি (বকেয়া)'
        colorStyles = 'bg-amber-50 text-amber-800 border-amber-200'
        break
      case 'collected_by_courier':
        label = 'কুরিয়ারে ক্যাশ জমা'
        colorStyles = 'bg-sky-50 text-sky-800 border-sky-200'
        break
      case 'verified':
        label = 'পেমেন্ট ভেরিফাইড'
        colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200'
        break
      case 'failed':
        label = 'পেমেন্ট ব্যর্থ'
        colorStyles = 'bg-rose-50 text-rose-800 border-rose-200'
        break
      case 'refunded':
        label = 'রিফান্ডেড'
        colorStyles = 'bg-zinc-100 text-zinc-700 border-zinc-200'
        break
    }
  } else if (type === 'reconciliation') {
    const val = value as ReconciliationStatus
    switch (val) {
      case 'pending_reconciliation':
        label = 'রিকনসিলিয়েশন অপেক্ষমাণ'
        colorStyles = 'bg-amber-50 text-amber-800 border-amber-200'
        break
      case 'reconciled':
        label = 'রিকনসাইল্ড'
        colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200'
        break
      case 'discrepancy':
        label = 'অমিল / ডিসক্রিপেন্সি'
        colorStyles = 'bg-rose-50 text-rose-800 border-rose-200'
        break
    }
  } else if (type === 'enrollment') {
    const val = value as EnrollmentAccessStatus
    switch (val) {
      case 'active':
        label = 'লার্নিং অ্যাক্টিভ'
        colorStyles = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold'
        break
      case 'pending':
        label = 'অ্যাক্সেস লকড (অপেক্ষমাণ)'
        colorStyles = 'bg-amber-50 text-amber-800 border-amber-200'
        break
      case 'revoked':
        label = 'অ্যাক্সেস বাতিল'
        colorStyles = 'bg-rose-50 text-rose-800 border-rose-200'
        break
    }
  } else if (type === 'refusalFee') {
    const val = value as RefusalFeeStatus
    switch (val) {
      case 'verified_collected':
        label = '৳৯০ সংগৃহীত ও ভেরিফাইড'
        colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200'
        break
      case 'reported_collected':
        label = '৳৯০ সংগৃহীত (অপেক্ষমাণ)'
        colorStyles = 'bg-sky-50 text-sky-800 border-sky-200'
        break
      case 'uncollected':
        label = 'ফি সংগৃহীত হয়নি'
        colorStyles = 'bg-rose-50 text-rose-800 border-rose-200'
        break
      case 'waived':
        label = 'ফি মওকুফ'
        colorStyles = 'bg-zinc-100 text-zinc-700 border-zinc-200'
        break
      case 'none':
        label = 'প্রযোজ্য নয়'
        colorStyles = 'bg-gray-50 text-gray-500 border-gray-200'
        break
    }
  } else if (type === 'shipment') {
    const val = value as ShipmentStatus
    switch (val) {
      case 'pending':
        label = 'প্রস্তুতির অপেক্ষায়'
        colorStyles = 'bg-gray-100 text-gray-700 border-gray-200'
        break
      case 'packed':
        label = 'প্যাকড (হস্তান্তরের অপেক্ষায়)'
        colorStyles = 'bg-amber-50 text-amber-800 border-amber-200'
        break
      case 'in_transit':
        label = 'কুরিয়ার ইন-ট্রানজিট'
        colorStyles = 'bg-purple-50 text-purple-800 border-purple-200'
        break
      case 'delivered':
        label = 'ডেলিভার্ড'
        colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200'
        break
      case 'refused':
      case 'returned':
        label = 'রিটার্নড / রিফিউজড'
        colorStyles = 'bg-rose-50 text-rose-800 border-rose-200'
        break
      case 'cancelled':
        label = 'বাতিল'
        colorStyles = 'bg-zinc-100 text-zinc-600 border-zinc-200'
        break
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorStyles} ${className}`}
    >
      {label}
    </span>
  )
}
