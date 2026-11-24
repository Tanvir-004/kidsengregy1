'use client'

import React, { useState } from 'react'
import {
  FileCheck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Coins,
  Calendar,
  Sparkles,
  Eye,
  X,
  ShieldCheck,
} from 'lucide-react'
import { useAdminDemo } from '@/lib/admin-demo/context'
import { AdminTopbar } from '@/components/admin-demo/admin-topbar'
import { StatusBadge } from '@/components/admin-demo/status-badge'
import { ReconciliationModal } from '@/components/admin-demo/reconciliation-modal'
import { ReconciliationBatch } from '@/lib/admin-demo/types'

export default function AdminReconciliationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inspectedBatch, setInspectedBatch] = useState<ReconciliationBatch | null>(null)

  const { batches, orders } = useAdminDemo()

  // Calculate live reconciliation totals
  const totalExpectedAll = batches.reduce((sum, b) => sum + b.totalExpectedAmount, 0)
  const totalRemittedAll = batches.reduce((sum, b) => sum + b.totalRemittedAmount, 0)
  const totalDiscrepanciesAll = batches.reduce((sum, b) => sum + Math.abs(b.discrepancyAmount), 0)

  // Orders waiting for reconciliation
  const pendingOrders = orders.filter(
    (o) => o.reconciliationStatus === 'pending_reconciliation' && o.paymentStatus === 'collected_by_courier'
  )

  return (
    <>
      <AdminTopbar
        title="দৈনিক স্টেডফাস্ট রিকনসিলিয়েশন"
        subtitle="কুরিয়ার ব্যাংক রেমিট্যান্স ম্যাচিং ও দ্বিমুখী লার্নিং অ্যাক্টিভেশন"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Top Summary Banner */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <FileCheck className="size-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                দৈনিক রিকনসিলিয়েশন ব্যাচ ইঞ্জিন (Daily Settlement Engine)
              </h2>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                প্রতিদিন বিকালে স্টেডফাস্ট থেকে প্রাপ্ত রেমিট্যান্স শিট আপলোড/ম্যাচ করার পর অনুমোদিত হলেই
                কেবল শিক্ষার্থীর লার্নিং অ্যাক্সেস আনলক হয়।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="size-4" />
            <span>নতুন দৈনিক ব্যাচ চালান (সিমুলেশন)</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
              মোট প্রসেসকৃত ব্যাচ
            </span>
            <div className="text-2xl font-bold font-english text-gray-900">
              {batches.length} টি ব্যাচ
            </div>
            <span className="text-[11px] text-gray-400">স্টেডফাস্ট রেমিট্যান্স ইনভয়েস</span>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
              মোট প্রত্যাশিত COD
            </span>
            <div className="text-2xl font-bold font-english text-gray-900">
              ৳{totalExpectedAll.toLocaleString('en-US')}
            </div>
            <span className="text-[11px] text-gray-400">ডেলিভার্ড পার্সেল টার্গেট</span>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
              মোট রেমitted জমা
            </span>
            <div className="text-2xl font-bold font-english text-emerald-800">
              ৳{totalRemittedAll.toLocaleString('en-US')}
            </div>
            <span className="text-[11px] text-emerald-600">ব্যাংক অ্যাকাউন্টে প্রাপ্ত</span>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1 shadow-xs">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
              মোট অমিল (Discrepancy)
            </span>
            <div
              className={`text-2xl font-bold font-english ${
                totalDiscrepanciesAll > 0 ? 'text-rose-700' : 'text-emerald-700'
              }`}
            >
              ৳{totalDiscrepanciesAll.toLocaleString('en-US')}
            </div>
            <span className="text-[11px] text-gray-400">
              {totalDiscrepanciesAll > 0 ? 'রিভিউ ও সমাধান প্রয়োজন' : 'শতভাগ ম্যাচড'}
            </span>
          </div>
        </div>

        {/* Pending Orders Notice for Today */}
        {pendingOrders.length > 0 && (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
              <div>
                <strong>আজকের রিকনসিলিয়েশনের জন্য অপেক্ষমাণ:</strong>{' '}
                <span className="font-english font-bold">{pendingOrders.length}</span> টি পার্সেল কুরিয়ার
                গ্রাহককে পৌঁছে দিয়েছে কিন্তু রেমিট্যান্স ম্যাচ এখনো বাকি।
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer transition-colors"
            >
              এখনই রিকনসাইল করুন
            </button>
          </div>
        )}

        {/* Batch History Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs space-y-0">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">দৈনিক রিকনসিলিয়েশন ব্যাচ হিস্ট্রি</h3>
            <span className="text-xs text-gray-500">স্টেডফাস্ট কুরিয়ার প্রতিদিনের শিট</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">ব্যাচ নম্বর ও তারিখ</th>
                  <th className="p-3.5">স্টেডফাস্ট ইনভয়েস ID</th>
                  <th className="p-3.5 text-center">পার্সেল সংখ্যা</th>
                  <th className="p-3.5 text-right">প্রত্যাশিত COD</th>
                  <th className="p-3.5 text-right">প্রাপ্ত রেমিট্যান্স</th>
                  <th className="p-3.5 text-right">অমিল / ডিসক্রিপেন্সি</th>
                  <th className="p-3.5">ব্যাচ স্ট্যাটাস</th>
                  <th className="p-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-3.5">
                      <div className="font-english font-bold text-gray-900">{batch.batchNumber}</div>
                      <div className="text-[11px] text-gray-400">{batch.reconciliationDate}</div>
                    </td>
                    <td className="p-3.5 font-english font-medium text-gray-800">
                      {batch.courierInvoiceId}
                    </td>
                    <td className="p-3.5 text-center font-english font-bold text-gray-700">
                      {batch.parcelsCount}
                    </td>
                    <td className="p-3.5 text-right font-english font-bold text-gray-900">
                      ৳{batch.totalExpectedAmount}
                    </td>
                    <td className="p-3.5 text-right font-english font-bold text-emerald-800">
                      ৳{batch.totalRemittedAmount}
                    </td>
                    <td className="p-3.5 text-right font-english font-bold">
                      <span
                        className={
                          batch.discrepancyAmount === 0 ? 'text-emerald-700' : 'text-rose-700'
                        }
                      >
                        ৳{batch.discrepancyAmount}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          batch.status === 'balanced'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {batch.status === 'balanced' ? 'ব্যালান্সড (অনুমোদিত)' : 'ডিসক্রিপেন্সি'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectedBatch(batch)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium cursor-pointer"
                      >
                        <Eye className="size-3.5" />
                        <span>লাইন আইটেম ({batch.items.length})</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Batch Line Items Inspection Drawer / Modal */}
      {inspectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-emerald-950 text-white">
              <div>
                <h3 className="font-bold text-sm sm:text-base">
                  ব্যাচ ডিটেইলস: <span className="font-english">{inspectedBatch.batchNumber}</span>
                </h3>
                <p className="text-xs text-emerald-300">
                  ইনভয়েস: <span className="font-english">{inspectedBatch.courierInvoiceId}</span> |{' '}
                  {inspectedBatch.reconciliationDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedBatch(null)}
                className="p-1.5 rounded-lg text-emerald-300 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex justify-between">
                <div>
                  <span className="text-gray-500">রিকনসাইল্ড বাই:</span>{' '}
                  <strong>{inspectedBatch.reconciledBy}</strong>
                </div>
                <div>
                  <span className="text-gray-500">সময়:</span>{' '}
                  <span className="font-english">{inspectedBatch.reconciledAt}</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-[11px]">
                    <tr>
                      <th className="p-2.5">অর্ডার ও প্রাপক</th>
                      <th className="p-2.5">কনসাইনমেন্ট ID</th>
                      <th className="p-2.5 text-right">প্রত্যাশিত</th>
                      <th className="p-2.5 text-right">প্রাপ্ত</th>
                      <th className="p-2.5">সেটেলমেন্ট স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inspectedBatch.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2.5">
                          <div className="font-bold font-english text-gray-900">
                            {item.orderNumber}
                          </div>
                          <div className="text-[11px] text-gray-500">{item.recipientName}</div>
                        </td>
                        <td className="p-2.5 font-english text-gray-700">{item.consignmentId}</td>
                        <td className="p-2.5 text-right font-english font-bold text-gray-900">
                          ৳{item.expectedAmount}
                        </td>
                        <td className="p-2.5 text-right font-english font-bold text-emerald-800">
                          ৳{item.remittedAmount}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              item.settlementStatus === 'matched'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.settlementStatus === 'matched' ? 'ম্যাচড' : 'অমিল (Underpaid)'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50">
              <button
                type="button"
                onClick={() => setInspectedBatch(null)}
                className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-100"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reconciliation Modal */}
      {isModalOpen && <ReconciliationModal onClose={() => setIsModalOpen(false)} />}
    </>
  )
}
