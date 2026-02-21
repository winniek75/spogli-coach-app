'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStudents } from '@/hooks/use-students'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  AlertTriangle,
  Users,
  Baby,
  GraduationCap,
  Star,
  Award,
  Calendar,
  MapPin,
} from 'lucide-react'
import { StudentWithDetails, LEVELS } from '@/types/student'

export default function StudentsPage() {
  const { students, loading, error, fetchStudents } = useStudents()
  const [searchTerm, setSearchTerm] = useState('')
  const [schoolFilter, setSchoolFilter] = useState<string>('')
  const [classFilter, setClassFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.name_kana?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parent_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSchool = !schoolFilter || schoolFilter === 'all' || student.school === schoolFilter
    const matchesClass = !classFilter || classFilter === 'all' || student.class_type === classFilter
    const matchesStatus = !statusFilter || statusFilter === 'all' || student.status === statusFilter

    return matchesSearch && matchesSchool && matchesClass && matchesStatus
  })

  const handleFilterChange = (type: string, value: string) => {
    const filters = {
      school: schoolFilter,
      class_type: classFilter,
      status: statusFilter,
    }

    // "all"の場合は空文字列に変換してAPIに送信
    if (type === 'school') filters.school = value === 'all' ? '' : value
    else if (type === 'class_type') filters.class_type = value === 'all' ? '' : value
    else if (type === 'status') filters.status = value === 'all' ? '' : value

    // APIを再呼び出し
    fetchStudents(filters)

    // ローカル状態更新
    if (type === 'school') setSchoolFilter(value)
    else if (type === 'class_type') setClassFilter(value)
    else if (type === 'status') setStatusFilter(value)
  }

  const getLevelBadge = (level: number) => {
    const levelData = LEVELS[level as keyof typeof LEVELS]
    if (!levelData) return <Badge variant="secondary">不明</Badge>

    const badgeColors = {
      star: 'bg-yellow-100 text-yellow-800',
      shield: 'bg-blue-100 text-blue-800',
      crown: 'bg-purple-100 text-purple-800',
    }

    return (
      <Badge className={badgeColors[levelData.badge as keyof typeof badgeColors]}>
        Lv{level}: {levelData.title}
      </Badge>
    )
  }

  const getSchoolBadge = (school: string) => {
    return (
      <Badge variant="outline" className="text-xs">
        {school === 'ageo' ? '上尾校' : '桶川校'}
      </Badge>
    )
  }

  const getClassTypeBadge = (classType: string) => {
    return (
      <Badge variant="secondary" className="text-xs">
        {classType === 'preschool' ? '未就学児' : '小学生'}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: '在籍中', color: 'bg-green-600' },
      inactive: { label: '休会', color: 'bg-gray-600' },
      withdrawn: { label: '退会', color: 'bg-red-600' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">生徒データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>再試行</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">生徒管理</h1>
          <p className="text-muted-foreground mt-2">
            生徒の情報・評価・進捗管理
          </p>
        </div>
        <Link href="/students/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新規生徒登録
          </Button>
        </Link>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="生徒名、ふりがな、保護者名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={schoolFilter} onValueChange={(value) => handleFilterChange('school', value)}>
              <SelectTrigger>
                <SelectValue placeholder="校舎で絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全校舎</SelectItem>
                <SelectItem value="ageo">上尾校</SelectItem>
                <SelectItem value="okegawa">桶川校</SelectItem>
              </SelectContent>
            </Select>

            <Select value={classFilter} onValueChange={(value) => handleFilterChange('class_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="クラスで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全クラス</SelectItem>
                <SelectItem value="preschool">未就学児</SelectItem>
                <SelectItem value="elementary">小学生</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="ステータスで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ステータス</SelectItem>
                <SelectItem value="active">在籍中</SelectItem>
                <SelectItem value="inactive">休会</SelectItem>
                <SelectItem value="withdrawn">退会</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredStudents.length}名の生徒
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Baby className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                未就学児: {filteredStudents.filter(s => s.class_type === 'preschool').length}名
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                小学生: {filteredStudents.filter(s => s.class_type === 'elementary').length}名
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 生徒一覧 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.photo_url} alt={student.name} />
                    <AvatarFallback>
                      {student.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    {student.name_kana && (
                      <p className="text-sm text-muted-foreground">
                        {student.name_kana}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {student.age}歳
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/students/${student.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        詳細表示
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/students/${student.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        編集
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/students/${student.id}/evaluate`}>
                        <Star className="h-4 w-4 mr-2" />
                        評価入力
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* レベルと基本情報 */}
              <div className="space-y-2">
                {getLevelBadge(student.level)}
                <div className="flex gap-2">
                  {getSchoolBadge(student.school)}
                  {getClassTypeBadge(student.class_type)}
                  {getStatusBadge(student.status)}
                </div>
              </div>

              {/* 保護者情報 */}
              <div className="space-y-1 text-sm">
                <p className="font-medium text-muted-foreground">保護者</p>
                <p>{student.parent_name}</p>
                {student.parent_email && (
                  <p className="text-xs text-muted-foreground">{student.parent_email}</p>
                )}
              </div>

              {/* 統計情報 */}
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Award className="h-3 w-3 text-yellow-600" />
                    <span className="font-medium">{student.badges?.length || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">バッジ</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-3 w-3 text-blue-600" />
                    <span className="font-medium">{student.latest_evaluations?.length || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">評価</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Calendar className="h-3 w-3 text-green-600" />
                    <span className="font-medium">{student.attendance_rate}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">出席率</p>
                </div>
              </div>

              {/* 入会日 */}
              <div className="text-xs text-muted-foreground">
                入会日: {new Date(student.enrollment_date).toLocaleDateString('ja-JP')}
              </div>

              {/* 医療メモ・緊急連絡先がある場合の警告 */}
              {(student.medical_notes || student.emergency_contact) && (
                <div className="flex items-center gap-1 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                  <span className="text-xs text-amber-800">要確認事項あり</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            生徒が見つかりません
          </p>
          <p className="text-muted-foreground mb-4">
            検索条件を変更するか、新しい生徒を登録してください
          </p>
          <Link href="/students/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              生徒を登録
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}