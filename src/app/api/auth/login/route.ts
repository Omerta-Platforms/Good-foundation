import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, staffId, password, role } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Determine which table to query based on role
    let table = ''
    let queryField = ''

    if (role === 'student') {
      table = 'students'
      queryField = 'email'
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required for students' },
          { status: 400 }
        )
      }
    } else if (role === 'staff') {
      table = 'teachers'
      queryField = 'staff_id'
      if (!staffId) {
        return NextResponse.json(
          { error: 'Staff ID is required for teachers' },
          { status: 400 }
        )
      }
    } else if (role === 'admin') {
      table = 'admins'
      queryField = 'email'
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required for admins' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Query the user
    const { data: user, error } = await supabase
      .from(table)
      .select('*')
      .eq(queryField, role === 'staff' ? staffId : email)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      role
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
