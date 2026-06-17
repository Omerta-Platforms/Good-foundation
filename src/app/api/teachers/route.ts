import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select(`
        *,
        subject:subjects(name)
      `)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ teachers })
  } catch (error) {
    console.error('Error fetching teachers:', error)
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
      staff_id,
      password,
      first_name,
      last_name,
      phone,
      subject_id
    } = body

    if (!email || !staff_id || !password || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const { data: teacher, error } = await supabase
      .from('teachers')
      .insert({
        email,
        staff_id,
        password: hashedPassword,
        first_name,
        last_name,
        phone,
        subject_id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ teacher }, { status: 201 })
  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
