import { createClient } from '@supabase/supabase-js'

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mxgfhvkftspwjigftlan.supabase.co'

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_CRe7MJVsQVsW5q36eQUHsA_K_G57BGp'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
