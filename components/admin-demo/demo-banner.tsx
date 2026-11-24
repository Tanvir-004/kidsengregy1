'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { useAdminDemo } from '@/lib/admin-demo/context'

export function DemoBanner() {
  const { refreshData, isLoading, metrics } = useAdminDemo()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="bg-emerald-900 text-white px-4 py-2 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2 border-b border-emerald-950">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-emerald-200 uppercase tracking-wider text-[11px]">
          KidsEngregy অ্যাডমিন পোর্টাল
        </span>
        <span className="hidden sm:inline text-emerald-100 text-xs">
          • লাইভ ডেটাবেজ সংযুক্ত{' '}
          {mounted
            ? `(মোট অর্ডার: ${metrics.totalOrdersCount}টি | একটিভ এনরোলমেন্ট: ${metrics.activeEnrollmentsCount}টি)`
            : ''}
        </span>
      </div>
      <button
        type="button"
        onClick={() => refreshData()}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-medium transition-colors text-xs cursor-pointer ml-auto disabled:opacity-50"
        title="ডেটাবেজ থেকে সর্বশেষ ডেটা রিফ্রেশ করুন"
      >
        <RefreshCw className={`size-3 ${isLoading ? 'animate-spin' : ''}`} />
        <span>সিঙ্ক করুন</span>
      </button>
    </div>
  )
}
