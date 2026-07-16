import { createClient } from '@supabase/supabase-js'

// Service-role client for use ONLY in server-side code (API routes).
// This key bypasses Row Level Security entirely, so it must never be
// imported into any file that ships to the browser ('use client' files).
// Every route that uses this client is responsible for its own
// authorization check (e.g. requireAdmin() below).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Log (without leaking the actual secret) exactly what this deployment
// sees for these two vars, so a missing/misnamed env var shows up
// clearly in Vercel's Runtime Logs instead of causing a silent crash.
if (!supabaseUrl) {
  console.error('[supabaseAdmin] NEXT_PUBLIC_SUPABASE_URL is missing at runtime')
}
if (!serviceRoleKey) {
  console.error('[supabaseAdmin] SUPABASE_SERVICE_ROLE_KEY is missing at runtime')
} else {
  console.log('[supabaseAdmin] SUPABASE_SERVICE_ROLE_KEY present, length:', serviceRoleKey.length, 'prefix:', serviceRoleKey.slice(0, 6))
}

export const supabaseAdmin = createClient(
  supabaseUrl || '',
  serviceRoleKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
