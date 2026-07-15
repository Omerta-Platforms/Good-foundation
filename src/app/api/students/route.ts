import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdminAuthorized } from '@/lib/utils/require-admin'

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

    // Also remove their Supabase Auth account so the email can be reused.
    await supabaseAdmin.auth.admin.deleteUser(id).catch(() => {
      // Non-fatal: the auth user may already be gone.
    })

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
