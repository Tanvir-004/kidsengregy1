'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  CheckCircle2,
  Package,
  Truck,
  MessageCircle,
  Home,
  ShieldCheck,
  Calendar,
  ArrowRight,
  BookOpen,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { SITE_CONFIG } from '@/lib/config/site'

export default function OrderSuccessPage() {
  const params = useParams()
  const orderNumber = (params?.orderNumber as string) || 'KE-2026-NEW'

  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            total_amount,
            order_status,
            shipping_district,
            shipping_address,
            shipping_phone,
            created_at,
            children (full_name, age),
            shipments (tracking_code, consignment_id, status)
          `)
          .eq('order_number', orderNumber)
          .single()

        if (data) {
          setOrderData(data)
        } else {
          // Fallback to RPC if RLS restricts direct select
          const { data: rpcData, error: rpcErr } = await supabase.rpc('get_order_by_number', {
            p_order_number: orderNumber,
          })
          if (rpcData && !rpcErr) {
            setOrderData(rpcData)
          }
        }
      } catch (err) {
        console.error('Fetch order error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (orderNumber) {
      fetchOrder()
    }
  }, [orderNumber])

  return (
    <div className="min-h-screen bg-[#F6FAF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-900/10 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              অর্ডার সফলভাবে গৃহীত হয়েছে
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mt-1">
              অভিনন্দন! আপনার সন্তানের ভর্তি কনফার্ম হয়েছে
            </h1>
            <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
              KidsEngregy লার্নিং প্যাকেজের ফনিক্স বই প্রস্তুত হচ্ছে। কুরিয়ারে পৌঁছালে আপনাকে অবহিত করা হবে।
            </p>
          </div>

          {/* Order Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-base font-bold">
            <span>অর্ডার নম্বর:</span>
            <span className="text-emerald-700">{orderNumber}</span>
          </div>

          {/* Order Details Box */}
          <div className="p-5 rounded-2xl bg-[#F6FAF7] border border-gray-200 text-left space-y-3 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-500">প্যাকেজ</span>
              <strong className="text-gray-900">KidsEngregy সম্পূর্ণ লার্নিং প্যাকেজ (৪–১০ বছর)</strong>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-500">পেমেন্ট মেথড</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 text-xs">
                ক্যাশ অন ডেলিভারি (COD)
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-500">কুরিয়ারে প্রদেয় টাকা</span>
              <strong className="text-base text-emerald-700">৳১,০৮০ (বই হাতে পেয়ে)</strong>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-500">ডেলিভারি কুরিয়ার</span>
              <span className="font-semibold text-gray-800">স্টেডফাস্ট কুরিয়ার (Steadfast)</span>
            </div>

            {orderData?.shipping_district && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">ডেলিভারি জেলা</span>
                <span className="text-gray-800">{orderData.shipping_district}</span>
              </div>
            )}
          </div>

          {/* Next Steps Guide */}
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-left space-y-2">
            <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              পরবর্তী গুরুত্বপূর্ণ তথ্য ও অ্যাক্টিভেশন নিয়ম
            </h3>
            <ul className="text-xs text-amber-900 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>
                <strong>পার্সেল রিসিভ:</strong> কুরিয়ার ডেলিভারিম্যান আপনার ঠিকানায় ফনিক্স বই পৌঁছে দিলে ১,০৮০ টাকা দিয়ে পার্সেল সংগ্রহ করুন।
              </li>
              <li>
                <strong>দ্বিমুখী লার্নিং অ্যাক্টিভেশন:</strong> কুরিয়ার ডেলিভারি সম্পন্ন এবং প্রতিদিনের রেমিট্যান্স শিট যাচাই হওয়ার সাথে সাথে আপনার WhatsApp গ্রুপ ও গুগল ক্লাসরুম লিংক উন্মুক্ত হবে।
              </li>
              <li>
                আমাদের প্রতিনিধি প্রয়োজনে আপনার দেওয়া মোবাইল নম্বরে ফোন করে ঠিকানা নিশ্চিত করতে পারেন।
              </li>
            </ul>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href="https://wa.me/8801893225855?text=আমার%20অর্ডার%20নম্বর%20নিয়ে%20কথা%20বলতে%20চাই"
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp সাপোর্টে লিখুন
            </a>

            <Link
              href="/"
              className="py-3 px-5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              হোমপেজে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
