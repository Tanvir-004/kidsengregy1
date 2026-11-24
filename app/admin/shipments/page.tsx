'use client'

import React, { useState } from 'react'
import {
  Truck,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react'
import { useAdminDemo } from '@/lib/admin-demo/context'
import { AdminTopbar } from '@/components/admin-demo/admin-topbar'
import { StatusBadge } from '@/components/admin-demo/status-badge'
import { OrderDetailModal } from '@/components/admin-demo/order-detail-modal'
import { RedispatchModal } from '@/components/admin-demo/redispatch-modal'
import { DemoOrder, ShipmentAttempt } from '@/lib/admin-demo/types'

export default function AdminShipmentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<DemoOrder | null>(null)
  const [redispatchTargetOrder, setRedispatchTargetOrder] = useState<DemoOrder | null>(null)

  const { orders, markDelivered, verifyRefusalFee } = useAdminDemo()

  // Flatten shipments with order details for unified logistics table
  const allShipmentItems = orders.flatMap((order) =>
    order.shipments.map((shp) => ({
      ...shp,
      orderId: order.id,
      orderNumber: order.orderNumber,
      childName: order.childName,
      parentName: order.parentName,
      parentPhone: order.parentPhone,
      shippingDistrict: order.shippingDistrict,
      shippingAddress: order.shippingAddress,
      orderStatus: order.orderStatus,
      enrollmentStatus: order.enrollmentStatus,
      fullOrder: order,
    }))
  )

  const filteredItems = allShipmentItems.filter((item) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      item.orderNumber.toLowerCase().includes(q) ||
      item.consignmentId.toLowerCase().includes(q) ||
      item.trackingCode.toLowerCase().includes(q) ||
      item.childName.toLowerCase().includes(q) ||
      item.shippingDistrict.toLowerCase().includes(q)

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'current' && item.isCurrentAttempt) ||
      item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <>
      <AdminTopbar
        title="স্টেডফাস্ট লজিস্টিকস ও কুরিয়ার ট্র্যাকিং"
        subtitle="সিমুলেটেড কুরিয়ার স্ট্যাটাস (স্টেডফাস্ট ডেমো) — মাল্টি-অ্যাটেম্পট ও রি-ডেসপ্যাচ"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Banner: Simulated Courier Status */}
        <div className="bg-purple-900/10 border border-purple-900/20 rounded-xl p-4 text-xs text-purple-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Truck className="size-5 text-purple-700 shrink-0" />
            <div>
              <strong className="block text-sm">সিমুলেটেড কুরিয়ার ট্র্যাকিং (স্টেডফাস্ট ডেমো)</strong>
              <p className="text-[11px] text-purple-800 opacity-90 mt-0.5">
                V1-এ কোনো লাইভ কুরিয়ার API সংযুক্ত নয়। অ্যাডমিন ম্যানুয়ালি কনসাইনমেন্ট কোড ইনপুট করেন এবং স্ট্যাটাস আপডেট করেন।
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-purple-700 text-white font-bold text-[11px] shrink-0">
            ম্যানুয়াল কনসাইনমেন্ট ডেমো
          </span>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="কনসাইনমেন্ট ID, ট্র্যাকিং কোড, অর্ডার বা জেলা খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
              {[
                { label: 'সকল অ্যাটেম্পট', value: 'all' },
                { label: 'বর্তমান সক্রিয়', value: 'current' },
                { label: 'ইন-ট্রানজিট', value: 'in_transit' },
                { label: 'ডেলিভার্ড', value: 'delivered' },
                { label: 'রিটার্নড', value: 'returned' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium cursor-pointer transition-colors ${
                    statusFilter === tab.value
                      ? 'bg-purple-800 text-white font-semibold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">অর্ডার ও শিক্ষার্থী</th>
                  <th className="p-3.5">কনসাইনমেন্ট ID ও ট্র্যাকিং</th>
                  <th className="p-3.5">অ্যাটেম্পট</th>
                  <th className="p-3.5 text-right">COD টার্গেট</th>
                  <th className="p-3.5">কুরিয়ার স্ট্যাটাস</th>
                  <th className="p-3.5">দরজায় ৳৯০ রিফিউজাল ফি</th>
                  <th className="p-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => {
                  const isCurrent = item.isCurrentAttempt
                  const isReturned = item.status === 'returned' || item.status === 'refused'
                  const canDeliver = item.status !== 'delivered' && !isReturned

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50/60 transition-colors ${
                        isCurrent ? 'bg-white' : 'bg-gray-50/40 opacity-75'
                      }`}
                    >
                      {/* Order & Child */}
                      <td className="p-3.5">
                        <div className="font-english font-bold text-gray-900">{item.orderNumber}</div>
                        <div className="text-sm font-bold text-gray-800">{item.childName}</div>
                        <div className="text-[11px] text-gray-500">
                          {item.shippingDistrict} ({item.parentPhone})
                        </div>
                      </td>

                      {/* Consignment & Tracking */}
                      <td className="p-3.5 font-english">
                        <div className="font-bold text-gray-900">{item.consignmentId}</div>
                        <div className="text-[11px] text-gray-500">{item.trackingCode}</div>
                        <div className="text-[10px] text-purple-700 font-medium">স্টেডফাস্ট কুরিয়ার</div>
                      </td>

                      {/* Attempt Number */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-english font-bold text-gray-900">
                            #{item.attemptNumber}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              বর্তমান
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {item.shippedAt ? `প্রেরণ: ${item.shippedAt.substring(0, 10)}` : ''}
                        </div>
                      </td>

                      {/* COD Target */}
                      <td className="p-3.5 text-right">
                        <div className="font-english font-extrabold text-emerald-950 text-sm">
                          ৳{item.codCollectionTarget}
                        </div>
                        <div className="text-[10px] text-gray-400">কালেকশন লক্ষ্য</div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <StatusBadge type="shipment" value={item.status} />
                        {item.deliveredAt && (
                          <div className="text-[10px] text-emerald-700 mt-0.5">
                            ডেলিভার্ড: {item.deliveredAt}
                          </div>
                        )}
                      </td>

                      {/* Refusal Fee Status */}
                      <td className="p-3.5">
                        <StatusBadge type="refusalFee" value={item.refusalFeeStatus} />
                        {item.refusalFeeStatus === 'reported_collected' && (
                          <button
                            type="button"
                            onClick={() =>
                              verifyRefusalFee(
                                item.orderId,
                                item.id,
                                'verified_collected',
                                'রাইডার কালেকশন ভেরিফাইড'
                              )
                            }
                            className="mt-1 block text-[10px] px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                          >
                            ✓ ভেরিফাই করুন
                          </button>
                        )}
                        {item.refusalFeeReference && (
                          <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-xs font-english">
                            রেফ: {item.refusalFeeReference}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-y-1 sm:space-y-0 sm:space-x-1.5 whitespace-nowrap">
                        {canDeliver && (
                          <button
                            type="button"
                            onClick={() =>
                              markDelivered(item.orderId, item.id, 'কুরিয়ার ডেলিভারি সম্পন্ন মার্ক করা হয়েছে')
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            title="সিমুলেট: কুরিয়ার গ্রাহকের হাতে পার্সেল দিয়েছে"
                          >
                            <CheckCircle2 className="size-3" />
                            <span>ডেলিভার্ড</span>
                          </button>
                        )}

                        {isReturned && isCurrent && (
                          <button
                            type="button"
                            onClick={() => setRedispatchTargetOrder(item.fullOrder)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            title="একই অর্ডারে রি-ডেসপ্যাচ সিমুলেশন"
                          >
                            <RotateCcw className="size-3" />
                            <span>রি-ডেসপ্যাচ</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedOrder(item.fullOrder)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium cursor-pointer"
                          title="অর্ডারের সম্পূর্ণ হিস্ট্রি দেখুন"
                        >
                          <Eye className="size-3.5" />
                          <span>ডিটেইলস</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOpenRedispatch={(ord) => setRedispatchTargetOrder(ord)}
      />

      <RedispatchModal
        order={redispatchTargetOrder}
        onClose={() => setRedispatchTargetOrder(null)}
      />
    </>
  )
}
