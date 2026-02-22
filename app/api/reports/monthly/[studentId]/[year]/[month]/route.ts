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

  // レベル情報と認定スケジュール
  const currentLevelInfo = LEVELS[student.level as keyof typeof LEVELS]
  const enrollmentDate = new Date(student.enrollment_date)
  const currentDate = new Date()

  // 入会からの経過月数を正確に計算
  const monthsSinceEnrollment = Math.floor(
    (currentDate.getTime() - enrollmentDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)
  )

  // 次のレベルアップまでの月数を計算（6ヶ月サイクル）
  const levelsCompleted = Math.floor(monthsSinceEnrollment / 6)
  const expectedLevel = Math.min(levelsCompleted + 1, 6) // レベル1〜6
  const monthsInCurrentLevel = monthsSinceEnrollment % 6
  const nextLevelMonths = 6 - monthsInCurrentLevel

  // 次回認定予定日を計算
  const nextCertificationDate = new Date(enrollmentDate)
  nextCertificationDate.setMonth(nextCertificationDate.getMonth() + (levelsCompleted + 1) * 6)

  // レベル進行の判定
  const isLevelProgressOnTrack = student.level >= expectedLevel

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
      vision: trainingGroups.vision ? Math.round(trainingGroups.vision.reduce((sum: number, r: number) => sum + r, 0) / trainingGroups.vision.length) : 0,
      rhythm: trainingGroups.rhythm ? Math.round(trainingGroups.rhythm.reduce((sum: number, r: number) => sum + r, 0) / trainingGroups.rhythm.length) : 0,
      coordination: trainingGroups.coordination ? Math.round(trainingGroups.coordination.reduce((sum: number, r: number) => sum + r, 0) / trainingGroups.coordination.length) : 0
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

  // 進行中バッジの実際の進捗計算
  const badgeProgressMap = new Map()

  // evaluationsから各スポーツ・カテゴリーの★★★の数を計算
  evaluations.forEach(eval_ => {
    if (eval_.rating === 3) { // ★★★のみカウント
      const key = `${eval_.sport}-${eval_.skill_items?.category || eval_.category || 'general'}`
      badgeProgressMap.set(key, (badgeProgressMap.get(key) || 0) + 1)
    }
  })

  const inProgressBadges = badges.filter(b => !b.ceremony_completed).map(badge => {
    const key = `${badge.sport}-${badge.category}`
    const currentCount = badgeProgressMap.get(key) || 0
    const requiredCount = 3 // バッジ獲得には★★★を3回
    const progressPercentage = Math.min(Math.round((currentCount / requiredCount) * 100), 100)

    return {
      sport: badge.sport,
      category: badge.category,
      badge_type: badge.badge_type,
      current_count: currentCount,
      required_count: requiredCount,
      progress_percentage: progressPercentage,
      icon: BADGE_TYPE_ICONS[badge.badge_type as keyof typeof BADGE_TYPE_ICONS]
    }
  })

  // 将来のバッジ候補を生成（evaluationsから推測）
  const potentialBadges: Array<{
    sport: string
    category: string
    badge_type: 'star' | 'shield' | 'crown'
    current_count: number
    required_count: number
    progress_percentage: number
    icon: string
    is_potential?: boolean
  }> = []
  const existingBadgeKeys = new Set(badges.map(b => `${b.sport}-${b.category}`))

  // evaluationsから新しいバッジ候補を発見
  const sportCategoryMap = new Map()
  evaluations.forEach(eval_ => {
    const sport = eval_.sport
    const category = eval_.skill_items?.category || eval_.category || 'general'
    const key = `${sport}-${category}`

    if (!existingBadgeKeys.has(key)) {
      if (!sportCategoryMap.has(key)) {
        sportCategoryMap.set(key, {
          sport,
          category,
          evaluationCount: 0,
          starCount: 0
        })
      }
      const info = sportCategoryMap.get(key)
      info.evaluationCount++
      if (eval_.rating === 3) info.starCount++
    }
  })

  // 複数回評価があるスポーツ・カテゴリーを候補として追加
  sportCategoryMap.forEach((info, key) => {
    if (info.evaluationCount >= 2) { // 最低2回評価があれば候補とする
      potentialBadges.push({
        sport: info.sport,
        category: info.category,
        badge_type: 'star' as const, // 新規バッジはstarから開始
        current_count: info.starCount,
        required_count: 3,
        progress_percentage: Math.min(Math.round((info.starCount / 3) * 100), 100),
        icon: BADGE_TYPE_ICONS.star,
        is_potential: true // 候補であることを示すフラグ
      })
    }
  })

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
      next_certification_date: nextCertificationDate.toISOString().split('T')[0],
      is_on_track: isLevelProgressOnTrack,
      expected_level: expectedLevel,
      months_since_enrollment: monthsSinceEnrollment
    },

    skill_evaluation: skillEvaluation,

    badges: {
      earned: earnedBadges,
      in_progress: inProgressBadges,
      potential: potentialBadges
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