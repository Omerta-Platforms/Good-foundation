import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const session = searchParams.get('session')
    const term = searchParams.get('term')
    const classId = searchParams.get('classId')

    let queryBuilder = supabase
      .from('results')
      .select(`
        *,
        student:students(
          first_name,
          last_name,
          admission_number,
          class:classes(name)
        ),
        subject:subjects(name)
      `)

    if (studentId) {
      queryBuilder = queryBuilder.eq('student_id', studentId)
    }

    if (session) {
      queryBuilder = queryBuilder.eq('session', session)
    }

    if (term) {
      queryBuilder = queryBuilder.eq('term', term)
    }

    if (classId) {
      queryBuilder = queryBuilder.eq('student.class_id', classId)
    }

    const { data: results, error } = await queryBuilder

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { results } = body

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'Results array is required' },
        { status: 400 }
      )
    }

    // Insert results
    const { data: insertedResults, error } = await supabase
      .from('results')
      .insert(results)
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ results: insertedResults }, { status: 201 })
  } catch (error) {
    console.error('Error creating results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, score, grade, remark, published } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Result ID is required' },
        { status: 400 }
      )
    }

    // Update result
    const { data: result, error } = await supabase
      .from('results')
      .update({
        score,
        grade,
        remark,
        published
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Error updating result:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Result ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('results')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting result:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
