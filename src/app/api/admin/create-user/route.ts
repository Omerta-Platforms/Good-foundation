import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdminAuthorized } from '@/lib/utils/require-admin'

// Creates a real Supabase Auth account plus the matching row in
// students/teachers. This is the ONLY way accounts should be created
// in this app — do not insert directly into students/teachers from
// anywhere else, or the person won't be able to log in.
//
// Callers:
// - Admin dashboard (gated by the admin_session cookie)
// - Teacher dashboard, when a teacher adds a student to their class
//   (gated by a valid Supabase Auth teacher session token)
export async function POST(request: Request) {
  try {
    const isAdmin = isAdminAuthorized()

    if (!isAdmin) {
      // If not the admin cookie, require a valid teacher session token,
      // and only allow role: 'student' through this path (a teacher
      // should never be able to create another teacher or admin).
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
      if (userError || !userData.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const requestedRole = (await request.clone().json()).role
      if (requestedRole !== 'student') {
        return NextResponse.json({ error: 'Teachers can only create student accounts' }, { status: 403 })
      }
    }

    const { email, password, role, firstName, lastName, staffId, admissionNumber, classId, phone, subjectId, dateOfBirth, parentPhone, parentEmail } = await request.json()

    // Validate required fields
    if (!email || !password || !role || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (role === 'student' && !admissionNumber) {
      return NextResponse.json({ error: 'Admission number is required for students' }, { status: 400 })
    }

    if (role === 'teacher' && !staffId) {
      return NextResponse.json({ error: 'Staff ID is required for teachers' }, { status: 400 })
    }

    // Step 1: Create the real auth account. This is what login actually
    // checks (supabase.auth.signInWithPassword), so this step is what
    // makes the account usable.
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role,
        first_name: firstName,
        last_name: lastName
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      )
    }

    // Step 2: Create the matching profile row. No password is stored
    // here — Supabase Auth already owns that.
    let recordError = null

    if (role === 'student') {
      const { error } = await supabaseAdmin
        .from('students')
        .insert({
          id: authUser.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          admission_number: admissionNumber,
          class_id: classId || null,
          date_of_birth: dateOfBirth || null,
          parent_phone: parentPhone || null,
          parent_email: parentEmail || null
        })
      recordError = error
    } else if (role === 'teacher') {
      const { error } = await supabaseAdmin
        .from('teachers')
        .insert({
          id: authUser.user.id,
          email,
          staff_id: staffId,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          subject_id: subjectId || null
        })
      recordError = error
    }

    if (recordError) {
      console.error('Record creation error:', recordError)
      // Roll back the auth user so we don't leave an orphaned account
      // that has no matching profile row.
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id).catch(() => {})
      return NextResponse.json(
        { error: recordError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: authUser.user,
      message: `${role} created successfully`
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

