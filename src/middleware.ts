import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Admin dashboard is gated by a shared-password cookie set by
  // /api/admin/login, NOT by Supabase Auth. If the cookie isn't
  // present/valid, bounce to the admin login page.
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const adminCookie = request.cookies.get('admin_session')?.value
    if (adminCookie !== 'authorized') {
      return NextResponse.redirect(new URL('/login/admin', request.url))
    }
    return NextResponse.next()
  }

  // Allow login pages
  if (request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/teacher')

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login/staff', request.url))
  }

  // Auth routes (login, register) - redirect to dashboard if already logged in
  const isAuthRoute = 
    request.nextUrl.pathname === '/login/staff' ||
    request.nextUrl.pathname === '/register'

  if (isAuthRoute && session) {
    // Check role and redirect accordingly
    const role = session.user.user_metadata?.role
    if (role === 'teacher') {
      return NextResponse.redirect(new URL('/teacher/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/teacher/:path*',
    '/admin/:path*',
    '/login/:path*',
    '/register',
  ],
 }
