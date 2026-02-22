'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Calendar,
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Printer,
  Download,
  RefreshCw,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react'
import { MonthlyReport } from '@/types/monthly-report'

interface Student {
  id: string
  name: string
  school: 'ageo' | 'okegawa'
  level: number
}

interface ReportListItem {
  id?: string
  student_id: string
  student_name: string
  school: 'ageo' | 'okegawa'
  year: number
  month: number
  is_finalized: boolean
  has_report: boolean
  generated_at?: string
  coach_note?: string
}

export default function MonthlyReportsPage() {
  const params = useParams()
  const [students, setStudents] = useState<Student[]>([])
  const [reports, setReports] = useState<ReportListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedSchool, setSelectedSchool] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ReportListItem | null>(null)
  const [reportData, setReportData] = useState<MonthlyReport | null>(null)
  const [editNote, setEditNote] = useState('')
  const [editAchievements, setEditAchievements] = useState('')
  const [editChallenges, setEditChallenges] = useState('')
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  // データ取得
  const fetchReportsData = async () => {
    setLoading(true)
    try {
      // 生徒一覧を取得
      const studentsResponse = await fetch('/api/students')
      const studentsData = await studentsResponse.json()

      // 指定月のレポート対象生徒を取得
      const reportsResponse = await fetch(
        `/api/reports/monthly/list?year=${selectedYear}&month=${selectedMonth}&school=${selectedSchool}&search=${searchTerm}`
      )
      const reportsData = await reportsResponse.json()

      setStudents(studentsData.students || [])
      setReports(reportsData.reports || [])
    } catch (error) {
      console.error('Failed to fetch reports data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportsData()
  }, [selectedYear, selectedMonth, selectedSchool, searchTerm])

  // レポート生成
  const generateReport = async (studentId: string) => {
    setIsGenerating(studentId)
    try {
      const response = await fetch(`/api/reports/monthly/${studentId}/${selectedYear}/${selectedMonth}`)
      if (response.ok) {
        await fetchReportsData() // リフレッシュ
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setIsGenerating(null)
    }
  }

  // レポート編集ダイアログを開く
  const openEditDialog = async (report: ReportListItem) => {
    setSelectedReport(report)

    if (report.has_report) {
      // 既存レポートのデータを取得
      try {
        const response = await fetch(`/api/reports/monthly/${report.student_id}/${report.year}/${report.month}`)
        if (response.ok) {
          const data = await response.json()
          setReportData(data.report)
          setEditNote(data.report.coach_note || '')
          setEditAchievements((data.report.growth_summary.achievements || []).join('\n'))
          setEditChallenges((data.report.growth_summary.next_challenges || []).join('\n'))
        }
      } catch (error) {
        console.error('Failed to fetch report data:', error)
      }
    } else {
      // 新規レポート用の初期化
      setReportData(null)
      setEditNote('')
      setEditAchievements('')
      setEditChallenges('')
    }

    setShowEditDialog(true)
  }

  // レポート保存
  const saveReport = async () => {
    if (!selectedReport) return

    try {
      const response = await fetch(
        `/api/reports/monthly/${selectedReport.student_id}/${selectedReport.year}/${selectedReport.month}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coach_note: editNote,
            growth_summary: {
              achievements: editAchievements.split('\n').filter(line => line.trim()),
              next_challenges: editChallenges.split('\n').filter(line => line.trim())
            },
            is_finalized: false
          })
        }
      )

      if (response.ok) {
        setShowEditDialog(false)
        await fetchReportsData()
      }
    } catch (error) {
      console.error('Failed to save report:', error)
    }
  }

  // レポート印刷
  const printReport = async (studentId: string) => {
    window.open(`/reports/monthly/${studentId}/${selectedYear}/${selectedMonth}/print`, '_blank')
  }

  // フィルター処理されたレポート
  const filteredReports = reports.filter(report => {
    if (selectedSchool !== 'all' && report.school !== selectedSchool) {
      return false
    }
    if (searchTerm && !report.student_name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    return true
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">月次成長レポート</h1>
          <p className="text-muted-foreground">スポぐり通信の管理</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReportsData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            更新
          </Button>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="生徒名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i).map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <SelectItem key={month} value={month.toString()}>{month}月</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSchool} onValueChange={setSelectedSchool}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全校</SelectItem>
              <SelectItem value="ageo">上尾校</SelectItem>
              <SelectItem value="okegawa">桶川校</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* レポート一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {selectedYear}年{selectedMonth}月のレポート
          </CardTitle>
          <CardDescription>
            全{filteredReports.length}件 （作成済み: {filteredReports.filter(r => r.has_report).length}件）
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">対象の生徒が見つかりません</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>生徒名</TableHead>
                  <TableHead>校舎</TableHead>
                  <TableHead>レベル</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>更新日</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={`${report.student_id}-${report.year}-${report.month}`}>
                    <TableCell className="font-medium">{report.student_name}</TableCell>
                    <TableCell>{report.school === 'ageo' ? '上尾校' : '桶川校'}</TableCell>
                    <TableCell>Level {students.find(s => s.id === report.student_id)?.level || '?'}</TableCell>
                    <TableCell>
                      {report.has_report ? (
                        <Badge variant={report.is_finalized ? 'default' : 'secondary'} className="flex items-center gap-1">
                          {report.is_finalized ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {report.is_finalized ? '確定済み' : '作成済み'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Circle className="h-3 w-3" />
                          未作成
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {report.generated_at ? formatDate(report.generated_at) : '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {report.has_report ? (
                            <>
                              <DropdownMenuItem onClick={() => printReport(report.student_id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                プレビュー
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(report)}>
                                <Edit className="mr-2 h-4 w-4" />
                                編集
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => printReport(report.student_id)}>
                                <Printer className="mr-2 h-4 w-4" />
                                印刷
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => generateReport(report.student_id)}
                              disabled={isGenerating === report.student_id}
                            >
                              {isGenerating === report.student_id ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className="mr-2 h-4 w-4" />
                              )}
                              生成
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 編集ダイアログ */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>レポート編集</DialogTitle>
            <DialogDescription>
              {selectedReport?.student_name}さんの{selectedReport?.year}年{selectedReport?.month}月のレポート
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* コーチのコメント */}
            <div>
              <label className="text-sm font-medium mb-2 block">Coach's Message</label>
              <Textarea
                placeholder="コーチからのメッセージを入力してください..."
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                rows={4}
              />
            </div>

            {/* できるようになったこと */}
            <div>
              <label className="text-sm font-medium mb-2 block">✅ できるようになったこと</label>
              <Textarea
                placeholder="各項目を改行で区切って入力してください"
                value={editAchievements}
                onChange={(e) => setEditAchievements(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                例: ドリブルが上達しました / シュートの成功率が上がりました
              </p>
            </div>

            {/* 来月チャレンジすること */}
            <div>
              <label className="text-sm font-medium mb-2 block">🎯 来月チャレンジすること</label>
              <Textarea
                placeholder="各項目を改行で区切って入力してください"
                value={editChallenges}
                onChange={(e) => setEditChallenges(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                例: パスの精度を向上させる / チームワークを意識する
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={saveReport}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}