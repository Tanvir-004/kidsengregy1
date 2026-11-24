import type { Metadata, Viewport } from 'next'
import { Hind_Siliguri, Nunito_Sans } from 'next/font/google'
import './globals.css'

const Analytics = () => null

const hindSiliguri = Hind_Siliguri({ subsets: ['bengali', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-bengali', display: 'swap' })
const nunitoSans = Nunito_Sans({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-english', display: 'swap' })

export const metadata: Metadata = {
  title: 'KidsEngregy | আনন্দে ইংরেজি শিখুক আপনার সন্তান',
  description: '৮–১০ বছর বয়সী শিশুদের জন্য লাইভ ক্লাস, ফনিক্স বই ও মজার ভিডিওসহ আনন্দময় ইংলিশ লার্নিং প্রোগ্রাম।',
  applicationName: 'KidsEngregy',
  generator: 'Next.js',
  openGraph: {
    title: 'KidsEngregy | আনন্দে ইংরেজি শিখুক আপনার সন্তান',
    description: 'শিশুদের জন্য আনন্দময় ইংলিশ লার্নিং প্রোগ্রাম।',
    locale: 'bn_BD',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#F0FDF4',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn">
      <body className={`${hindSiliguri.variable} ${nunitoSans.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
