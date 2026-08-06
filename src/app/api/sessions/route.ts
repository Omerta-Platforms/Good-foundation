import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdminAuthorized } from '@/lib/utils/require-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Reads are available to any logged-in area of the app, same as classes/subjects —
// session names aren't sensitive on their own and teachers need them for the
// results/positions filters.
export async function GET() {
  try {
    const { data: sessions, error } = await supabaseAdmin
      .from('academic_sessions')
      .select(`
        *,
        terms:terms(*)
      `)
      .order('start_date', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdminAuthorized()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, start_date, end_date, current } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Session name is required' },
        { status: 400 }
      )
    }

    // Only one session can be "current" at a time — if this new one is
    // being marked current, clear the flag on every existing session first.
    if (current) {
      const { error: clearError } = await supabaseAdmin
        .from('academic_sessions')
        .update({ current: false })
        .eq('current', true)

      if (clearError) {
        return NextResponse.json({ error: clearError.message }, { status: 500 })
      }
    }

    const { data: session, error } = await supabaseAdmin
      .from('academic_sessions')
      .insert({
        name,
        start_date: start_date || null,
        end_date: end_date || null,
        current: !!current,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Seed the standard three terms for the new session, same as the
    // schema's initial seed data, so it's immediately usable for
    // entering/publishing results.
    const { error: termsError } = await supabaseAdmin
      .from('terms')
      .insert([
        { name: 'First Term', session_id: session.id, current: !!current },
        { name: 'Second Term', session_id: session.id, current: false },
        { name: 'Third Term', session_id: session.id, current: false },
      ])

    if (termsError) {
      return NextResponse.json(
        { error: `Session created, but failed to create terms: ${termsError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
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
      return NextResponse.json({ error: 'Session id is required' }, { status: 400 })
    }

    // terms.session_id has ON DELETE CASCADE, so this also removes the
    // session's terms. It does NOT touch results, which key off the
    // session/term TEXT values directly rather than these ids.
    const { error } = await supabaseAdmin.from('academic_sessions').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

