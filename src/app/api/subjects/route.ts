import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdminAuthorized } from '@/lib/utils/require-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const teacherId = searchParams.get('teacherId')

    let queryBuilder = supabaseAdmin
      .from('subjects')
      .select(`
        *,
        teacher:teachers(first_name, last_name),
        class:classes(name)
      `)

    if (classId) {
      queryBuilder = queryBuilder.eq('class_id', classId)
    }

    if (teacherId) {
      queryBuilder = queryBuilder.eq('teacher_id', teacherId)
    }

    const { data: subjects, error } = await queryBuilder

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ subjects })
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Subjects can be created by the admin (shared-password cookie) OR by a
// logged-in teacher (Supabase Auth session forwarded via Authorization
// header from the browser client). We accept either.
export async function POST(request: Request) {
  try {
    const isAdmin = isAdminAuthorized()

    let teacherId: string | null = null
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
      teacherId = userData.user.id
    }

    const body = await request.json()
    const { name, class_id, teacher_id } = body

    if (!name || !class_id) {
      return NextResponse.json(
        { error: 'Name and class_id are required' },
        { status: 400 }
      )
    }

    const { data: subject, error } = await supabaseAdmin
      .from('subjects')
      .insert({
        name,
        class_id,
        teacher_id: teacherId || teacher_id || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ subject }, { status: 201 })
  } catch (error) {
    console.error('Error creating subject:', error)
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
      return NextResponse.json({ error: 'Subject id is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from('subjects').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting subject:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
 }
      
