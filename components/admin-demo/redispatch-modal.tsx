'use client'

import React, { useState } from 'react'
import { X, Truck, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { DemoOrder } from '@/lib/admin-demo/types'
import { useAdminDemo } from '@/lib/admin-demo/context'

interface RedispatchModalProps {
  order: DemoOrder | null
  onClose: () => void
  onSuccess?: () => void
}

export function RedispatchModal({ order, onClose, onSuccess }: RedispatchModalProps) {
  const { redispatchOrder } = useAdminDemo()

  const currentAttempt = order?.shipments.find((s) => s.isCurrentAttempt) || order?.shipments[0]
  const isFeeVerified =
    currentAttempt?.refusalFeeStatus === 'verified_collected' || currentAttempt?.refusalFeeStatus === 'waived'
  const nextTarget = isFeeVerified ? 990 : 1080
  const nextAttemptNum = (currentAttempt?.attemptNumber || 1) + 1

  const [consignmentId, setConsignmentId] = useState(
    `CID-ST-AUTO-${Math.floor(10000 + Math.random() * 90000)}`
  )
  const [trackingCode, setTrackingCode] = useState(
    `ST-TRK-AUTO-${Math.floor(100000 + Math.random() * 900000)}`
  )
  const [courierReturnCost, setCourierReturnCost] = useState('60')
  const [adminNotes, setAdminNotes] = useState('গ্রাহকের অনুরোধে সংশোধিত ঠিকানায় পুনরায় পাঠানো হলো।')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!order || !currentAttempt) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await redispatchOrder(
      order.id,
      consignmentId,
      trackingCode,
      parseFloat(courierReturnCost) || 60,
      adminNotes
    )

    setIsSubmitting(false)
    if (onSuccess) onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-emerald-950 text-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Truck className="size-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">একই অর্ডারে রি-ডেসপ্যাচ (সিমুলেশন)</h3>
              <p className="text-xs text-emerald-300">
                অর্ডার: <span className="font-english">{order.orderNumber}</span> ({order.childName})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Prior Attempt Status Summary */}
          <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-gray-800">
              <span>পূর্ববর্তী অ্যাটেম্পট (#{currentAttempt.attemptNumber}) স্ট্যাটাস:</span>
              <span className="text-rose-700 uppercase">{currentAttempt.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 border-t border-gray-200 pt-1.5">
              <div>
                <span className="text-gray-400 block">পূর্ববর্তী কালেকশন টার্গেট:</span>
                <span className="font-english font-bold">৳{currentAttempt.codCollectionTarget}</span>
              </div>
              <div>
                <span className="text-gray-400 block">দরজায় ৳৯০ ডেলিভারি ফি:</span>
                <strong
                  className={isFeeVerified ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}
                >
                  {isFeeVerified ? 'পরিশোধিত ও ভেরিফাইড (৳৯০)' : 'আদায় হয়নি (আনভেরিফাইড)'}
                </strong>
              </div>
            </div>
          </div>

          {/* Programmatic Financial Target Card */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isFeeVerified
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-amber-50/80 border-amber-300 text-amber-950'
            }`}
          >
            {isFeeVerified ? (
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <div className="font-bold text-sm">
                নতুন অ্যাটেম্পট #{nextAttemptNum} কালেকশন টার্গেট:{' '}
                <span className="font-english text-base underline decoration-2">৳{nextTarget}</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {isFeeVerified ? (
                  <>
                    গ্রাহক আগেরবার দরজায় কুরিয়ারকে ৳৯০ ডেলিভারি ফি দিয়েছেন। সুতরাং তাকে ২য় বার ডেলিভারি চার্জ
                    দিতে হবে না; এবার কুরিয়ার কেবল বইয়ের মূল মূল্য <strong>৳৯৯০</strong> আদায় করবে।
                  </>
                ) : (
                  <>
                    আগেরবার দরজায় ৳৯০ ডেলিভারি ফি আদায় হয়নি। তাই নতুন অ্যাটেম্পটে সম্পূর্ণ প্যাকেজ ও ডেলিভারি ফি
                    মিলে <strong>৳১,০৮০</strong> আদায় করতে হবে।
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                নতুন স্টেডফাস্ট কনসাইনমেন্ট ID (স্বয়ংক্রিয় বা কাস্টম):
              </label>
              <input
                type="text"
                value={consignmentId}
                onChange={(e) => setConsignmentId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 font-english text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">স্টেডফাস্ট ট্র্যাকিং কোড:</label>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 font-english text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  স্টেডফাস্ট রিটার্ন খরচ (৳):
                </label>
                <input
                  type="number"
                  value={courierReturnCost}
                  onChange={(e) => setCourierReturnCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 font-english text-xs"
                />
                <span className="text-[10px] text-gray-400">অভ্যন্তরীণ অপারেশনাল খরচ</span>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">ডেলিভারি টার্গেট:</label>
                <div className="px-3 py-2 rounded-lg bg-gray-100 font-english font-bold text-emerald-900 border border-gray-200">
                  ৳{nextTarget} (ক্যাশ অন ডেলিভারি)
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">অ্যাডমিন নোট:</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              *একই অর্ডার নম্বরে অ্যাটেম্পট ২ তৈরি হবে
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>রি-ডেসপ্যাচ নিশ্চিত করুন</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
