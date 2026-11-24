/**
 * KidsEngregy V1 Site & Support Configuration
 * Centralized business configuration as per approved business decisions.
 */

export const SITE_CONFIG = {
  name: 'KidsEngregy',
  tagline: '৪–১০ বছরের বাচ্চাদের ইংরেজি রিডিং অনলাইন প্রোগ্রাম',
  targetAge: '৪–১০ বছর',
  pricing: {
    regularPrice: 2500,
    packagePrice: 990,
    deliveryFee: 90,
    totalCodAmount: 1080,
    refusalFee: 90,
  },
  support: {
    // Approved temporary customer support WhatsApp number
    // Original: 01893225855 -> URL: https://wa.me/8801893225855
    whatsappRaw: '01893225855',
    whatsappInternational: '8801893225855',
    whatsappFormatted: '01893-225855',
  },
  navigation: {
    admin: '/admin',
    orders: '/admin/orders',
    shipments: '/admin/shipments',
    reconciliation: '/admin/reconciliation',
  },
}

/**
 * Returns a functional WhatsApp direct chat URL with pre-filled message.
 * Falls back to 8801893225855 if environment variable is not defined.
 */
export function getWhatsAppUrl(message?: string): string {
  const phone =
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE?.replace(/\D/g, '') ||
    SITE_CONFIG.support.whatsappInternational

  const defaultMsg = 'KidsEngregy লার্নিং প্যাকেজ ও ভর্তি সংক্রান্ত বিস্তারিত জানতে চাই।'
  const text = encodeURIComponent(message || defaultMsg)

  return `https://wa.me/${phone}?text=${text}`
}
