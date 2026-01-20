import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // デモモード: Supabaseが設定されていない場合はデモ統計データを返す
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

    if (isDemo) {
      // デモ統計データ
      const demoStats = {
        overview: {
          totalStudents: 48,
          activeStudents: 42,
          totalCoaches: 4,
          totalEvaluations: 156,
          totalBadges: 89,
        },
        students: {
          byStatus: {
            active: 42,
            inactive: 4,
            withdrawn: 2,
          },
          byLevel: [
            { level: 1, count: 8 },
            { level: 2, count: 12 },
            { level: 3, count: 14 },
            { level: 4, count: 8 },
            { level: 5, count: 4 },
            { level: 6, count: 2 }
          ],
          byClassType: {
            preschool: 18,
            elementary: 30,
          },
          bySchool: {
            ageo: 28,
            okegawa: 20,
          },
          newEnrollments: 5,
        },
        evaluations: {
          total: 156,
          byRating: {
            rating1: 42,
            rating2: 89,
            rating3: 25,
          },
          averageRating: "2.2",
          bySport: {
            basketball: 68,
            soccer: 52,
            volleyball: 36,
          },
          byCategory: {
            technical: 78,
            tactical: 45,
            physical: 33,
          },
          recentTrend: [
            { week: "1/14", count: 12 },
            { week: "1/21", count: 15 },
            { week: "1/28", count: 18 },
            { week: "2/4", count: 14 }
          ],
        },
        badges: {
          total: 89,
          byType: {
            star: 45,
            shield: 32,
            crown: 12,
          },
          bySport: {
            basketball: 38,
            soccer: 34,
            volleyball: 17,
          },
          awarded: 78,
          pending: 11,
          uniqueRecipients: 34,
        },
        attendance: {
          total: 312,
          present: 285,
          absent: 18,
          late: 9,
          rate: 91,
          weeklyTrend: [
            { week: "1/14", rate: 88 },
            { week: "1/21", rate: 92 },
            { week: "1/28", rate: 94 },
            { week: "2/4", rate: 89 }
          ],
        },
        missions: {
          total: 67,
          completed: 45,
          inProgress: 18,
          draft: 4,
          averageCompletion: 78,
        },
        alerts: [
          {
            type: 'warning',
            title: '資格更新が必要',
            message: '1名のコーチの資格が30日以内に期限切れになります',
            count: 1
          },
          {
            type: 'info',
            title: 'バッジ授与待ち',
            message: '11個のバッジが授与待ちです',
            count: 11
          },
          {
            type: 'success',
            title: '新入会者',
            message: '今週5名の新しい生徒が入会しました',
            count: 5
          }
        ],
      }

      return NextResponse.json({ stats: demoStats })
    }

    // 本番モード: Supabaseからデータを取得
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const school = searchParams.get('school')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // 並行してデータを取得
    const [
      studentsResult,
      coachesResult,
      evaluationsResult,
      badgesResult,
      attendanceResult,
      missionsResult
    ] = await Promise.all([
      // 生徒統計
      supabase
        .from('students')
        .select('id, status, level, school, class_type, enrollment_date')
        .then(result => result.error ? { data: [], error: result.error } : result),

      // コーチ統計
      supabase
        .from('coaches')
        .select('id, status, certifications!inner(id, name, expiry_date)')
        .then(result => result.error ? { data: [], error: result.error } : result),

      // 評価統計
      supabase
        .from('evaluations')
        .select('id, rating, lesson_date, sport, category, student_id')
        .gte('lesson_date', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .lte('lesson_date', endDate || new Date().toISOString().split('T')[0])
        .then(result => result.error ? { data: [], error: result.error } : result),

      // バッジ統計
      supabase
        .from('badges')
        .select('id, badge_type, sport, category, earned_date, awarded_date, student_id')
        .then(result => result.error ? { data: [], error: result.error } : result),

      // 出席統計
      supabase
        .from('attendance')
        .select('id, status, lesson_date, student_id')
        .gte('lesson_date', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .lte('lesson_date', endDate || new Date().toISOString().split('T')[0])
        .then(result => result.error ? { data: [], error: result.error } : result),

      // ミッション統計
      supabase
        .from('mission_sheets')
        .select(`
          id, status, lesson_date, sport, student_id,
          mission_items!inner(id, completed_at)
        `)
        .gte('lesson_date', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .lte('lesson_date', endDate || new Date().toISOString().split('T')[0])
        .then(result => result.error ? { data: [], error: result.error } : result),
    ])

    // エラーハンドリング
    if (studentsResult.error || coachesResult.error || evaluationsResult.error ||
        badgesResult.error || attendanceResult.error || missionsResult.error) {
      console.error('Error fetching dashboard stats:', {
        students: studentsResult.error,
        coaches: coachesResult.error,
        evaluations: evaluationsResult.error,
        badges: badgesResult.error,
        attendance: attendanceResult.error,
        missions: missionsResult.error
      })
      return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 })
    }

    const students = studentsResult.data || []
    const coaches = coachesResult.data || []
    const evaluations = evaluationsResult.data || []
    const badges = badgesResult.data || []
    const attendance = attendanceResult.data || []
    const missions = missionsResult.data || []

    // 校舎フィルタリング
    const filteredStudents = school ? students.filter(s => s.school === school) : students

    // 統計計算
    const stats = {
      // 基本統計
      overview: {
        totalStudents: filteredStudents.length,
        activeStudents: filteredStudents.filter(s => s.status === 'active').length,
        totalCoaches: coaches.filter(c => c.status === 'active').length,
        totalEvaluations: evaluations.length,
        totalBadges: badges.length,
      },

      // 生徒統計
      students: {
        byStatus: {
          active: filteredStudents.filter(s => s.status === 'active').length,
          inactive: filteredStudents.filter(s => s.status === 'inactive').length,
          withdrawn: filteredStudents.filter(s => s.status === 'withdrawn').length,
        },
        byLevel: Array.from({length: 6}, (_, i) => ({
          level: i + 1,
          count: filteredStudents.filter(s => s.level === i + 1).length
        })),
        byClassType: {
          preschool: filteredStudents.filter(s => s.class_type === 'preschool').length,
          elementary: filteredStudents.filter(s => s.class_type === 'elementary').length,
        },
        bySchool: {
          ageo: students.filter(s => s.school === 'ageo').length,
          okegawa: students.filter(s => s.school === 'okegawa').length,
        },
        newEnrollments: filteredStudents.filter(s => {
          const enrollmentDate = new Date(s.enrollment_date)
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          return enrollmentDate >= thirtyDaysAgo
        }).length,
      },

      // 評価統計
      evaluations: {
        total: evaluations.length,
        byRating: {
          rating1: evaluations.filter(e => e.rating === 1).length,
          rating2: evaluations.filter(e => e.rating === 2).length,
          rating3: evaluations.filter(e => e.rating === 3).length,
        },
        averageRating: evaluations.length > 0 ?
          (evaluations.reduce((sum, e) => sum + e.rating, 0) / evaluations.length).toFixed(2) : 0,
        bySport: evaluations.reduce((acc: any, e) => {
          acc[e.sport] = (acc[e.sport] || 0) + 1
          return acc
        }, {}),
        byCategory: evaluations.reduce((acc: any, e) => {
          acc[e.category] = (acc[e.category] || 0) + 1
          return acc
        }, {}),
        recentTrend: calculateWeeklyTrend(evaluations),
      },

      // バッジ統計
      badges: {
        total: badges.length,
        byType: {
          star: badges.filter(b => b.badge_type === 'star').length,
          shield: badges.filter(b => b.badge_type === 'shield').length,
          crown: badges.filter(b => b.badge_type === 'crown').length,
        },
        bySport: badges.reduce((acc: any, b) => {
          acc[b.sport] = (acc[b.sport] || 0) + 1
          return acc
        }, {}),
        awarded: badges.filter(b => b.awarded_date).length,
        pending: badges.filter(b => !b.awarded_date).length,
        uniqueRecipients: new Set(badges.map(b => b.student_id)).size,
      },

      // 出席統計
      attendance: {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        rate: attendance.length > 0 ?
          Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0,
        weeklyTrend: calculateAttendanceWeeklyTrend(attendance),
      },

      // ミッション統計
      missions: {
        total: missions.length,
        completed: missions.filter(m => m.status === 'completed').length,
        inProgress: missions.filter(m => m.status === 'in_progress').length,
        draft: missions.filter(m => m.status === 'draft').length,
        averageCompletion: missions.length > 0 ?
          Math.round(missions.reduce((sum, m) => {
            const totalItems = m.mission_items?.length || 0
            const completedItems = m.mission_items?.filter((item: any) => item.completed_at).length || 0
            return sum + (totalItems > 0 ? (completedItems / totalItems) * 100 : 0)
          }, 0) / missions.length) : 0,
      },

      // アラート
      alerts: generateAlerts(coaches, badges, students),
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 週次トレンド計算
function calculateWeeklyTrend(evaluations: any[]) {
  const weeks = Array.from({length: 4}, (_, i) => {
    const weekStart = new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
    const weekEnd = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000)

    return {
      week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
      count: evaluations.filter(e => {
        const evalDate = new Date(e.lesson_date)
        return evalDate >= weekStart && evalDate <= weekEnd
      }).length
    }
  }).reverse()

  return weeks
}

function calculateAttendanceWeeklyTrend(attendance: any[]) {
  const weeks = Array.from({length: 4}, (_, i) => {
    const weekStart = new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
    const weekEnd = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000)

    const weekAttendance = attendance.filter(a => {
      const attendanceDate = new Date(a.lesson_date)
      return attendanceDate >= weekStart && attendanceDate <= weekEnd
    })

    return {
      week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
      rate: weekAttendance.length > 0 ?
        Math.round((weekAttendance.filter(a => a.status === 'present').length / weekAttendance.length) * 100) : 0
    }
  }).reverse()

  return weeks
}

