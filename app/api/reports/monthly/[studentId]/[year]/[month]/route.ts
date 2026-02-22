import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MonthlyReport, MonthlyReportData, SPORT_EMOJIS, TRAINING_TYPE_CONFIG, BADGE_TYPE_ICONS } from '@/types/monthly-report'
import { LEVELS } from '@/types/student'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RouteParams {
  params: {
    studentId: string
    year: string
    month: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const studentId = params.studentId
    const year = parseInt(params.year)
    const month = parseInt(params.month)

    // 生徒情報を取得
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // 月の開始日・終了日を計算
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    // 出席データを取得
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .gte('lesson_date', startDate)
      .lte('lesson_date', endDate)

    // 評価データを取得
    const { data: evaluations } = await supabase
      .from('evaluations')
      .select(`
        *,
        skill_items (
          name_ja,
          category,
          sport
        )
      `)
      .eq('student_id', studentId)
      .gte('lesson_date', startDate)
      .lte('lesson_date', endDate)

    // バッジデータを取得
    const { data: badges } = await supabase
      .from('student_badges')
      .select('*')
      .eq('student_id', studentId)

    // 既存のレポートがあるかチェック
    const { data: existingReport } = await supabase
      .from('monthly_reports')
      .select('*')
      .eq('student_id', studentId)
      .eq('year', year)
      .eq('month', month)
      .single()

    // レポートデータを生成
    const reportData = await generateMonthlyReportData({
      student,
      attendance: attendance || [],
      evaluations: evaluations || [],
      badges: badges || [],
      year,
      month,
      existingReport
    })

    return NextResponse.json({ report: reportData })

  } catch (error) {
    console.error('Error generating monthly report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const studentId = params.studentId
    const year = parseInt(params.year)
    const month = parseInt(params.month)

    // レポートデータを保存/更新
    const { data: report, error } = await supabase
      .from('monthly_reports')
      .upsert({
        student_id: studentId,
        year,
        month,
        coach_note: body.coach_note || '',
        growth_achievements: body.growth_summary?.achievements || [],
        growth_challenges: body.growth_summary?.next_challenges || [],
        is_finalized: body.is_finalized || false,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ report })

  } catch (error) {
    console.error('Error saving monthly report:', error)
    return NextResponse.json(
      { error: 'Failed to save report' },
      { status: 500 }
    )
  }
}

async function generateMonthlyReportData(data: {
  student: any
  attendance: any[]
  evaluations: any[]
  badges: any[]
  year: number
  month: number
  existingReport?: any
}): Promise<MonthlyReport> {
  const { student, attendance, evaluations, badges, year, month, existingReport } = data

  // 年齢計算
  const birthDate = new Date(student.birth_date)
  const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))

  // 出席情報
  const attendanceCount = attendance.filter(a => a.status === 'present').length
  const totalLessons = attendance.length
  const attendanceRate = totalLessons > 0 ? Math.round((attendanceCount / totalLessons) * 100) : 0

  // レベル情報
  const currentLevelInfo = LEVELS[student.level as keyof typeof LEVELS]
  const enrollmentDate = new Date(student.enrollment_date)
  const monthsSinceEnrollment = Math.floor((Date.now() - enrollmentDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000))
  const nextLevelMonths = Math.max(1, 6 - (monthsSinceEnrollment % 6)) // 6ヶ月サイクル想定
  const nextCertificationDate = new Date()
  nextCertificationDate.setMonth(nextCertificationDate.getMonth() + nextLevelMonths)

  // スキル評価の集計
  let skillEvaluation = {
    sport: '',
    sport_emoji: '',
    evaluation_count: 0,
    skills: [] as any[],
    training_averages: { vision: 0, rhythm: 0, coordination: 0 }
  }

  if (evaluations.length > 0) {
    // 最も多いスポーツを取得
    const sportCounts = evaluations.reduce((acc, eval_) => {
      const sport = eval_.skill_items?.sport || eval_.sport
      acc[sport] = (acc[sport] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const mainSport = Object.keys(sportCounts).reduce((a, b) => sportCounts[a] > sportCounts[b] ? a : b)

    skillEvaluation.sport = mainSport
    skillEvaluation.sport_emoji = SPORT_EMOJIS[mainSport as keyof typeof SPORT_EMOJIS] || '🏃'
    skillEvaluation.evaluation_count = evaluations.length

    // スキル別評価
    const skillGroups = evaluations.reduce((acc, eval_) => {
      const skillName = eval_.skill_items?.name_ja || 'Unknown Skill'
      const key = `${eval_.training_type}-${skillName}`
      if (!acc[key]) {
        acc[key] = {
          category: eval_.training_type,
          skill_name: skillName,
          ratings: [],
          category_color: TRAINING_TYPE_CONFIG[eval_.training_type as keyof typeof TRAINING_TYPE_CONFIG]?.color || '#666'
        }
      }
      acc[key].ratings.push(eval_.rating)
      return acc
    }, {} as Record<string, any>)

    skillEvaluation.skills = Object.values(skillGroups).map((skill: any) => ({
      category: skill.category,
      skill_name: skill.skill_name,
      rating: Math.round(skill.ratings.reduce((sum: number, r: number) => sum + r, 0) / skill.ratings.length),
      category_color: skill.category_color
    }))

    // トレーニング平均
    const trainingGroups = evaluations.reduce((acc, eval_) => {
      if (!acc[eval_.training_type]) acc[eval_.training_type] = []
      acc[eval_.training_type].push(eval_.rating)
      return acc
    }, {} as Record<string, number[]>)

    skillEvaluation.training_averages = {
      vision: trainingGroups.vision ? Math.round(trainingGroups.vision.reduce((sum, r) => sum + r, 0) / trainingGroups.vision.length) : 0,
      rhythm: trainingGroups.rhythm ? Math.round(trainingGroups.rhythm.reduce((sum, r) => sum + r, 0) / trainingGroups.rhythm.length) : 0,
      coordination: trainingGroups.coordination ? Math.round(trainingGroups.coordination.reduce((sum, r) => sum + r, 0) / trainingGroups.coordination.length) : 0
    }
  }

  // バッジ情報の処理
  const earnedBadges = badges.filter(b => b.ceremony_completed).map(badge => ({
    sport: badge.sport,
    category: badge.category,
    badge_type: badge.badge_type,
    earned_date: badge.earned_date,
    icon: BADGE_TYPE_ICONS[badge.badge_type as keyof typeof BADGE_TYPE_ICONS]
  }))

  const inProgressBadges = badges.filter(b => !b.ceremony_completed).map(badge => ({
    sport: badge.sport,
    category: badge.category,
    badge_type: badge.badge_type,
    current_count: 2, // TODO: 実際の進捗を計算
    required_count: 3,
    progress_percentage: 66,
    icon: BADGE_TYPE_ICONS[badge.badge_type as keyof typeof BADGE_TYPE_ICONS]
  }))

  // レポート生成
  const report: MonthlyReport = {
    id: existingReport?.id || `report-${studentId}-${year}-${month}`,
    student_id: studentId,
    year,
    month,
    coach_note: existingReport?.coach_note || '',

    student_name: student.name,
    student_age: age,
    student_level: student.level,
    school: student.school,
    enrollment_date: student.enrollment_date,
    photo_url: student.photo_url,

    attendance_count: attendanceCount,
    total_lessons: totalLessons,
    attendance_rate: attendanceRate,

    current_level: {
      level: student.level,
      title: currentLevelInfo?.title || 'Unknown',
      description: currentLevelInfo?.description || '',
      badge_type: currentLevelInfo?.badge || 'star',
      next_level_months: nextLevelMonths,
      next_certification_date: nextCertificationDate.toISOString().split('T')[0]
    },

    skill_evaluation: skillEvaluation,

    badges: {
      earned: earnedBadges,
      in_progress: inProgressBadges
    },

    growth_summary: {
      achievements: existingReport?.growth_achievements || [],
      next_challenges: existingReport?.growth_challenges || []
    },

    generated_at: new Date().toISOString(),
    generated_by: 'system',
    is_finalized: existingReport?.is_finalized || false
  }

  return report
}