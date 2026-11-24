'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ShoppingCart,
  Truck,
  CheckCircle2,
  Users,
  Coins,
  ArrowRight,
  Clock,
  Sparkles,
  RotateCcw,
  Eye,
  FileCheck,
} from 'lucide-react'
import { useAdminDemo } from '@/lib/admin-demo/context'
import { AdminTopbar } from '@/components/admin-demo/admin-topbar'
import { MetricCard } from '@/components/admin-demo/metric-card'
import { StatusBadge } from '@/components/admin-demo/status-badge'
import { OrderDetailModal } from '@/components/admin-demo/order-detail-modal'
import { RedispatchModal } from '@/components/admin-demo/redispatch-modal'
import { DemoOrder } from '@/lib/admin-demo/types'

export default function AdminOverviewPage() {
  const [selectedOrder, setSelectedOrder] = useState<DemoOrder | null>(null)
  const [redispatchTargetOrder, setRedispatchTargetOrder] = useState<DemoOrder | null>(null)

  const { orders, metrics } = useAdminDemo()

  // Recent 5 orders sorted descending
  const recentOrders = orders.slice(0, 5)

  return (
    <>
      <AdminTopbar
        title="ড্যাশবোর্ড ওভারভিউ"
        subtitle="KidsEngregy একাডেমি অপারেশনাল মেট্রিক্স ও লাইভ অ্যাক্টিভিটি"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* KPI Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="মোট অর্ডার (সংখ্যা)"
            value={`${metrics.totalOrdersCount}`}
            subtitle="নিবন্ধিত সর্বমোট প্যাকেজ অর্ডার"
            icon={ShoppingCart}
            tint="forest"
          />
          <MetricCard
            title="মোট অর্ডার মূল্য"
            value={`৳${metrics.totalOrderValue.toLocaleString('en-US')}`}
            subtitle="ক্যাশ অন ডেলিভারি (COD)"
            icon={Coins}
            tint="blue"
          />
          <MetricCard
            title="অপেক্ষমাণ ডেলিভারি"
            value={`${metrics.pendingDeliveriesCount}`}
            subtitle="ইন-ট্রানজিট ও প্রস্তুত পার্সেল"
            icon={Truck}
            tint="amber"
          />
          <MetricCard
            title="ডেলিভারি সম্পন্ন"
            value={`${metrics.deliveredOrdersCount}`}
            subtitle="গ্রাহকের হাতে ফনিক্স বই পৌঁছেছে"
            icon={CheckCircle2}
            tint="emerald"
          />
          <MetricCard
            title="সক্রিয় শিক্ষার্থী"
            value={`${metrics.activeEnrollmentsCount}`}
            subtitle="ডেলিভার্ড ও রেমিট্যান্স ভেরিফাইড"
            icon={Users}
            tint="emerald"
            badge="দ্বিমুখী শর্ত অনুমোদিত"
          />
        </div>

        {/* Dual-Gate Rule Overview Banner */}
        <div className="bg-white rounded-xl border border-emerald-900/10 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <Sparkles className="size-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                KidsEngregy V1 দ্বিমুখী লার্নিং অ্যাক্টিভেশন পলিসি (Dual-Gate Rule)
              </h2>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed max-w-3xl">
                অনলাইন কোর্সের অ্যাক্সেস স্বয়ংক্রিয়ভাবে খোলার জন্য <strong>দুটি শর্তই পূর্ণ হতে হবে</strong>: (১)
                স্টেডফাস্ট কুরিয়ারের মাধ্যমে ফনিক্স বই গ্রাহকের ঠিকানায় পৌঁছাতে হবে এবং (২) প্রতিদিনের ব্যাংক
                রেমিট্যান্স শিটে আদায়কৃত ক্যাশ টাকা যাচাই সম্পন্ন হতে হবে।
              </p>
            </div>
          </div>
          <Link
            href="/admin/reconciliation"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>দৈনিক রিকনসিলিয়েশন দেখুন</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Middle Two-Column Grid: Status Distribution & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Status Distribution (1 col) */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span>অর্ডার স্ট্যাটাস বিভাজন</span>
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>ডেলিভারি সম্পন্ন (Delivered)</span>
                  <span className="font-english font-bold text-emerald-700">
                    {metrics.deliveredOrdersCount} ({metrics.totalOrdersCount > 0 ? Math.round((metrics.deliveredOrdersCount / metrics.totalOrdersCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${metrics.totalOrdersCount > 0 ? (metrics.deliveredOrdersCount / metrics.totalOrdersCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>কুরিয়ার ইন-ট্রানজিট (In-Transit)</span>
                  <span className="font-english font-bold text-purple-700">
                    {orders.filter((o) => o.orderStatus === 'in_transit').length} ({metrics.totalOrdersCount > 0 ? Math.round((orders.filter((o) => o.orderStatus === 'in_transit').length / metrics.totalOrdersCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${metrics.totalOrdersCount > 0 ? (orders.filter((o) => o.orderStatus === 'in_transit').length / metrics.totalOrdersCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>নতুন অপেক্ষমাণ (Pending/Confirmed)</span>
                  <span className="font-english font-bold text-amber-700">
                    {orders.filter((o) => ['pending', 'confirmed'].includes(o.orderStatus)).length} ({metrics.totalOrdersCount > 0 ? Math.round((orders.filter((o) => ['pending', 'confirmed'].includes(o.orderStatus)).length / metrics.totalOrdersCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{
                      width: `${metrics.totalOrdersCount > 0 ? (orders.filter((o) => ['pending', 'confirmed'].includes(o.orderStatus)).length / metrics.totalOrdersCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>রিটার্নড / রিফিউজড (Returned)</span>
                  <span className="font-english font-bold text-rose-700">
                    {metrics.returnedParcelsCount} ({metrics.totalOrdersCount > 0 ? Math.round((metrics.returnedParcelsCount / metrics.totalOrdersCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${metrics.totalOrdersCount > 0 ? (metrics.returnedParcelsCount / metrics.totalOrdersCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
              <span>রিটার্ন পার্সেল রি-ডেসপ্যাচযোগ্য:</span>
              <Link href="/admin/shipments" className="text-emerald-700 font-bold hover:underline">
                লজিস্টিকস স্ক্রিনে যান →
              </Link>
            </div>
          </div>

          {/* Recent Operational Activity Timeline (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">সাম্প্রতিক একাডেমি কার্যক্রম</h3>
              <span className="text-xs text-gray-500">লাইভ সেশন ইভেন্ট লগ</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">
                    দৈনিক রিকনসিলিয়েশন সম্পন্ন: ব্যাচ #REC-20261114-001
                  </div>
                  <p className="text-gray-600 mt-0.5">
                    অর্ডার #KE-202611-0001 (আরিয়ান রহমান) এর ক্যাশ টাকা ব্যাংক অ্যাকাউন্টে জমা নিশ্চিত হওয়ায়
                    লার্নিং অ্যাক্সেস সক্রিয় হয়েছে।
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">২০২৬-১১-১৪ ১৮:১৫</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                <div className="p-1.5 rounded-md bg-purple-100 text-purple-800 shrink-0 mt-0.5">
                  <RotateCcw className="size-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">
                    পার্সেল রি-ডেসপ্যাচ সম্পন্ন: অর্ডার #KE-202611-0005 (তাহমিদ আহমেদ)
                  </div>
                  <p className="text-gray-600 mt-0.5">
                    পূর্ববর্তী অ্যাটেম্পট ১-এ গ্রাহক দরজায় ৳৯০ ডেলিভারি ফি পরিশোধ করায় নতুন অ্যাটেম্পট ২-এর COD
                    টার্গেট নির্ধারণ করা হয়েছে ৳৯৯০।
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">২০২৬-১১-১৫ ০৯:০০</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                <div className="p-1.5 rounded-md bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                  <Clock className="size-4 text-amber-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">
                    দরজায় পার্সেল রিফিউজাল রেকর্ড: অর্ডার #KE-202611-0003
                  </div>
                  <p className="text-gray-600 mt-0.5">
                    স্টেডফাস্ট রাইডার গ্রাহক থেকে ৳৯০ ডেলিভারি ফি সফলভাবে সংগ্রহ করেছে এবং রসিদ ভাউচার
                    ভেরিফাইড হয়েছে।
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">২০২৬-১১-১৪ ১৭:০০</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">সাম্প্রতিক অর্ডারসমূহ</h3>
              <p className="text-xs text-gray-500">সর্বশেষ ৫টি নিবন্ধিত প্যাকেজ অর্ডার</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>সকল অর্ডার দেখুন ({orders.length})</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">অর্ডার নম্বর</th>
                  <th className="p-3.5">শিক্ষার্থী ও অভিভাবক</th>
                  <th className="p-3.5">জেলা</th>
                  <th className="p-3.5 text-right">COD মূল্য</th>
                  <th className="p-3.5">অর্ডার স্ট্যাটাস</th>
                  <th className="p-3.5">লার্নিং অ্যাক্সেস</th>
                  <th className="p-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-3.5">
                      <div className="font-english font-bold text-gray-900">{order.orderNumber}</div>
                      <div className="text-[11px] text-gray-400">{order.createdAt}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-gray-900 text-sm">{order.childName}</div>
                      <div className="text-[11px] text-gray-500">অভিভাবক: {order.parentName}</div>
                    </td>
                    <td className="p-3.5 text-gray-700 font-medium">
                      {order.shippingDistrict}
                    </td>
                    <td className="p-3.5 text-right font-english font-bold text-gray-900">
                      ৳{order.totalAmount}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge type="order" value={order.orderStatus} />
                    </td>
                    <td className="p-3.5">
                      <StatusBadge type="enrollment" value={order.enrollmentStatus} />
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Eye className="size-3.5" />
                        <span>বিস্তারিত</span>
                      </button>
                    </td>
                  </tr>
                ))}
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
