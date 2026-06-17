import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    let queryBuilder = supabase
      .from('subjects')
      .select(`
        *,
        teacher:teachers(first_name, last_name),
        class:classes(name)
      `)

    if (classId) {
      queryBuilder = queryBuilder.eq('class_id', classId)
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, class_id, teacher_id } = body

    if (!name || !class_id) {
      return NextResponse.json(
        { error: 'Name and class_id are required' },
        { status: 400 }
      )
    }

    const { data: subject, error } = await supabase
      .from('subjects')
      .insert({ name, class_id, teacher_id })
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
