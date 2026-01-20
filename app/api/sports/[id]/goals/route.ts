import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateSportGoalRequest } from '@/types/sport'
export const dynamic = 'force-dynamic'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const student_id = searchParams.get('student_id')
    const coach_id = searchParams.get('coach_id')
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    let query = supabase
      .from('sport_goals')
      .select(`
        *,
        sport:sports!sport_goals_sport_id_fkey(id, name, icon),
        student:students!sport_goals_student_id_fkey(id, name),
        coach:coaches!sport_goals_coach_id_fkey(id, name),
        milestones:goal_milestones!goal_milestones_goal_id_fkey(*)
      `)
      .eq('sport_id', params.id)
      .order('created_at', { ascending: false })

    if (student_id) {
      query = query.eq('student_id', student_id)
    }

    if (coach_id) {
      query = query.eq('coach_id', coach_id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: goals, error } = await query

    if (error) {
      console.error('Error fetching sport goals:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ goals: goals || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const body: CreateSportGoalRequest = await request.json()

    // 現在のユーザーを取得
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // コーチ情報を取得
    const { data: coach } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!coach) {
      return NextResponse.json({ error: 'コーチ情報が見つかりません' }, { status: 403 })
    }

    // 目標を作成
    const { data: goal, error: goalError } = await supabase
      .from('sport_goals')
      .insert({
        sport_id: params.id,
        student_id: body.student_id,
        coach_id: coach.id,
        title: body.title,
        description: body.description,
        category: body.category,
        status: 'not_started',
        target_date: body.target_date,
        start_date: new Date().toISOString(),
        target_metrics: body.target_metrics,
        is_public: body.is_public ?? false,
      })
      .select()
      .single()

    if (goalError) {
      console.error('Error creating goal:', goalError)
      return NextResponse.json({ error: goalError.message }, { status: 500 })
    }

    // マイルストーンを作成
    if (body.milestones && body.milestones.length > 0) {
      const milestones = body.milestones.map(milestone => ({
        goal_id: goal.id,
        title: milestone.title,
        description: milestone.description,
        target_date: milestone.target_date,
        status: 'pending',
      }))

      const { error: milestoneError } = await supabase
        .from('goal_milestones')
        .insert(milestones)

      if (milestoneError) {
        console.error('Error creating milestones:', milestoneError)
        // マイルストーン作成に失敗した場合、目標も削除
        await supabase.from('sport_goals').delete().eq('id', goal.id)
        return NextResponse.json({ error: 'マイルストーンの作成に失敗しました' }, { status: 500 })
      }
    }

    // 完全な目標データを取得
    const { data: completeGoal } = await supabase
      .from('sport_goals')
      .select(`
        *,
        sport:sports!sport_goals_sport_id_fkey(id, name, icon),
        student:students!sport_goals_student_id_fkey(id, name),
        coach:coaches!sport_goals_coach_id_fkey(id, name),
        milestones:goal_milestones!goal_milestones_goal_id_fkey(*)
      `)
      .eq('id', goal.id)
      .single()

    return NextResponse.json({ goal: completeGoal }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}