import { NextResponse } from 'next/server'

// Simple shared-password gate for the admin dashboard.
// This is intentionally NOT a per-account system (per product decision) —
// it just checks one password stored in an environment variable and, if
// correct, sets an httpOnly cookie that the middleware checks on every
// request to /admin/dashboard.
export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    const expected = process.env.ADMIN_DASHBOARD_PASSWORD

    if (!expected) {
      console.error('ADMIN_DASHBOARD_PASSWORD is not set in environment variables')
      return NextResponse.json(
        { error: 'Admin login is not configured on the server' },
        { status: 500 }
      )
    }

    if (!password || password !== expected) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set('admin_session', 'authorized', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  // Logout: clear the cookie
  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}