// アラート生成
function generateAlerts(coaches: any[], badges: any[], students: any[]) {
  const alerts = []

  // 資格有効期限アラート
  const expiringSoon = coaches.filter(coach => {
    return coach.certifications?.some((cert: any) => {
      if (!cert.expiry_date) return false
      const expiryDate = new Date(cert.expiry_date)
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      return expiryDate <= thirtyDaysLater
    })
  })

  if (expiringSoon.length > 0) {
    alerts.push({
      type: 'warning',
      title: '資格更新が必要',
      message: `${expiringSoon.length}名のコーチの資格が30日以内に期限切れになります`,
      count: expiringSoon.length
    })
  }

  // 授与待ちバッジ
  const pendingBadges = badges.filter(b => !b.awarded_date).length
  if (pendingBadges > 0) {
    alerts.push({
      type: 'info',
      title: 'バッジ授与待ち',
      message: `${pendingBadges}個のバッジが授与待ちです`,
      count: pendingBadges
    })
  }

  // 新入会者
  const newStudents = students.filter(s => {
    const enrollmentDate = new Date(s.enrollment_date)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return enrollmentDate >= sevenDaysAgo
  }).length

  if (newStudents > 0) {
    alerts.push({
      type: 'success',
      title: '新入会者',
      message: `今週${newStudents}名の新しい生徒が入会しました`,
      count: newStudents
    })
  }

  return alerts
}