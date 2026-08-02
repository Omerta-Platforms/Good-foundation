import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdminAuthorized } from '@/lib/utils/require-admin'

// This route reads live data that changes whenever the admin/teacher
// creates or deletes a student, so it must never be cached — otherwise
// the dashboard can keep showing stale counts/lists after an update.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const classId = searchParams.get('classId')
    const admissionNumber = searchParams.get('admissionNumber')

    let queryBuilder = supabaseAdmin.from('students').select(`
      *,
      class:classes(name)
    `)

    if (query) {
      queryBuilder = queryBuilder.or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,admission_number.ilike.%${query}%`
      )
    }

    if (classId) {
      queryBuilder = queryBuilder.eq('class_id', classId)
    }

    if (admissionNumber) {
      queryBuilder = queryBuilder.eq('admission_number', admissionNumber)
    }

    const { data: students, error } = await queryBuilder

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Creates a student record directly — students no longer have login
// accounts (only the public result checker is used, looked up by
// admission_number), so there's no Supabase Auth step here, unlike
// teachers. Callable by the admin dashboard (admin_session cookie) or
// a logged-in teacher (Supabase Auth session token).
//
// `password` here is NOT a real account password — it's a shared
// secret the admin/teacher sets so only someone who has it (ideally
// the student/parent) can view results on the public result checker.
// It's hashed with Postgres's pgcrypto crypt()/gen_salt('bf') via the
// hash_student_password RPC, matching the format the
// check_student_results RPC verifies against.
export async function POST(request: Request) {
  try {
    const isAdmin = isAdminAuthorized()

    if (!isAdmin) {
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
      if (userError || !userData.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { firstName, lastName, admissionNumber, classId, password } = await request.json()

    if (!firstName || !lastName || !admissionNumber || !classId || !password) {
      return NextResponse.json(
        { error: 'First name, last name, admission number, class, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters' },
        { status: 400 }
      )
    }

    const { data: hashedPassword, error: hashError } = await supabaseAdmin.rpc('hash_student_password', {
      p_password: password,
    })

    if (hashError) {
      console.error('Error hashing password:', hashError)
      return NextResponse.json({ error: 'Failed to process password' }, { status: 500 })
    }

    const { data: student, error } = await supabaseAdmin
      .from('students')
      .insert({
        first_name: firstName,
        last_name: lastName,
        admission_number: admissionNumber,
        class_id: classId,
        password_hash: hashedPassword,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, student }, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isAdminAuthorized()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Student id is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from('students').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

      
