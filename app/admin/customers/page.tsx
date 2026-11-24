'use client'

import React, { useState } from 'react'
import {
  Users,
  Search,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Sparkles,
  Edit2,
  Check,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { useAdminDemo } from '@/lib/admin-demo/context'
import { AdminTopbar } from '@/components/admin-demo/admin-topbar'
import { StatusBadge } from '@/components/admin-demo/status-badge'
import { DemoParent } from '@/lib/admin-demo/types'

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingEmailOrderId, setEditingEmailOrderId] = useState<string | null>(null)
  const [editEmailVal, setEditEmailVal] = useState('')
  const [editEmailType, setEditEmailType] = useState<'parent' | 'student'>('student')

  const { parents, orders, updateClassroomEmail } = useAdminDemo()

  const filteredParents = parents.filter((p) => {
    const q = searchQuery.toLowerCase()
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.googleEmail.toLowerCase().includes(q) ||
      p.children.some((c) => c.fullName.toLowerCase().includes(q))
    )
  })

  const handleSaveEmail = (orderId: string) => {
    if (editEmailVal.trim()) {
      updateClassroomEmail(orderId, editEmailVal.trim(), editEmailType)
    }
    setEditingEmailOrderId(null)
  }

  return (
    <>
      <AdminTopbar
        title="অভিভাবক ও শিক্ষার্থী ডিরেক্টরি"
        subtitle="মাল্টি-চাইল্ড প্রোফাইল, গুগল ক্লাসরুম ইমেইল ও হোয়াটসঅ্যাপ কমিউনিটি ট্র্যাকিং"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Header Search & Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="অভিভাবকের নাম, ফোন বা শিক্ষার্থীর নাম দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="text-xs text-gray-500">
            মোট অভিভাবক অ্যাকাউন্ট:{' '}
            <strong className="text-gray-900 font-english font-bold">
              {parents.length}
            </strong>{' '}
            জন | মোট শিক্ষার্থী:{' '}
            <strong className="text-emerald-800 font-english font-bold">
              {parents.reduce((sum, p) => sum + p.children.length, 0)}
            </strong>{' '}
            জন
          </div>
        </div>

        {/* Parent-Child Cards List */}
        <div className="space-y-4">
          {filteredParents.map((parent) => {
            // Find all orders linked to this parent
            const parentOrders = orders.filter((o) => o.parentId === parent.id)

            return (
              <div
                key={parent.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4 hover:shadow-md transition-shadow"
              >
                {/* Parent Profile Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
                      <UserCheck className="size-5 text-emerald-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-base">{parent.fullName}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-medium">
                          {parent.children.length} জন সন্তান নিবন্ধিত
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 font-english">
                          <Phone className="size-3 text-gray-400" />
                          {parent.phone}
                        </span>
                        <span className="flex items-center gap-1 font-english">
                          <Mail className="size-3 text-gray-400" />
                          {parent.googleEmail}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-gray-400" />
                          {parent.district}, {parent.thana}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-400 self-end sm:self-auto">
                    যোগদানের তারিখ: <span className="font-english">{parent.joinedAt}</span>
                  </div>
                </div>

                {/* Children Profiles Sub-Grid */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                    নিবন্ধিত সন্তান ও লার্নিং স্ট্যাটাস:
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {parent.children.map((child) => {
                      const childOrder = parentOrders.find((o) => o.childId === child.id)

                      return (
                        <div
                          key={child.id}
                          className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 space-y-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <strong className="text-gray-900 text-sm">{child.fullName}</strong>
                              <span className="text-gray-500 text-xs ml-1.5">
                                ({child.age} বছর | {child.gradeOrLevel})
                              </span>
                            </div>
                            {childOrder ? (
                              <StatusBadge type="enrollment" value={childOrder.enrollmentStatus} />
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">প্যাকেজ অর্ডার নেই</span>
                            )}
                          </div>

                          {childOrder ? (
                            <div className="space-y-2 border-t border-gray-200/60 pt-2 text-[11px]">
                              {/* Order & Dual-Gate Access Indicator */}
                              <div className="flex items-center justify-between text-gray-600">
                                <span>অর্ডার নম্বর:</span>
                                <strong className="font-english text-gray-800">
                                  {childOrder.orderNumber}
                                </strong>
                              </div>

                              {/* WhatsApp Community Access */}
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1 text-gray-600">
                                  <MessageCircle className="size-3.5 text-emerald-600" />
                                  <span>WhatsApp লার্নিং গ্রুপ:</span>
                                </span>
                                {childOrder.whatsappStatus === 'joined' ? (
                                  <span className="font-bold text-emerald-700">যুক্ত হয়েছেন</span>
                                ) : childOrder.whatsappStatus === 'link_revealed' ? (
                                  <span className="font-bold text-blue-700">লিংক উন্মুক্ত</span>
                                ) : (
                                  <span className="text-gray-400">অপেক্ষমাণ (লকড)</span>
                                )}
                              </div>

                              {/* Google Classroom Email Config */}
                              <div className="p-2 rounded-lg bg-white border border-gray-200 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1 font-semibold text-blue-900">
                                    <Mail className="size-3.5 text-blue-600" />
                                    <span>Google Classroom জিমেইল:</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingEmailOrderId(childOrder.id)
                                      setEditEmailVal(childOrder.selectedClassroomEmail)
                                      setEditEmailType(childOrder.classroomEmailType)
                                    }}
                                    className="text-emerald-700 hover:text-emerald-900 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <Edit2 className="size-2.5" />
                                    <span>পরিবর্তন</span>
                                  </button>
                                </div>

                                {editingEmailOrderId === childOrder.id ? (
                                  <div className="space-y-1.5 pt-1">
                                    <input
                                      type="email"
                                      value={editEmailVal}
                                      onChange={(e) => setEditEmailVal(e.target.value)}
                                      className="w-full px-2 py-1 rounded border border-gray-300 font-english text-xs"
                                      placeholder="student@gmail.com"
                                    />
                                    <div className="flex items-center justify-between">
                                      <select
                                        value={editEmailType}
                                        onChange={(e) =>
                                          setEditEmailType(e.target.value as 'parent' | 'student')
                                        }
                                        className="text-[10px] px-1.5 py-0.5 rounded border border-gray-300"
                                      >
                                        <option value="parent">অভিভাবকের জিমেইল</option>
                                        <option value="student">শিক্ষার্থীর নিজস্ব জিমেইল</option>
                                      </select>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => setEditingEmailOrderId(null)}
                                          className="px-2 py-0.5 rounded text-[10px] text-gray-500 hover:bg-gray-100"
                                        >
                                          বাতিল
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleSaveEmail(childOrder.id)}
                                          className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold"
                                        >
                                          সংরক্ষণ
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-gray-800 font-english font-medium truncate">
                                    {childOrder.selectedClassroomEmail}
                                    <span className="text-gray-400 font-sans text-[10px] ml-1">
                                      ({childOrder.classroomEmailType === 'student' ? 'শিক্ষার্থী' : 'অভিভাবক'})
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-[11px] text-gray-400">
                              এই সন্তানের জন্য এখনো কোনো প্যাকেজ ক্রয় করা হয়নি।
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}
