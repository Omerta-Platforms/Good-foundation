import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const date = searchParams.get('date')

    let queryBuilder = supabase
      .from('attendance')
      .select(`
        *,
        student:students(first_name, last_name, admission_number)
      `)

    if (studentId) {
      queryBuilder = queryBuilder.eq('student_id', studentId)
    }

    if (date) {
      queryBuilder = queryBuilder.eq('date', date)
    }

    const { data: attendance, error } = await queryBuilder

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { student_id, status, date } = body

    if (!student_id || !status) {
      return NextResponse.json(
        { error: 'Student ID and status are required' },
        { status: 400 }
      )
    }

    // Check if attendance already exists for this student today
    const today = date || new Date().toISOString().split('T')[0]
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_id', student_id)
      .eq('date', today)
      .single()

    let result
    if (existing) {
      // Update existing attendance
      const { data: attendance, error } = await supabase
        .from('attendance')
        .update({ status })
        .eq('id', existing.id)
        .select()
        .single()

      result = { attendance, error }
    } else {
      // Create new attendance
      const { data: attendance, error } = await supabase
        .from('attendance')
        .insert({
          student_id,
          status,
          date: today
        })
        .select()
        .single()

      result = { attendance, error }
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ attendance: result.attendance }, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
