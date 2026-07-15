import { createClient } from '@supabase/supabase-js'

// Service-role client for use ONLY in server-side code (API routes).
// This key bypasses Row Level Security entirely, so it must never be
// imported into any file that ships to the browser ('use client' files).
// Every route that uses this client is responsible for its own
// authorization check (e.g. requireAdmin() below).
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

