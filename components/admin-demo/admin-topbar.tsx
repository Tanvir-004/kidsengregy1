'use client'

import React from 'react'
import { Menu, Calendar, Sparkles, MessageCircle, RefreshCw } from 'lucide-react'
import { useAdminDemo } from '@/lib/admin-demo/context'

interface TopbarProps {
  onOpenSidebar?: () => void
  title: string
  subtitle?: string
}

export function AdminTopbar({ onOpenSidebar, title, subtitle }: TopbarProps) {
  const { openSidebar, refreshData, isLoading } = useAdminDemo()

  const handleOpen = onOpenSidebar || openSidebar

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleOpen}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors active:scale-95"
          aria-label="মেনু খুলুন"
          id="admin-hamburger-btn"
        >
          <Menu className="size-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Refresh Live Data Button */}
        <button
          type="button"
          onClick={() => refreshData()}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200 cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
          title="ডেটাবেজ রিফ্রেশ করুন"
        >
          <RefreshCw className={`size-3.5 text-gray-500 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          <span className="hidden sm:inline">রিফ্রেশ</span>
        </button>

        {/* Support Phone Indicator */}
        <a
          href="https://wa.me/8801893225855"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium hover:bg-emerald-100 transition-colors border border-emerald-200"
          title="কাস্টমার সাপোর্ট হোয়াটসঅ্যাপ"
        >
          <MessageCircle className="size-3.5 text-emerald-600" />
          <span className="font-english">01893225855</span>
        </a>

        {/* Live Database Indicator */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-300">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>লাইভ সিস্টেম</span>
        </div>
      </div>
    </header>
  )
}
