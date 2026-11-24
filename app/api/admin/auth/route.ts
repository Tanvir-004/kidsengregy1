import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'ke_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function getSigningSecret(): string | null {
  if (process.env.ADMIN_SESSION_SECRET) {
    return process.env.ADMIN_SESSION_SECRET
  }
  if (process.env.ADMIN_PASSWORD) {
    return crypto
      .createHash('sha256')
      .update(`kidsengregy-admin-session:${process.env.ADMIN_PASSWORD}`)
      .digest('hex')
  }
  return null
}

function signToken(exp: number, secret: string): string {
  const payload = String(exp)
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${sig}`
}

function verifyToken(token: string | undefined, secret: string | null): boolean {
  if (!token || !secret) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [payload, sig] = parts
  const exp = Number(payload)
  if (!Number.isFinite(exp) || Date.now() > exp) return false

  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  const a = Buffer.from(sig, 'utf8')
  const b = Buffer.from(expectedSig, 'utf8')
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

function safePasswordCompare(input: string, expected: string): boolean {
  const inputHash = crypto.createHash('sha256').update(input).digest()
  const expectedHash = crypto.createHash('sha256').update(expected).digest()
  return crypto.timingSafeEqual(inputHash, expectedHash)
}

export async function GET(req: NextRequest) {
  const configured = Boolean(process.env.ADMIN_PASSWORD)
  const secret = getSigningSecret()
  const token = req.cookies.get(COOKIE_NAME)?.value
  const authenticated = configured && verifyToken(token, secret)

  return NextResponse.json({
    authenticated,
    configured,
  })
}

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json(
      {
        authenticated: false,
        configured: false,
        error:
          'সার্ভারে ADMIN_PASSWORD সেট করা নেই। Vercel Settings → Environment Variables অথবা .env.local ফাইলে ADMIN_PASSWORD যোগ করুন।',
      },
      { status: 503 }
    )
  }

  try {
    const body = await req.json()
    const submittedPassword = typeof body?.password === 'string' ? body.password : ''

    if (!submittedPassword || !safePasswordCompare(submittedPassword, adminPassword)) {
      return NextResponse.json(
        {
          authenticated: false,
          configured: true,
          error: 'পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে আবার চেষ্টা করুন।',
        },
        { status: 401 }
      )
    }

    const secret = getSigningSecret()
    if (!secret) {
      return NextResponse.json(
        { authenticated: false, configured: false, error: 'Session secret error' },
        { status: 500 }
      )
    }

    const exp = Date.now() + SESSION_TTL_MS
    const token = signToken(exp, secret)

    const res = NextResponse.json({ authenticated: true, configured: true })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    })
    return res
  } catch {
    return NextResponse.json(
      { authenticated: false, configured: true, error: 'অনুরোধ প্রক্রিয়াকরণে ত্রুটি হয়েছে।' },
      { status: 400 }
    )
  }
}

export async function DELETE() {
  const res = NextResponse.json({ authenticated: false })
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  return res
}
