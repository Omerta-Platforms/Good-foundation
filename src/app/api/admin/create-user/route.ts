import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdminAuthorized } from '@/lib/utils/require-admin'

// Creates a real Supabase Auth account plus the matching teacher row.
// This is admin-only now — students no longer have login accounts
// (only the public result checker, looked up by admission_number, is
// used), so student creation goes through the simpler /api/students
// route instead, which does a plain table insert with no Auth step.
export async function POST(request: Request) {
  try {
    if (!isAdminAuthorized()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, password, firstName, lastName, staffId, phone, subjectId } = await request.json()

    if (!email || !password || !firstName || !lastName || !staffId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Step 1: Create the real auth account. This is what login actually
    // checks (supabase.auth.signInWithPassword), so this step is what
    // makes the account usable.
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'teacher',
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
    const { error: recordError } = await supabaseAdmin
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
      message: 'Teacher created successfully'
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
