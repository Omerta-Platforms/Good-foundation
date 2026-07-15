import { cookies } from 'next/headers'

// Checks the admin_session cookie set by /api/admin/login.
// Use this at the top of any admin-only API route.
export function isAdminAuthorized(): boolean {
  const cookieStore = cookies()
  return cookieStore.get('admin_session')?.value === 'authorized'
}
