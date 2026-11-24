'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Lock, ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react'

interface AdminAuthContextValue {
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextValue>({
  logout: async () => {},
})

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [configured, setConfigured] = useState(true)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const checkSession = useCallback(async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/admin/auth', { cache: 'no-store' })
      const data = await res.json()
      setAuthenticated(Boolean(data?.authenticated))
      setConfigured(data?.configured !== false)
    } catch {
      setAuthenticated(false)
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!password.trim()) {
      setErrorMessage('অনুগ্রহ করে অ্যাডমিন পাসওয়ার্ড লিখুন।')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()

      if (res.ok && data?.authenticated) {
        setAuthenticated(true)
        setPassword('')
      } else {
        setConfigured(data?.configured !== false)
        setErrorMessage(data?.error || 'পাসওয়ার্ড সঠিক নয়।')
      }
    } catch {
      setErrorMessage('সার্ভারের সাথে সংযোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setSubmitting(false)
    }
  }

  const logout = useCallback(async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
    } finally {
      setAuthenticated(false)
      setPassword('')
    }
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F6FAF7] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-emerald-900/10 p-8 shadow-sm text-center space-y-3 max-w-sm w-full">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center animate-pulse">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-emerald-950">অ্যাডমিন সেশন যাচাই করা হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#F6FAF7] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-emerald-900/10 shadow-lg p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#064E3B] text-white mx-auto flex items-center justify-center shadow-sm">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-950">
              KidsEngregy অ্যাডমিন লগইন
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              অর্ডার, কুরিয়ার ও রিকনসিলিয়েশন ড্যাশবোর্ডে প্রবেশ করতে অ্যাডমিন পাসওয়ার্ড দিন।
            </p>
          </div>

          {!configured && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>সার্ভার পাসওয়ার্ড কনফিগার করা হয়নি</span>
              </div>
              <p className="leading-relaxed">
                Vercel Project Settings → Environment Variables অথবা লোকাল{' '}
                <code className="px-1 py-0.5 bg-amber-100 rounded font-mono">.env.local</code> ফাইলে{' '}
                <code className="px-1 py-0.5 bg-amber-100 rounded font-mono">ADMIN_PASSWORD</code> সেট করে
                রি-ডিপ্লয়/রিস্টার্ট করুন।
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                অ্যাডমিন পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-5 rounded-xl bg-[#064E3B] hover:bg-emerald-900 text-white font-bold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'যাচাই করা হচ্ছে...' : 'ড্যাশবোর্ডে প্রবেশ করুন'}
            </button>
          </form>

          <div className="pt-2 border-t border-gray-100 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>হোমপেজে ফিরে যান</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <AdminAuthContext.Provider value={{ logout }}>{children}</AdminAuthContext.Provider>
}
