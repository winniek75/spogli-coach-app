'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('students')
  const { students, loading, error, fetchStudents } = useStudents()
  const [searchTerm, setSearchTerm] = useState('')
  const [schoolFilter, setSchoolFilter] = useState<string>('')
  const [classFilter, setClassFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Get current locale from params
  const params = useParams()
  const isEnglish = params.locale === 'en'

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
    if (!levelData) return <Badge variant="secondary">{t('studentCard.unknown')}</Badge>

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
        {school === 'ageo' ? t('filters.ageo') : t('filters.okegawa')}
      </Badge>
    )
  }

  const getClassTypeBadge = (classType: string) => {
    return (
      <Badge variant="secondary" className="text-xs">
        {classType === 'preschool' ? t('filters.preschool') : t('filters.elementary')}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: t('filters.active'), color: 'bg-green-600' },
      inactive: { label: t('filters.inactive'), color: 'bg-gray-600' },
      withdrawn: { label: t('filters.withdrawn'), color: 'bg-red-600' },
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
          <p className="text-muted-foreground">{t('loading')}</p>
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
          <Button onClick={() => window.location.reload()}>{t('retry')}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/students/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('addNew')}
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
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={schoolFilter} onValueChange={(value) => handleFilterChange('school', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('filters.schoolFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allSchools')}</SelectItem>
                <SelectItem value="ageo">{t('filters.ageo')}</SelectItem>
                <SelectItem value="okegawa">{t('filters.okegawa')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={classFilter} onValueChange={(value) => handleFilterChange('class_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('filters.classFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allClasses')}</SelectItem>
                <SelectItem value="preschool">{t('filters.preschool')}</SelectItem>
                <SelectItem value="elementary">{t('filters.elementary')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('filters.statusFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                <SelectItem value="active">{t('filters.active')}</SelectItem>
                <SelectItem value="inactive">{t('filters.inactive')}</SelectItem>
                <SelectItem value="withdrawn">{t('filters.withdrawn')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredStudents.length}{t('stats.totalStudents')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Baby className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t('stats.preschoolCount')} {filteredStudents.filter(s => s.class_type === 'preschool').length}{t('stats.studentsCount')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t('stats.elementaryCount')} {filteredStudents.filter(s => s.class_type === 'elementary').length}{t('stats.studentsCount')}
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
                    <CardTitle className="text-lg">
                      {isEnglish && student.name_en ? student.name_en : student.name}
                    </CardTitle>
                    {!isEnglish && student.name_kana && (
                      <p className="text-sm text-muted-foreground">
                        {student.name_kana}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {student.age}{t('studentCard.age')}
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
                        {t('studentCard.viewDetails')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/students/${student.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t('studentCard.edit')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/students/${student.id}/evaluate`}>
                        <Star className="h-4 w-4 mr-2" />
                        {t('studentCard.evaluate')}
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
                <p className="font-medium text-muted-foreground">{t('studentCard.parent')}</p>
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
                  <p className="text-xs text-muted-foreground">{t('studentCard.badges')}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-3 w-3 text-blue-600" />
                    <span className="font-medium">{student.latest_evaluations?.length || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('studentCard.evaluations')}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Calendar className="h-3 w-3 text-green-600" />
                    <span className="font-medium">{student.attendance_rate}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('studentCard.attendanceRate')}</p>
                </div>
              </div>

              {/* 入会日 */}
              <div className="text-xs text-muted-foreground">
                {t('studentCard.enrollmentDate')}: {new Date(student.enrollment_date).toLocaleDateString('ja-JP')}
              </div>

              {/* 医療メモ・緊急連絡先がある場合の警告 */}
              {(student.medical_notes || student.emergency_contact) && (
                <div className="flex items-center gap-1 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                  <span className="text-xs text-amber-800">{t('studentCard.requiresAttention')}</span>
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
            {t('noStudents')}
          </p>
          <p className="text-muted-foreground mb-4">
            {t('noStudentsDesc')}
          </p>
          <Link href="/students/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('registerStudent')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}