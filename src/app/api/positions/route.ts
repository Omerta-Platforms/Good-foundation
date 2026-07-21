import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Computes each student's overall class position for a given
// class + session + term, ranked by their TOTAL score across every
// subject they have a result for in that term (not per-subject).
// Ties share the same position (standard competition ranking: e.g.
// two students tied for 1st are both "1st", the next student is "3rd").
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const session = searchParams.get('session')
    const term = searchParams.get('term')

    if (!classId || !session || !term) {
      return NextResponse.json(
        { error: 'classId, session, and term are required' },
        { status: 400 }
      )
    }

    // Get every student in this class.
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('students')
      .select('id, first_name, last_name, admission_number')
      .eq('class_id', classId)

    if (studentsError) {
      return NextResponse.json({ error: studentsError.message }, { status: 500 })
    }

    if (!students || students.length === 0) {
      return NextResponse.json({ positions: [] })
    }

    const studentIds = students.map(s => s.id)

    // Get every published result for these students in this session/term.
    const { data: results, error: resultsError } = await supabaseAdmin
      .from('results')
      .select('student_id, score')
      .in('student_id', studentIds)
      .eq('session', session)
      .eq('term', term)
      .eq('published', true)

    if (resultsError) {
      return NextResponse.json({ error: resultsError.message }, { status: 500 })
    }

    // Sum each student's total across all their subjects.
    const totalsByStudent = new Map<string, number>()
    for (const student of students) {
      totalsByStudent.set(student.id, 0)
    }
    for (const result of results || []) {
      totalsByStudent.set(
        result.student_id,
        (totalsByStudent.get(result.student_id) || 0) + (result.score || 0)
      )
    }

    // Only rank students who actually have at least one published
    // result this term — a student with zero results isn't "last
    // place", they just have nothing to rank yet.
    const ranked = students
      .map(s => ({
        student_id: s.id,
        first_name: s.first_name,
        last_name: s.last_name,
        admission_number: s.admission_number,
        total: totalsByStudent.get(s.id) || 0,
        subject_count: (results || []).filter(r => r.student_id === s.id).length,
      }))
      .filter(s => s.subject_count > 0)
      .sort((a, b) => b.total - a.total)

    // Standard competition ranking (1224): equal totals share a
    // position, and the next distinct total skips ahead accordingly.
    let position = 0
    let previousTotal: number | null = null
    const positions = ranked.map((s, index) => {
      if (s.total !== previousTotal) {
        position = index + 1
        previousTotal = s.total
      }
      return { ...s, position }
    })

    return NextResponse.json({ positions })
  } catch (error) {
    console.error('Error computing positions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
