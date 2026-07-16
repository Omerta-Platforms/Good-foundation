import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// createBrowserClient (from @supabase/ssr) stores the session in
// cookies instead of localStorage. This matters because our
// middleware runs on the server and can only read cookies — if the
// session only lived in localStorage (the plain @supabase/supabase-js
// default), middleware would never see a logged-in user and would
// keep redirecting them back to login even right after a successful
// sign-in.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
