'use client'

import React from 'react'
import { AdminDemoProvider, useAdminDemo } from '@/lib/admin-demo/context'
import { AdminAuthGate } from '@/components/admin-demo/admin-auth-gate'
import { DemoBanner } from '@/components/admin-demo/demo-banner'
import { AdminSidebar } from '@/components/admin-demo/admin-sidebar'

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, closeSidebar } = useAdminDemo()

  return (
    <div className="min-h-screen bg-[#F6FAF7] flex flex-col font-sans text-gray-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Status Banner */}
      <DemoBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGate>
      <AdminDemoProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </AdminDemoProvider>
    </AdminAuthGate>
  )
}
