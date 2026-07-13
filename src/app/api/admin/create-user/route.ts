import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create admin client with service role key (server-side only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { email, password, role, firstName, lastName, staffId, admissionNumber, classId, phone, subjectId, dateOfBirth, parentPhone, parentEmail } = await request.json()

    // Validate required fields
    if (!email || !password || !role || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Step 1: Create auth user
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

    // Step 2: Create record in the appropriate table
    let recordError = null

    if (role === 'student') {
      // Create student record
      const { error } = await supabaseAdmin
        .from('students')
        .insert({
          id: authUser.user.id,
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          admission_number: admissionNumber || null,
          class_id: classId || null,
          date_of_birth: dateOfBirth || null,
          parent_phone: parentPhone || null,
          parent_email: parentEmail || null
        })
      recordError = error
    } else if (role === 'teacher') {
      // Create teacher record
      const { error } = await supabaseAdmin
        .from('teachers')
        .insert({
          id: authUser.user.id,
          email,
          staff_id: staffId || null,
          password,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          subject_id: subjectId || null
        })
      recordError = error
    }

    if (recordError) {
      console.error('Record creation error:', recordError)
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
