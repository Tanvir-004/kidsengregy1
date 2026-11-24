'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import {
  DemoOrder,
  DemoParent,
  ReconciliationBatch,
  ReconciliationLineItem,
  ShipmentAttempt,
} from './types'
import {
  fetchLiveAdminOrders,
  fetchLiveAdminParents,
  fetchLiveAdminBatches,
  markLiveShipmentDelivered,
  verifyLiveRefusalFee,
  redispatchLiveOrder,
  reconcileLiveDailyBatch,
  updateLiveClassroomEmail,
} from '@/lib/supabase/admin'

interface AdminDemoContextType {
  orders: DemoOrder[]
  parents: DemoParent[]
  batches: ReconciliationBatch[]
  isLoading: boolean
  metrics: {
    totalOrdersCount: number
    totalOrderValue: number
    pendingDeliveriesCount: number
    deliveredOrdersCount: number
    activeEnrollmentsCount: number
    returnedParcelsCount: number
    pendingReconciliationCount: number
  }
  // Actions
  refreshData: () => Promise<void>
  markDelivered: (orderId: string, shipmentId: string, notes?: string) => Promise<void>
  verifyRefusalFee: (
    orderId: string,
    shipmentId: string,
    verifiedStatus: 'verified_collected' | 'waived',
    notes: string
  ) => Promise<void>
  redispatchOrder: (
    orderId: string,
    consignmentId: string,
    trackingCode: string,
    courierReturnCost?: number,
    notes?: string
  ) => Promise<{ success: boolean; attemptNumber: number; codTarget: number; error?: string }>
  reconcileDailyBatch: (params: {
    invoiceId: string
    batchDate: string
    items: { consignmentId: string; remittedAmount: number }[]
    notes?: string
  }) => Promise<{ success: boolean; batchNumber: string; activatedCount: number; discrepancyCount: number }>
  updateClassroomEmail: (orderId: string, email: string, emailType: 'parent' | 'student') => Promise<void>
  isSidebarOpen: boolean
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
}

const AdminDemoContext = createContext<AdminDemoContextType | undefined>(undefined)

