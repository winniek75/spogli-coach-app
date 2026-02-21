import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateEvaluationRequest } from '@/types/student'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const studentId = searchParams.get('student_id')
    const lessonDate = searchParams.get('lesson_date')
    const sport = searchParams.get('sport')
    const coachId = searchParams.get('coach_id')

    let query = supabase
      .from('evaluations')
      .select(`
        *,
        student:students!evaluations_student_id_fkey (
          id,
          name,
          level
        ),
        coach:coaches!evaluations_coach_id_fkey (
          id,
          name
        )
      `)
      .order('lesson_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    if (lessonDate) {
      query = query.eq('lesson_date', lessonDate)
    }

    if (sport) {
      query = query.eq('sport', sport)
    }

    if (coachId) {
      query = query.eq('coach_id', coachId)
    }

    const { data: evaluations, error } = await query

    if (error) {
      console.error('Error fetching evaluations:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ evaluations })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body: CreateEvaluationRequest = await request.json()

    // バリデーション
    if (!body.student_id || !body.lesson_date || !body.coach_id ||
        !body.school || !body.sport || !body.category ||
        !body.skill_item_id || !body.rating) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    if (body.rating < 1 || body.rating > 3) {
      return NextResponse.json(
        { error: '評価は1〜3の範囲で入力してください' },
        { status: 400 }
      )
    }

    const { data: evaluation, error } = await supabase
      .from('evaluations')
      .insert({
        student_id: body.student_id,
        lesson_id: body.lesson_id,
        lesson_date: body.lesson_date,
        coach_id: body.coach_id,
        school: body.school,
        training_type: body.training_type,
        sport: body.sport,
        category: body.category,
        skill_item_id: body.skill_item_id,
        rating: body.rating,
        notes: body.notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating evaluation:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // バッジ獲得条件をチェック（⭐⭐⭐を3回取得）
    await checkBadgeEligibility(supabase, body.student_id, body.sport, body.category)

    return NextResponse.json({ evaluation }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// バッジ獲得条件チェック関数
async function checkBadgeEligibility(supabase: any, studentId: string, sport: string, category: string) {
  try {
    // 該当カテゴリで⭐⭐⭐(rating=3)の評価を取得
    const { data: highRatings, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('student_id', studentId)
      .eq('sport', sport)
      .eq('category', category)
      .eq('rating', 3)

    if (error) {
      console.error('Error checking badge eligibility:', error)
      return
    }

    // 3回以上⭐⭐⭐を取得している場合
    if (highRatings && highRatings.length >= 3) {
      // 既にバッジを獲得しているかチェック
      const { data: existingBadge } = await supabase
        .from('badges')
        .select('*')
        .eq('student_id', studentId)
        .eq('sport', sport)
        .eq('category', category)
        .single()

      // バッジが存在しない場合は新規作成
      if (!existingBadge) {
        // レベルに応じたバッジタイプを決定
        const { data: student } = await supabase
          .from('students')
          .select('level')
          .eq('id', studentId)
          .single()

        let badgeType = 'star'
        if (student?.level >= 5) badgeType = 'crown'
        else if (student?.level >= 3) badgeType = 'shield'

        await supabase
          .from('badges')
          .insert({
            student_id: studentId,
            sport: sport,
            category: category,
            badge_type: badgeType,
            earned_date: new Date().toISOString().split('T')[0],
          })
      }
    }
  } catch (error) {
    console.error('Error in badge eligibility check:', error)
  }
}