import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import bcrypt from 'bcryptjs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const classId = searchParams.get('classId')
    const admissionNumber = searchParams.get('admissionNumber')

    let queryBuilder = supabase.from('students').select(`
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      first_name,
      last_name,
      admission_number,
      class_id,
      date_of_birth,
      parent_phone,
      parent_email,
      address
    } = body

    // Validate required fields
    if (!email || !password || !first_name || !last_name || !admission_number || !class_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert student
    const { data: student, error } = await supabase
      .from('students')
      .insert({
        email,
        password: hashedPassword,
        first_name,
        last_name,
        admission_number,
        class_id,
        date_of_birth,
        parent_phone,
        parent_email,
        address
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ student }, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
