'use client'

import React from 'react'
import { AdminDemoProvider, useAdminDemo } from '@/lib/admin-demo/context'
import { AdminAuthGate } from '@/components/admin-demo/admin-auth-gate'
import { DemoBanner } from '@/components/admin-demo/demo-banner'
import { AdminSidebar } from '@/components/admin-demo/admin-sidebar'

function AdminDemoLayoutInner({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, closeSidebar } = useAdminDemo()

  return (
    <div className="min-h-screen bg-[#F6FAF7] flex flex-col font-sans text-gray-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Demo Disclaimer Banner */}
      <DemoBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main Content Area (Offset by sidebar width on large screens) */}
        <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function AdminDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGate>
      <AdminDemoProvider>
        <AdminDemoLayoutInner>{children}</AdminDemoLayoutInner>
      </AdminDemoProvider>
    </AdminAuthGate>
  )
}
