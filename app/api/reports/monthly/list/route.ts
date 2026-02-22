import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())
    const school = searchParams.get('school') || 'all'
    const search = searchParams.get('search') || ''

    // 生徒一覧を取得（フィルター条件付き）
    let studentsQuery = supabase
      .from('students')
      .select('id, name, school, level')
      .eq('status', 'active')

    if (school !== 'all') {
      studentsQuery = studentsQuery.eq('school', school)
    }

    if (search) {
      studentsQuery = studentsQuery.ilike('name', `%${search}%`)
    }

    const { data: students, error: studentsError } = await studentsQuery
      .order('school')
      .order('name')

    if (studentsError) {
      return NextResponse.json({ error: studentsError.message }, { status: 500 })
    }

    if (!students || students.length === 0) {
      return NextResponse.json({ reports: [] })
    }

    // 指定月のレポート一覧を取得
    const { data: reports, error: reportsError } = await supabase
      .from('monthly_reports')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .in('student_id', students.map(s => s.id))

    if (reportsError) {
      return NextResponse.json({ error: reportsError.message }, { status: 500 })
    }

    // レポートマップを作成
    const reportMap = new Map()
    reports?.forEach(report => {
      reportMap.set(report.student_id, report)
    })

    // 生徒ごとのレポート状況を作成
    const reportList = students.map(student => {
      const report = reportMap.get(student.id)

      return {
        id: report?.id,
        student_id: student.id,
        student_name: student.name,
        school: student.school,
        level: student.level,
        year,
        month,
        has_report: !!report,
        is_finalized: report?.is_finalized || false,
        generated_at: report?.generated_at,
        coach_note: report?.coach_note,
        growth_achievements: report?.growth_achievements || [],
        growth_challenges: report?.growth_challenges || []
      }
    })

    return NextResponse.json({
      reports: reportList,
      summary: {
        total: reportList.length,
        completed: reportList.filter(r => r.has_report).length,
        finalized: reportList.filter(r => r.is_finalized).length
      }
    })

  } catch (error) {
    console.error('Error fetching monthly reports list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports list' },
      { status: 500 }
    )
  }
}