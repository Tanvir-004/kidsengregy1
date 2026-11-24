'use client'

import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  Eye,
  RotateCcw,
  Truck,
  CheckCircle2,
  Calendar,
  X,
  Package,
} from 'lucide-react'
import { useAdminDemo } from '@/lib/admin-demo/context'
import { AdminTopbar } from '@/components/admin-demo/admin-topbar'
import { StatusBadge } from '@/components/admin-demo/status-badge'
import { OrderDetailModal } from '@/components/admin-demo/order-detail-modal'
import { RedispatchModal } from '@/components/admin-demo/redispatch-modal'
import { DemoOrder, OrderStatus } from '@/lib/admin-demo/types'

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<DemoOrder | null>(null)
  const [redispatchTargetOrder, setRedispatchTargetOrder] = useState<DemoOrder | null>(null)

  const { orders } = useAdminDemo()

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.parentPhone.includes(searchQuery) ||
        order.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shippingDistrict.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        selectedStatus === 'all' || order.orderStatus === selectedStatus

      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, selectedStatus])

  const statusTabs = [
    { label: 'সকল অর্ডার', value: 'all', count: orders.length },
    {
      label: 'নতুন অপেক্ষমাণ',
      value: 'pending',
      count: orders.filter((o) => o.orderStatus === 'pending').length,
    },
    {
      label: 'কনফার্মড',
      value: 'confirmed',
      count: orders.filter((o) => o.orderStatus === 'confirmed').length,
    },
    {
      label: 'ইন-ট্রানজিট',
      value: 'in_transit',
      count: orders.filter((o) => o.orderStatus === 'in_transit').length,
    },
    {
      label: 'ডেলিভার্ড',
      value: 'delivered',
      count: orders.filter((o) => o.orderStatus === 'delivered').length,
    },
    {
      label: 'রিটার্নড / রিফিউজড',
      value: 'returned',
      count: orders.filter((o) => o.orderStatus === 'returned').length,
    },
  ]

  return (
    <>
      <AdminTopbar
        title="অর্ডার ব্যবস্থাপনা"
        subtitle="ক্যাশ অন ডেলিভারি প্যাকেজ অর্ডার ও শিপমেন্ট ট্র্যাকিং"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Header Controls: Search & Status Filter Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="অর্ডার নম্বর, মোবাইল, শিক্ষার্থী বা জেলা দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs text-gray-500 self-end sm:self-center">
              মোট পাওয়া গেছে:{' '}
              <strong className="text-gray-900 font-english font-bold">
                {filteredOrders.length}
              </strong>{' '}
              টি অর্ডার
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-gray-100 pt-3 text-xs scrollbar-none">
            {statusTabs.map((tab) => {
              const isSelected = selectedStatus === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSelectedStatus(tab.value)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-english ${
                      isSelected ? 'bg-emerald-800 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">অর্ডার নম্বর ও তারিখ</th>
                  <th className="p-3.5">শিক্ষার্থী ও অভিভাবক</th>
                  <th className="p-3.5">ডেলিভারি ঠিকানা</th>
                  <th className="p-3.5 text-right">COD মূল্য</th>
                  <th className="p-3.5">কুরিয়ার ও অ্যাটেম্পট</th>
                  <th className="p-3.5">অর্ডার স্ট্যাটাস</th>
                  <th className="p-3.5">লার্নিং অ্যাক্সেস</th>
                  <th className="p-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      কোনো অর্ডার পাওয়া যায়নি। অনুসন্ধান ফিল্টার পরিবর্তন করে দেখুন।
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const activeShipment =
                      order.shipments.find((s) => s.isCurrentAttempt) || order.shipments[0]
                    const isReturned = order.orderStatus === 'returned'

                    return (
                      <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Order Number & Date */}
                        <td className="p-3.5">
                          <div className="font-english font-bold text-gray-900 text-sm">
                            {order.orderNumber}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">{order.createdAt}</div>
                        </td>

                        {/* Student & Parent */}
                        <td className="p-3.5">
                          <div className="font-bold text-gray-900 text-sm">
                            {order.childName}{' '}
                            <span className="text-gray-500 font-normal text-xs">
                              ({order.childAge} বছর)
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-600">
                            অভিভাবক: {order.parentName}
                          </div>
                          <div className="text-[11px] font-english text-gray-400">
                            {order.parentPhone}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="p-3.5">
                          <div className="font-medium text-gray-800">
                            {order.shippingDistrict}, {order.shippingThana}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate max-w-xs">
                            {order.shippingAddress}
                          </div>
                        </td>

                        {/* COD Amount */}
                        <td className="p-3.5 text-right">
                          <div className="font-english font-extrabold text-gray-900 text-sm">
                            ৳{order.totalAmount}
                          </div>
                          <div className="text-[10px] text-gray-400">ক্যাশ অন ডেলিভারি</div>
                        </td>

                        {/* Courier & Attempt */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <Truck className="size-3.5 text-gray-400" />
                            <span className="font-english font-semibold text-gray-800">
                              অ্যাটেম্পট #{activeShipment?.attemptNumber || 1}
                            </span>
                          </div>
                          <div className="text-[11px] font-english text-gray-500">
                            {activeShipment?.consignmentId}
                          </div>
                          <div className="text-[10px] text-emerald-800 font-english font-medium">
                            টার্গেট: ৳{activeShipment?.codCollectionTarget}
                          </div>
                        </td>

                        {/* Order Status */}
                        <td className="p-3.5">
                          <StatusBadge type="order" value={order.orderStatus} />
                        </td>

                        {/* Enrollment Access */}
                        <td className="p-3.5">
                          <StatusBadge type="enrollment" value={order.enrollmentStatus} />
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {isReturned && (
                            <button
                              type="button"
                              onClick={() => setRedispatchTargetOrder(order)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                              title="একই অর্ডারে রি-ডেসপ্যাচ করুন"
                            >
                              <RotateCcw className="size-3" />
                              <span>রি-ডেসপ্যাচ</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
                            title="অর্ডারের বিস্তারিত তথ্য দেখুন"
                          >
                            <Eye className="size-3.5" />
                            <span>ডিটেইলস</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
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
