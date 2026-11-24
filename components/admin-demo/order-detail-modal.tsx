'use client'

import React from 'react'
import {
  X,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageCircle,
  Mail,
} from 'lucide-react'
import { DemoOrder } from '@/lib/admin-demo/types'
import { StatusBadge } from './status-badge'
import { useAdminDemo } from '@/lib/admin-demo/context'

interface OrderDetailModalProps {
  order: DemoOrder | null
  onClose: () => void
  onOpenRedispatch?: (order: DemoOrder) => void
}

export function OrderDetailModal({ order, onClose, onOpenRedispatch }: OrderDetailModalProps) {
  const { markDelivered } = useAdminDemo()

  if (!order) return null

  const activeShipment = order.shipments.find((s) => s.isCurrentAttempt) || order.shipments[0]
  const canMarkDelivered = activeShipment && activeShipment.status !== 'delivered' && activeShipment.status !== 'returned'
  const isReturned = order.orderStatus === 'returned' || activeShipment?.status === 'returned'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/50 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold font-english text-gray-900">{order.orderNumber}</span>
              <StatusBadge type="order" value={order.orderStatus} />
              <StatusBadge type="enrollment" value={order.enrollmentStatus} />
            </div>
            <p className="text-xs text-gray-500 mt-1">অর্ডার তৈরির তারিখ: {order.createdAt}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Dual-Gate Learning Status Notice */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              order.enrollmentStatus === 'active'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            {order.enrollmentStatus === 'active' ? (
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Clock className="size-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs sm:text-sm">
              <div className="font-bold">
                {order.enrollmentStatus === 'active'
                  ? 'লার্নিং অ্যাক্সেস সক্রিয় (অনুমোদিত)'
                  : 'লার্নিং অ্যাক্সেস লকড (শর্ত অপেক্ষমাণ)'}
              </div>
              <p className="text-xs mt-0.5 opacity-90">
                {order.enrollmentStatus === 'active'
                  ? `ফনিক্স বই ডেলিভারি এবং স্টেডফাস্ট রেমিট্যান্স উভয়ই যাচাই করা হয়েছে (${order.enrollmentActivatedAt}-এ সক্রিয়)।`
                  : 'দ্বিমুখী শর্ত নীতি: ফনিক্স বই ডেলিভারি সম্পন্ন হতে হবে এবং দৈনিক রেমিট্যান্স শিটে টাকা ম্যাচ হতে হবে।'}
              </p>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student & Parent Info */}
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <User className="size-4 text-emerald-600" />
                <span>শিক্ষার্থী ও অভিভাবক</span>
              </div>
              <div className="text-xs space-y-1.5">
                <div>
                  <span className="text-gray-500">শিক্ষার্থীর নাম:</span>{' '}
                  <strong className="text-gray-900 text-sm">{order.childName}</strong>{' '}
                  <span className="text-gray-500">({order.childAge} বছর)</span>
                </div>
                <div>
                  <span className="text-gray-500">অভিভাবক:</span>{' '}
                  <strong className="text-gray-900">{order.parentName}</strong>
                </div>
                <div>
                  <span className="text-gray-500">মোবাইল:</span>{' '}
                  <span className="font-english font-medium text-gray-900">{order.parentPhone}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <MapPin className="size-4 text-emerald-600" />
                <span>ফনিক্স বই পাঠানোর ঠিকানা</span>
              </div>
              <div className="text-xs space-y-1.5">
                <div>
                  <span className="text-gray-500">জেলা ও থানা:</span>{' '}
                  <strong className="text-gray-900">
                    {order.shippingDistrict}, {order.shippingThana}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500">বিস্তারিত ঠিকানা:</span>{' '}
                  <span className="text-gray-900">{order.shippingAddress}</span>
                </div>
                <div>
                  <span className="text-gray-500">যোগাযোগ নম্বর:</span>{' '}
                  <span className="font-english font-medium text-gray-900">{order.recipientPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 rounded-xl border border-gray-100 bg-emerald-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <CreditCard className="size-4 text-emerald-600" />
                <span>আর্থিক হিসাব (ক্যাশ অন ডেলিভারি - COD)</span>
              </div>
              <StatusBadge type="payment" value={order.paymentStatus} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-emerald-100">
              <div>
                <span className="text-gray-500 block">কোর্স ও বই মূল্য:</span>
                <span className="font-english font-bold text-gray-900 text-sm">৳{order.packagePrice}</span>
              </div>
              <div>
                <span className="text-gray-500 block">কুরিয়ার ডেলিভারি ফি:</span>
                <span className="font-english font-bold text-gray-900 text-sm">৳{order.deliveryFee}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 block">সর্বমোট প্রদেয়:</span>
                <span className="font-english font-extrabold text-emerald-950 text-base">
                  ৳{order.totalAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Multi-Attempt Shipment History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <Truck className="size-4 text-emerald-600" />
                <span>স্টেডফাস্ট শিপমেন্ট হিস্ট্রি ({order.shipments.length}টি অ্যাটেম্পট)</span>
              </div>
              {isReturned && onOpenRedispatch && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenRedispatch(order)
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                >
                  একই অর্ডারে রি-ডেসপ্যাচ করুন
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {order.shipments.map((shp) => (
                <div
                  key={shp.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    shp.isCurrentAttempt
                      ? 'bg-white border-emerald-300 ring-2 ring-emerald-500/10'
                      : 'bg-gray-50/70 border-gray-200 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 font-english">
                        অ্যাটেম্পট #{shp.attemptNumber}
                      </span>
                      {shp.isCurrentAttempt && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          বর্তমান সক্রিয়
                        </span>
                      )}
                      <StatusBadge type="shipment" value={shp.status} />
                    </div>
                    <div className="text-gray-500">
                      কালেকশন টার্গেট:{' '}
                      <strong className="text-emerald-900 font-english">
                        ৳{shp.codCollectionTarget}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 text-gray-600 border-t border-gray-100">
                    <div>
                      <span className="text-gray-400 block">কনসাইনমেন্ট ID:</span>
                      <span className="font-english font-medium text-gray-800">
                        {shp.consignmentId}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">ট্র্যাকিং কোড:</span>
                      <span className="font-english font-medium text-gray-800">
                        {shp.trackingCode}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">ডেলিভারি অবস্থা:</span>
                      <span>
                        {shp.deliveredAt ? `সম্পন্ন (${shp.deliveredAt})` : 'অপেক্ষমাণ'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">দরজায় ৳৯০ ফি:</span>
                      <StatusBadge type="refusalFee" value={shp.refusalFeeStatus} />
                    </div>
                  </div>

                  {shp.failureReason && (
                    <div className="p-2 rounded bg-rose-50 text-rose-800 text-[11px] border border-rose-100">
                      <strong>রিটার্ন/রিফিউজালের কারণ:</strong> {shp.failureReason}
                      {shp.refusalFeeReference && (
                        <span className="block mt-0.5 text-gray-500">
                          ভাউচার রেফারেন্স: {shp.refusalFeeReference}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Community Channels Access */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              কমিউনিটি ও ক্লাস চ্যানেল (স্বতন্ত্র ট্র্যাকিং)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white border border-gray-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <MessageCircle className="size-4 text-emerald-600" />
                  <span>WhatsApp লার্নিং গ্রুপ</span>
                </div>
                <div className="text-gray-600">
                  স্ট্যাটাস:{' '}
                  {order.whatsappStatus === 'joined' ? (
                    <strong className="text-emerald-700">যুক্ত হয়েছেন</strong>
                  ) : order.whatsappStatus === 'link_revealed' ? (
                    <strong className="text-blue-700">লিংক উন্মুক্ত</strong>
                  ) : (
                    <span className="text-gray-400">অ্যাক্সেস লকড</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white border border-gray-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-800">
                  <Mail className="size-4 text-blue-600" />
                  <span>Google Classroom ইনভাইটেশন</span>
                </div>
                <div className="text-gray-600 truncate">
                  ইমেইল: <strong className="font-english">{order.selectedClassroomEmail}</strong>
                </div>
                <div className="text-[11px] text-gray-400">
                  টাইপ: {order.classroomEmailType === 'student' ? 'শিক্ষার্থীর জিমেইল' : 'অভিভাবকের জিমেইল'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-2xl">
          <div className="text-xs text-gray-500">
            {canMarkDelivered && 'কুরিয়ার পার্সেল হ্যান্ডওভার করলে নিচের বোতাম চাপুন'}
          </div>
          <div className="flex items-center gap-2">
            {canMarkDelivered && (
              <button
                type="button"
                onClick={() => {
                  markDelivered(order.id, activeShipment.id, 'ডেমো ইন্টারঅ্যাকশনে ডেলিভার্ড মার্ক করা হয়েছে')
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="size-4" />
                <span>ডেলিভারি সম্পন্ন মার্ক করুন (সিমুলেশন)</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-medium cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
