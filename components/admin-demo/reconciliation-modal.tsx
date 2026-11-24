'use client'

import React, { useState } from 'react'
import { X, FileCheck, CheckCircle2, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react'
import { useAdminDemo } from '@/lib/admin-demo/context'

interface ReconciliationModalProps {
  onClose: () => void
  onSuccess?: () => void
}

export function ReconciliationModal({ onClose, onSuccess }: ReconciliationModalProps) {
  const { orders, reconcileDailyBatch } = useAdminDemo()

  // Find orders that are delivered or in-transit with pending reconciliation
  const eligibleShipments = orders
    .map((o) => {
      const activeShp = o.shipments.find((s) => s.isCurrentAttempt)
      return {
        orderId: o.id,
        orderNumber: o.orderNumber,
        childName: o.childName,
        parentName: o.parentName,
        consignmentId: activeShp?.consignmentId || 'CID-ST-UNKNOWN',
        targetAmount: activeShp?.codCollectionTarget || 1080,
        shipmentStatus: activeShp?.status || 'pending',
        isDelivered: activeShp?.status === 'delivered',
        reconciliationStatus: o.reconciliationStatus,
      }
    })
    .filter((item) => item.reconciliationStatus === 'pending_reconciliation')

  const [invoiceId, setInvoiceId] = useState(`ST-INV-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-88`)
  const [batchDate, setBatchDate] = useState('2026-11-16')
  const [notes, setNotes] = useState('দৈনিক স্টেডফাস্ট ক্যাশ রেমিট্যান্স শিট যাচাইকরণ।')

  // Items editable in the batch
  const [remittanceRows, setRemittanceRows] = useState(
    eligibleShipments.slice(0, 4).map((s) => ({
      consignmentId: s.consignmentId,
      orderNumber: s.orderNumber,
      childName: s.childName,
      expected: s.targetAmount,
      remitted: s.targetAmount, // default matched
      isDelivered: s.isDelivered,
    }))
  )

  const [resultMessage, setResultMessage] = useState<string | null>(null)

  const handleSetExact = () => {
    setRemittanceRows((prev) => prev.map((r) => ({ ...r, remitted: r.expected })))
  }

  const handleSimulateDiscrepancy = () => {
    // Make the first row have an underpayment of ৳90
    setRemittanceRows((prev) =>
      prev.map((r, i) => (i === 0 ? { ...r, remitted: r.expected - 90 } : r))
    )
  }

  const handleRowChange = (index: number, val: number) => {
    setRemittanceRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, remitted: isNaN(val) ? 0 : val } : r))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const items = remittanceRows.map((r) => ({
      consignmentId: r.consignmentId,
      remittedAmount: r.remitted,
    }))

    const res = await reconcileDailyBatch({
      invoiceId,
      batchDate,
      items,
      notes,
    })

    if (res.success) {
      setResultMessage(
        `সফল! ব্যাচ #${res.batchNumber} প্রক্রিয়া সম্পন্ন হয়েছে। সক্রিয় শিক্ষার্থী: ${res.activatedCount} জন। ডিসক্রিপেন্সি: ${res.discrepancyCount} টি।`
      )
      setTimeout(() => {
        if (onSuccess) onSuccess()
        onClose()
      }, 1500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-emerald-950 text-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <FileCheck className="size-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">দৈনিক স্টেডফাস্ট রিকনসিলিয়েশন ব্যাচ (সিমুলেশন)</h3>
              <p className="text-xs text-emerald-300">ব্যাংক রেমিট্যান্স ও ডেলিভারি স্ট্যাটাস দ্বিমুখী যাচাই</p>
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
          {/* Dual-Gate Rule Box */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-950 text-xs flex items-start gap-2.5">
            <Sparkles className="size-4.5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">দ্বিমুখী শর্ত সক্রিয়করণ নীতি (Dual-Gate):</strong>
              <p className="text-[11px] mt-0.5 leading-relaxed text-blue-900">
                শুধুমাত্র যেসকল পার্সেল কুরিয়ার <strong>ডেলিভারি সম্পন্ন</strong> করেছে এবং যাদের রেমিট্যান্স
                টাকা কালেকশন টার্গেটের সাথে <strong>হুবহু ম্যাচ</strong> করেছে, তাদের লার্নিং অ্যাক্সেস
                স্বয়ংক্রিয়ভাবে <span className="font-bold text-emerald-700">Active</span> হবে। আংশিক জমা বা
                অপেক্ষমাণ থাকলে লকড থাকবে।
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="font-bold text-gray-700">ডেমো টেস্ট প্রি-সেট:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSetExact}
                className="px-2.5 py-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-semibold cursor-pointer text-[11px] transition-colors"
              >
                সবগুলো ম্যাচ করুন (সফল অ্যাক্টিভেশন)
              </button>
              <button
                type="button"
                onClick={handleSimulateDiscrepancy}
                className="px-2.5 py-1 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold cursor-pointer text-[11px] transition-colors"
              >
                ডিসক্রিপেন্সি টেস্ট (৳৯০ আংশিক জমা)
              </button>
            </div>
          </div>

          {/* Header Meta Inputs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">স্টেডফাস্ট ইনভয়েস ID:</label>
              <input
                type="text"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-english text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">রিকনসিলিয়েশন তারিখ:</label>
              <input
                type="date"
                value={batchDate}
                onChange={(e) => setBatchDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-english text-xs"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-gray-700 block">আজকের রেমিট্যান্স শিট পার্সেলসমূহ:</span>
            <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium text-[11px]">
                  <tr>
                    <th className="p-2.5">অর্ডার ও শিক্ষার্থী</th>
                    <th className="p-2.5">কনসাইনমেন্ট ID</th>
                    <th className="p-2.5">ডেলিভারি অবস্থা</th>
                    <th className="p-2.5 text-right">টার্গেট</th>
                    <th className="p-2.5 text-right w-28">প্রাপ্ত রেমিট্যান্স (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {remittanceRows.map((row, idx) => {
                    const diff = row.remitted - row.expected
                    const isMatched = diff === 0
                    return (
                      <tr key={row.consignmentId} className="hover:bg-gray-50/50">
                        <td className="p-2.5">
                          <div className="font-bold font-english text-gray-900">{row.orderNumber}</div>
                          <div className="text-[11px] text-gray-500">{row.childName}</div>
                        </td>
                        <td className="p-2.5 font-english text-gray-700 text-[11px]">
                          {row.consignmentId}
                        </td>
                        <td className="p-2.5">
                          {row.isDelivered ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                              <CheckCircle2 className="size-3" /> ডেলিভার্ড
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700">
                              ইন-ট্রানজিট
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right font-english font-bold text-gray-900">
                          ৳{row.expected}
                        </td>
                        <td className="p-2.5 text-right">
                          <input
                            type="number"
                            value={row.remitted}
                            onChange={(e) => handleRowChange(idx, parseFloat(e.target.value))}
                            className={`w-24 text-right px-2 py-1 rounded border text-xs font-english font-bold ${
                              isMatched
                                ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
                                : 'border-rose-400 bg-rose-50 text-rose-950'
                            }`}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1 text-xs">অ্যাডমিন নোট:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs"
            />
          </div>

          {resultMessage && (
            <div className="p-3 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-2 border border-emerald-300">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-700" />
              <span>{resultMessage}</span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              *সিমুলেটেড ব্যাচ প্রসেসিংয়ে স্টেট সাথে সাথে আপডেট হবে
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
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>ব্যাচ রিকনসাইল ও অ্যাক্টিভেট করুন</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