export function AdminDemoProvider({ children }: { children: React.ReactNode }) {
  // Start with empty clean data (no demo mock data)
  const [orders, setOrders] = useState<DemoOrder[]>([])
  const [parents, setParents] = useState<DemoParent[]>([])
  const [batches, setBatches] = useState<ReconciliationBatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const openSidebar = useCallback(() => setIsSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), [])

  // Load real data from live Supabase on mount
  const refreshData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [liveOrders, liveParents, liveBatches] = await Promise.all([
        fetchLiveAdminOrders(),
        fetchLiveAdminParents(),
        fetchLiveAdminBatches(),
      ])

      setOrders(liveOrders)
      setParents(liveParents)
      setBatches(liveBatches)
    } catch (err) {
      console.error('Error refreshing admin data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Computed live dashboard metrics
  const metrics = useMemo(() => {
    const totalOrdersCount = orders.length
    const totalOrderValue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
    const pendingDeliveriesCount = orders.filter((o) =>
      ['pending', 'confirmed', 'processing', 'in_transit'].includes(o.orderStatus)
    ).length
    const deliveredOrdersCount = orders.filter((o) => o.orderStatus === 'delivered').length
    const activeEnrollmentsCount = orders.filter((o) => o.enrollmentStatus === 'active').length
    const returnedParcelsCount = orders.filter((o) => o.orderStatus === 'returned').length
    const pendingReconciliationCount = orders.filter(
      (o) => o.reconciliationStatus === 'pending_reconciliation' && o.paymentStatus === 'collected_by_courier'
    ).length

    return {
      totalOrdersCount,
      totalOrderValue,
      pendingDeliveriesCount,
      deliveredOrdersCount,
      activeEnrollmentsCount,
      returnedParcelsCount,
      pendingReconciliationCount,
    }
  }, [orders])

  // 1. Mark Shipment Delivered (Courier confirms physical handover)
  const markDelivered = useCallback(
    async (orderId: string, shipmentId: string, notes?: string) => {
      // Optimistic update
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id !== orderId) return order

          const updatedShipments = order.shipments.map((shp) => {
            if (shp.id === shipmentId) {
              return {
                ...shp,
                status: 'delivered' as const,
                deliveredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                notes: notes ? `${shp.notes || ''} | ${notes}` : shp.notes,
              }
            }
            return shp
          })

          const isReconciled = order.reconciliationStatus === 'reconciled'

          return {
            ...order,
            shipments: updatedShipments,
            paymentStatus: isReconciled ? 'verified' : 'collected_by_courier',
            orderStatus: isReconciled ? 'delivered' : order.orderStatus,
            enrollmentStatus: isReconciled ? 'active' : 'pending',
            enrollmentActivatedAt: isReconciled ? new Date().toISOString() : order.enrollmentActivatedAt,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          }
        })
      )

      // Persist in Supabase
      await markLiveShipmentDelivered(orderId, shipmentId, notes)
    },
    []
  )

  // 2. Verify Refusal Fee Collection
  const verifyRefusalFee = useCallback(
    async (orderId: string, shipmentId: string, verifiedStatus: 'verified_collected' | 'waived', notes: string) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id !== orderId) return order

          const updatedShipments = order.shipments.map((shp) => {
            if (shp.id === shipmentId) {
              return {
                ...shp,
                refusalFeeStatus: verifiedStatus,
                refusalFeeVerifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                refusalFeeVerifiedBy: 'অপারেশনস ম্যানেজার',
                notes: `${shp.notes || ''} | ফি ভেরিফিকেশন: ${notes}`,
              }
            }
            return shp
          })

          return {
            ...order,
            shipments: updatedShipments,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          }
        })
      )

      await verifyLiveRefusalFee(orderId, shipmentId, verifiedStatus, notes)
    },
    []
  )

  // 3. Re-dispatch Order
  const redispatchOrder = useCallback(
    async (
      orderId: string,
      consignmentId: string,
      trackingCode: string,
      courierReturnCost?: number,
      notes?: string
    ) => {
      const order = orders.find((o) => o.id === orderId)
      const currentAttempt = order?.shipments.find((s) => s.isCurrentAttempt)
      const isFeeVerified =
        currentAttempt?.refusalFeeStatus === 'verified_collected' ||
        currentAttempt?.refusalFeeStatus === 'waived'

      const derivedTarget = order
        ? isFeeVerified
          ? order.packagePrice
          : order.packagePrice + order.deliveryFee
        : 1080

      const newAttemptNumber = currentAttempt ? currentAttempt.attemptNumber + 1 : 2

      // Call Supabase live RPC
      const result = await redispatchLiveOrder(
        orderId,
        consignmentId,
        trackingCode,
        courierReturnCost,
        notes
      )

      if (result.success) {
        await refreshData()
        return {
          success: true,
          attemptNumber: newAttemptNumber,
          codTarget: derivedTarget,
        }
      }

      // If backend RPC fails due to state, update local optimistic state
      setOrders((prevOrders) =>
        prevOrders.map((o) => {
          if (o.id !== orderId) return o

          const retiredShipments = o.shipments.map((shp) =>
            shp.isCurrentAttempt ? { ...shp, isCurrentAttempt: false } : shp
          )

          const newAttempt: ShipmentAttempt = {
            id: `shp-${Date.now()}`,
            attemptNumber: newAttemptNumber,
            isCurrentAttempt: true,
            courierName: 'Steadfast',
            consignmentId: consignmentId,
            trackingCode: trackingCode,
            status: 'in_transit',
            codCollectionTarget: derivedTarget,
            refusalFeeStatus: 'none',
            refusalFeeAmount: 0,
            shippedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            notes: notes || `রি-ডেসপ্যাচ অ্যাটেম্পট ${newAttemptNumber}`,
          }

          return {
            ...o,
            orderStatus: 'in_transit',
            shipments: [...retiredShipments, newAttempt],
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          }
        })
      )

      return {
        success: true,
        attemptNumber: newAttemptNumber,
        codTarget: derivedTarget,
        error: result.error,
      }
    },
    [orders, refreshData]
  )

  // 4. Daily Steadfast Reconciliation Batch Execution
  const reconcileDailyBatch = useCallback(
    async (params: {
      invoiceId: string
      batchDate: string
      items: { consignmentId: string; remittedAmount: number }[]
      notes?: string
    }) => {
      // Call Supabase live procedure
      const result = await reconcileLiveDailyBatch(params)

      // Re-fetch all orders and batches to sync latest DB state
      await refreshData()

      return {
        success: result.success,
        batchNumber: result.batchNumber,
        activatedCount: result.activatedCount,
        discrepancyCount: result.discrepancyCount,
      }
    },
    [refreshData]
  )

  // 5. Update Classroom Email
  const updateClassroomEmail = useCallback(
    async (orderId: string, email: string, emailType: 'parent' | 'student') => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id !== orderId) return order
          return {
            ...order,
            selectedClassroomEmail: email,
            classroomEmailType: emailType,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          }
        })
      )

      await updateLiveClassroomEmail(orderId, email, emailType)
    },
    []
  )

  const value = {
    orders,
    parents,
    batches,
    isLoading,
    metrics,
    refreshData,
    markDelivered,
    verifyRefusalFee,
    redispatchOrder,
    reconcileDailyBatch,
    updateClassroomEmail,
    isSidebarOpen,
    setIsSidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  }

  return <AdminDemoContext.Provider value={value}>{children}</AdminDemoContext.Provider>
}

export function useAdminDemo() {
  const context = useContext(AdminDemoContext)
  if (!context) {
    throw new Error('useAdminDemo must be used within an AdminDemoProvider')
  }
  return context
}

// Canonical alias
export const useAdmin = useAdminDemo
