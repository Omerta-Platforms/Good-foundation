import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const status = searchParams.get('status')

    let queryBuilder = supabase
      .from('payments')
      .select(`
        *,
        student:students(first_name, last_name, admission_number)
      `)

    if (studentId) {
      queryBuilder = queryBuilder.eq('student_id', studentId)
    }

    if (status) {
      queryBuilder = queryBuilder.eq('status', status)
    }

    const { data: payments, error } = await queryBuilder

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { student_id, amount, description, status, date } = body

    if (!student_id || !amount) {
      return NextResponse.json(
        { error: 'Student ID and amount are required' },
        { status: 400 }
      )
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        student_id,
        amount,
        description,
        status: status || 'pending',
        date: date || new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      )
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ payment })
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
