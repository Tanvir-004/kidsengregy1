'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Lock,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  Video,
} from 'lucide-react'
import { supabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabase/client'
import { SITE_CONFIG } from '@/lib/config/site'

function normalizePhoneInput(raw: string): string {
  const bengaliToEnglish: Record<string, string> = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  }
  const converted = raw.replace(/[০-৯]/g, (d) => bengaliToEnglish[d] ?? d)
  return converted.replace(/[\s\-()]/g, '').trim()
}

const DISTRICTS = [
  'ঢাকা (Dhaka)',
  'চট্টগ্রাম (Chattogram)',
  'সিলেট (Sylhet)',
  'রাজশাহী (Rajshahi)',
  'খুলনা (Khulna)',
  'বরিশাল (Barishal)',
  'রংপুর (Rangpur)',
  'ময়মনসিংহ (Mymensingh)',
  'কুমিল্লা (Cumilla)',
  'গাজীপুর (Gazipur)',
  'নারায়ণগঞ্জ (Narayanganj)',
  'বগুড়া (Bogura)',
  'কক্সবাজার (Cox\'s Bazar)',
  'অন্যান্য জেলা (Other District)',
]

export default function CheckoutPage() {
  const router = useRouter()

  // Form State
  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isExistingUser, setIsExistingUser] = useState(false)

  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState<number>(6)
  const [classroomEmailChoice, setClassroomEmailChoice] = useState<'parent' | 'student'>('parent')
  const [studentGmail, setStudentGmail] = useState('')

  const [shippingDistrict, setShippingDistrict] = useState(DISTRICTS[0])
  const [shippingAddress, setShippingAddress] = useState('')
  const [notes, setNotes] = useState('')

  // Submission State
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string | null>(null)

  // Check existing session
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setCurrentUserEmail(user.email ?? null)
          setParentEmail(user.email ?? '')
          if (user.user_metadata?.full_name) {
            setParentName(user.user_metadata.full_name)
          }
          if (user.user_metadata?.phone) {
            setParentPhone(user.user_metadata.phone)
          }
        }
      } catch (err) {
        console.warn('Auth session check skipped:', err)
      }
    }
    checkAuth()
  }, [])

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsLoading(true)

    try {
      const normalizedPhone = normalizePhoneInput(parentPhone)
      const phoneDigitsOnly = normalizedPhone.replace(/\D/g, '')
      const cleanEmail = parentEmail.trim()
      const cleanStudentEmail = studentGmail.trim()

      // 1. Validation
      if (!parentName.trim()) throw new Error('অনুগ্রহ করে অভিভাবকের পূর্ণ নাম লিখুন')
      if (!phoneDigitsOnly || phoneDigitsOnly.length < 11) {
        throw new Error('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)')
      }
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        throw new Error('অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন')
      }
      if (!childName.trim()) throw new Error('অনুগ্রহ করে শিক্ষার্থীর নাম লিখুন')
      if (childAge < 4 || childAge > 10) {
        throw new Error('শিক্ষার্থীর বয়স অবশ্যই ৪ থেকে ১০ বছরের মধ্যে হতে হবে')
      }
      if (classroomEmailChoice === 'student' && (!cleanStudentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanStudentEmail))) {
        throw new Error('অনুগ্রহ করে শিক্ষার্থীর সঠিক Gmail ঠিকানা দিন অথবা অভিভাবকের ইমেইল নির্বাচন করুন')
      }
      if (!shippingAddress.trim()) throw new Error('অনুগ্রহ করে পূর্ণাঙ্গ ডেলিভারি ঠিকানা দিন')

      // 2. Attempt User Authentication (Strictly non-blocking with timeout for COD checkout)
      try {
        const authTask = async () => {
          const { data: sessionData } = await supabase.auth.getSession()

          if (!sessionData?.session?.user) {
            if (isExistingUser && password.trim()) {
              const { error: loginError } = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password: password.trim(),
              })
              if (loginError) {
                console.warn('Login note:', loginError.message)
                await supabase.auth.signOut().catch(() => {})
              }
            } else if (password.trim()) {
              const { error: signUpError } = await supabase.auth.signUp({
                email: cleanEmail,
                password: password.trim(),
                options: {
                  data: {
                    full_name: parentName.trim(),
                    phone: normalizedPhone,
                  },
                },
              })
              if (signUpError) {
                console.warn('SignUp note:', signUpError.message)
                await supabase.auth.signOut().catch(() => {})
              }
            }
          }
        }

        await Promise.race([
          authTask(),
          new Promise((resolve) => setTimeout(resolve, 3500)),
        ])
      } catch (authErr) {
        console.warn('Auth check skipped:', authErr)
      }

      // 3. Determine Classroom Email
      const chosenClassroomEmail =
        classroomEmailChoice === 'student' && cleanStudentEmail
          ? cleanStudentEmail
          : cleanEmail

      const rpcPayload = {
        p_parent_name: parentName.trim(),
        p_parent_phone: normalizedPhone,
        p_parent_email: cleanEmail,
        p_child_name: childName.trim(),
        p_child_age: Number(childAge),
        p_shipping_district: shippingDistrict,
        p_shipping_address: shippingAddress.trim(),
        p_classroom_email: chosenClassroomEmail,
        p_classroom_email_type: classroomEmailChoice,
        p_notes: notes.trim() || null,
      }

      // 4. Create Order: Supabase RPC (with timeout guard) -> Direct REST RPC (bypasses stale JWT/locks) -> Direct Table Fallback
      let generatedOrderNumber = ''

      let primaryRpcError: string | undefined
      try {
        const rpcResponse = await Promise.race([
          supabase.rpc('create_package_order_v1', rpcPayload),
          new Promise<{ data: null; error: { message: string } }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: { message: 'RPC timeout' } }), 5000)
          ),
        ])
        const rpcOrderNumber = Array.isArray(rpcResponse.data)
          ? rpcResponse.data[0]?.order_number
          : rpcResponse.data?.order_number
        if (!rpcResponse.error && rpcOrderNumber) {
          generatedOrderNumber = rpcOrderNumber
        } else {
          primaryRpcError = rpcResponse.error?.message
        }
      } catch (rpcErr: any) {
        primaryRpcError = rpcErr?.message
      }

      if (!generatedOrderNumber) {
        console.warn('Primary RPC failed, retrying direct REST RPC:', primaryRpcError)

        try {
          const restRes = await fetch(`${supabaseUrl}/rest/v1/rpc/create_package_order_v1`, {
            method: 'POST',
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(rpcPayload),
          })
          if (restRes.ok) {
            const restData = await restRes.json()
            const restOrderNumber = Array.isArray(restData)
              ? restData[0]?.order_number
              : restData?.order_number
            if (restOrderNumber) {
              generatedOrderNumber = restOrderNumber
            }
          } else {
            const errBody = await restRes.json().catch(() => null)
            console.warn('Direct REST RPC error:', errBody?.message || restRes.statusText)
          }
        } catch (restErr) {
          console.warn('Direct REST RPC failed:', restErr)
        }
      }

      if (!generatedOrderNumber) {
        const cleanPhone = normalizedPhone
        const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString()
        const orderNum = `KE-2026-${randomSuffix}`
        const trackingNum = `STDF-${randomSuffix}`

        // Step 4a: Get or create parent (use limit(1) instead of maybeSingle to tolerate duplicate phone records)
        let parentId: string | null = null
        const { data: existingParents } = await supabase
          .from('parents')
          .select('id')
          .eq('phone', cleanPhone)
          .limit(1)

        if (existingParents && existingParents.length > 0 && existingParents[0]?.id) {
          parentId = existingParents[0].id
          await supabase
            .from('parents')
            .update({
              full_name: parentName.trim(),
              google_email: cleanEmail || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', parentId)
        } else {
          const { data: newParent, error: pErr } = await supabase
            .from('parents')
            .insert({
              full_name: parentName.trim(),
              phone: cleanPhone,
              google_email: cleanEmail || null,
            })
            .select('id')
            .single()

          if (pErr) throw new Error(`অভিভাবকের তথ্য সংরক্ষণ ত্রুটি: ${pErr.message}`)
          parentId = newParent.id
        }

        // Step 4b: Insert child
        const { data: newChild, error: cErr } = await supabase
          .from('children')
          .insert({
            parent_id: parentId,
            full_name: childName.trim(),
            age: Number(childAge),
            notes: notes.trim() || null,
          })
          .select('id')
          .single()

        if (cErr) throw new Error(`শিক্ষার্থীর তথ্য সংরক্ষণ ত্রুটি: ${cErr.message}`)

        // Step 4c: Insert order (৳990 + ৳90 = ৳1,080 COD)
        const { data: newOrder, error: oErr } = await supabase
          .from('orders')
          .insert({
            order_number: orderNum,
            parent_id: parentId,
            child_id: newChild.id,
            package_price: 990.0,
            delivery_fee: 90.0,
            total_amount: 1080.0,
            payment_method: 'cod',
            order_status: 'confirmed',
            shipping_district: shippingDistrict,
            shipping_address: shippingAddress.trim(),
            shipping_phone: cleanPhone,
            notes: notes.trim() || null,
          })
          .select('id')
          .single()

        if (oErr) throw new Error(`অর্ডার তৈরি ত্রুটি: ${oErr.message}`)

        // Step 4d: Insert initial shipment attempt #1
        const { error: sErr } = await supabase.from('shipments').insert({
          order_id: newOrder.id,
          attempt_number: 1,
          is_current_attempt: true,
          courier: 'steadfast',
          consignment_id: 'PENDING',
          tracking_code: trackingNum,
          cod_target: 1080.0,
          status: 'in_transit',
          dispatched_at: new Date().toISOString(),
          refusal_fee_status: 'pending',
          refusal_fee_amount: 90.0,
          courier_return_cost: 0,
        })
        if (sErr) console.warn('Shipment insert note:', sErr.message)

        // Step 4e: Insert enrollment record
        const { error: eErr } = await supabase.from('enrollments').insert({
          order_id: newOrder.id,
          child_id: newChild.id,
          selected_classroom_email: chosenClassroomEmail,
          classroom_email_type: classroomEmailChoice,
          classroom_status: 'pending',
          whatsapp_status: 'not_revealed',
          learning_access_activated: false,
        })
        if (eErr) console.warn('Enrollment insert note:', eErr.message)

        generatedOrderNumber = orderNum
      }

      setConfirmedOrderNumber(generatedOrderNumber)
      router.push(`/order-success/${generatedOrderNumber}`)
    } catch (err: any) {
      console.error('Order creation error:', err)
      setErrorMessage(err.message || 'অর্ডার প্রক্রিয়াকরণে কোনো ত্রুটি হয়েছে। আবার চেষ্টা করুন।')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F6FAF7] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            হোমপেজে ফিরে যান
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <Truck className="w-3.5 h-3.5 text-amber-700" />
              ক্যাশ অন ডেলিভারি (COD)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              ১০০% নিরাপদ ভর্তি
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Checkout Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-sm">
            <div className="mb-6">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> ভর্তির তথ্য পূরণ করুন
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mt-1">
                KidsEngregy লার্নিং প্যাকেজ ভর্তি ফর্ম
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                ৪–১০ বছরের শিশুদের জন্য ফনিক্স বই, ২৬টি লাইভ ক্লাস এবং ৮০+ ভিডিও রিসোর্স।
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                <strong>ত্রুটি:</strong> {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitOrder} noValidate className="space-y-6">
              {/* Step 1: Parent Information */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-emerald-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  ১. অভিভাবকের তথ্য (Parent Profile)
                </h2>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    অভিভাবকের পূর্ণ নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="যেমন: মোঃ কামরুল হাসান"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      অভিভাবকের ইমেইল (Google Email) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="parent@gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {!currentUserEmail && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-gray-500" />
                        ড্যাশবোর্ড পাসওয়ার্ড
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsExistingUser(!isExistingUser)}
                        className="text-xs text-emerald-700 hover:underline font-semibold"
                      >
                        {isExistingUser ? 'নতুন অভিভাবক? সাইন আপ করুন' : 'আগেই একাউন্ট আছে? লগইন করুন'}
                      </button>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isExistingUser ? 'আপনার পাসওয়ার্ড লিখুন' : 'লগইনের জন্য একটি পাসওয়ার্ড দিন (বা খালি রাখুন)'}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      পাসওয়ার্ড দিয়ে পরবর্তীতে যেকোনো সময় লগইন করে আপনার সন্তানের লার্নিং অ্যাক্সেস ও কুরিয়ার স্ট্যাটাস দেখতে পারবেন।
                    </p>
                  </div>
                )}
              </div>

              {/* Step 2: Child Information */}
              <div className="space-y-4 pt-2">
                <h2 className="text-base font-bold text-emerald-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  ২. শিক্ষার্থীর তথ্য (Child Details)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      শিক্ষার্থীর পূর্ণ নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="যেমন: আরিয়ান হাসান"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      বয়স (৪–১০ বছর) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={childAge}
                      onChange={(e) => setChildAge(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all bg-white"
                    >
                      {[4, 5, 6, 7, 8, 9, 10].map((age) => (
                        <option key={age} value={age}>
                          {age} বছর
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Google Classroom Email Choice */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                  <label className="block text-xs font-bold text-emerald-950">
                    গুগল ক্লাসরুম (Google Classroom) ইমেইল নির্ধারণ
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-emerald-200 cursor-pointer">
                      <input
                        type="radio"
                        name="classroomChoice"
                        checked={classroomEmailChoice === 'parent'}
                        onChange={() => setClassroomEmailChoice('parent')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>অভিভাবকের ইমেইল ব্যবহার হবে</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-emerald-200 cursor-pointer">
                      <input
                        type="radio"
                        name="classroomChoice"
                        checked={classroomEmailChoice === 'student'}
                        onChange={() => setClassroomEmailChoice('student')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>শিক্ষার্থীর আলাদা Gmail আছে</span>
                    </label>
                  </div>

                  {classroomEmailChoice === 'student' && (
                    <div className="pt-2">
                      <input
                        type="email"
                        value={studentGmail}
                        onChange={(e) => setStudentGmail(e.target.value)}
                        placeholder="student.name@gmail.com"
                        className="w-full px-4 py-2 rounded-xl border border-emerald-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Delivery Address */}
              <div className="space-y-4 pt-2">
                <h2 className="text-base font-bold text-emerald-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  ৩. ফনিক্স বই ডেলিভারি ঠিকানা (Steadfast Courier)
                </h2>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    জেলা (District) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={shippingDistrict}
                    onChange={(e) => setShippingDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all bg-white"
                  >
                    {DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকা ও থানা) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="যেমন: বাসা নং ১২, রোড নং ৪, সেক্টর ৭, উত্তরা, ঢাকা"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    বিশেষ কোনো নির্দেশনা (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="যেমন: বিকেলে কল দিয়ে ডেলিভারি দিবেন"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 space-y-3">
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                    <strong>ত্রুটি:</strong> {errorMessage}
                  </div>
                )}

                {confirmedOrderNumber ? (
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3 text-center">
                    <div className="inline-flex items-center gap-2 text-emerald-700 font-extrabold text-base">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>অর্ডার সফলভাবে নিশ্চিত হয়েছে!</span>
                    </div>
                    <p className="text-sm text-emerald-900">
                      অর্ডার নম্বর: <strong className="font-mono">{confirmedOrderNumber}</strong>
                    </p>
                    <Link
                      href={`/order-success/${confirmedOrderNumber}`}
                      className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all"
                    >
                      <span>অর্ডার কনফার্মেশন পেজ দেখুন</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base sm:text-lg shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span>অর্ডার প্রসেস হচ্ছে...</span>
                    ) : (
                      <>
                        <span>ক্যাশ অন ডেলিভারিতে অর্ডার নিশ্চিত করুন</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}

                <p className="text-center text-xs text-gray-500 mt-2">
                  🔒 কোনো অগ্রিম পেমেন্ট নেই। পার্সেল হাতে পেয়ে কুরিয়ার ডেলিভারিম্যানকে ১,০৮০ টাকা দিন।
                </p>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-900/10 shadow-sm space-y-5">
              <h2 className="text-base font-extrabold text-emerald-950 pb-3 border-b border-gray-100 flex items-center justify-between">
                <span>অর্ডার সামারি</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {SITE_CONFIG.targetAge}
                </span>
              </h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">KidsEngregy সম্পূর্ণ লার্নিং প্যাকেজ</h3>
                    <p className="text-xs text-gray-500">ফনিক্স হার্ডকপি বই + ২৬টি লাইভ ক্লাস + ৮০+ ভিডিও</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>আন্তর্জাতিকভাবে প্রমাণিত ফনিক্স পদ্ধতিতে রিডিং শেখা</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>সাপোর্ট টিচারের সাপ্তাহিক গাইডলাইন ও হোমওয়ার্ক চেক</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>অভিভাবকদের জন্য WhatsApp সাপোর্ট গ্রুপ ও প্রগ্রেস ট্র্যাকিং</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-gray-100 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>প্যাকেজের নিয়মিত মূল্য</span>
                  <span className="line-through">৳২,৫০০</span>
                </div>
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>অফার প্যাকেজ মূল্য</span>
                  <span>৳৯৯০</span>
                </div>
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>স্টেডফাস্ট কুরিয়ার চার্জ</span>
                  <span>৳৯০</span>
                </div>
                <div className="pt-3 border-t-2 border-dashed border-gray-200 flex justify-between items-center text-emerald-950 font-extrabold text-base">
                  <span>সর্বমোট প্রদেয় (COD)</span>
                  <span className="text-xl text-emerald-700">৳১,০৮০</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1">
                <strong className="block font-bold">📦 ক্যাশ অন ডেলিভারি নিয়মাবলী:</strong>
                <p className="leading-relaxed">
                  পার্সেল রিসিভ করার সময় ডেলিভারিম্যানকে ১,০৮০ টাকা দিয়ে ফনিক্স বই বুঝে নিবেন। বই পাওয়ার পর কুরিয়ার কনফার্মেশন ও রেমিট্যান্স শিট যাচাই হলেই লার্নিং অ্যাক্সেস সরাসরি চালু হবে।
                </p>
              </div>

              <div className="text-center text-xs text-gray-500 pt-1">
                যেকোনো প্রয়োজনে WhatsApp হেল্পলাইন:{' '}
                <a
                  href="https://wa.me/8801893225855"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-700 hover:underline"
                >
                  01893-225855
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
