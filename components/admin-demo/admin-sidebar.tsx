'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Truck,
  FileCheck,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  X,
  LogOut,
} from 'lucide-react'
import { useAdminDemo } from '@/lib/admin-demo/context'
import { useAdminAuth } from '@/components/admin-demo/admin-auth-gate'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { metrics } = useAdminDemo()
  const { logout } = useAdminAuth()
  const adminBase = pathname.startsWith('/admin-demo') ? '/admin-demo' : '/admin'

  const navItems = [
    {
      title: 'ড্যাশবোর্ড ওভারভিউ',
      href: adminBase,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: 'অর্ডার তালিকা',
      href: `${adminBase}/orders`,
      icon: ShoppingCart,
      badge: metrics.totalOrdersCount ? `${metrics.totalOrdersCount}` : null,
    },
    {
      title: 'অভিভাবক ও শিক্ষার্থী',
      href: `${adminBase}/customers`,
      icon: Users,
      badge: null,
    },
    {
      title: 'স্টেডফাস্ট লজিস্টিকস',
      href: `${adminBase}/shipments`,
      icon: Truck,
      badge: metrics.returnedParcelsCount > 0 ? `${metrics.returnedParcelsCount} রিটার্ন` : null,
      badgeColor: 'bg-rose-500/20 text-rose-800',
    },
    {
      title: 'দৈনিক রিকনসিলিয়েশন',
      href: `${adminBase}/reconciliation`,
      icon: FileCheck,
      badge: metrics.pendingReconciliationCount > 0 ? `${metrics.pendingReconciliationCount} অপেক্ষমাণ` : null,
      badgeColor: 'bg-amber-500/20 text-amber-800',
    },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#064E3B] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-emerald-900 shadow-xl lg:shadow-none`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-emerald-800 flex items-center justify-between">
            <Link href={adminBase} className="flex items-center gap-2.5 font-bold text-lg text-white">
              <span className="p-1.5 rounded-lg bg-emerald-500 text-emerald-950">
                <Sparkles className="size-4.5" />
              </span>
              <div className="flex flex-col">
                <span className="leading-tight text-base font-english font-extrabold tracking-tight">KidsEngregy</span>
                <span className="text-[11px] font-normal text-emerald-300">অ্যাডমিন ড্যাশবোর্ড</span>
              </div>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800"
              aria-label="মেনু বন্ধ করুন"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1" aria-label="অ্যাডমিন মেনু">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === adminBase
                  ? pathname === adminBase
                  : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-500/20 text-white font-semibold border-l-3 border-emerald-400 pl-3'
                      : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`size-4.5 ${isActive ? 'text-emerald-300' : 'text-emerald-400'}`} />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-english font-semibold ${
                        item.badgeColor || 'bg-emerald-500/30 text-emerald-100'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-emerald-800 space-y-3 bg-emerald-950/40">
          {/* Staff Info Pill */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-emerald-900/60 border border-emerald-800">
            <div className="p-2 rounded-full bg-emerald-700 text-white">
              <ShieldCheck className="size-4" />
            </div>
            <div className="text-xs">
              <div className="font-semibold text-white">অপারেশনস টিম</div>
              <div className="text-emerald-300 text-[11px]">লাইভ অ্যাডমিন প্যানেল</div>
            </div>
          </div>

          {/* Public Site Link */}
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors border border-emerald-700/50"
            target="_blank"
          >
            <span>পাবলিক হোমপেজ দেখুন</span>
            <ExternalLink className="size-3.5" />
          </Link>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-rose-200 hover:text-white hover:bg-rose-900/40 transition-colors border border-rose-500/30 cursor-pointer"
          >
            <span>লগআউট করুন</span>
            <LogOut className="size-3.5" />
          </button>
        </div>
      </aside>
    </>
  )
}
