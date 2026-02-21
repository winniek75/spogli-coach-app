'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  Printer,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  Settings,
  Copy,
  Download,
  Upload,
  CalendarDays,
  UserPlus,
  Filter,
  Grid,
  List,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// シフト設定を管理するコンポーネント
interface TimeSlot {
  id: string
  time: string
  label: string
  isMainCoach?: boolean
  isSubCoach?: boolean
}

interface Coach {
  id: string
  name: string
  color: string
  isActive: boolean
}

interface ShiftSettings {
  coaches: Coach[]
  ageoTimeSlots: TimeSlot[]
  okegawaTimeSlots: TimeSlot[]
}

export default function EnhancedShiftPage() {
  const t = useTranslations('schedule.shifts')

  // 設定を localStorage から読み込む
  const loadSettings = (): ShiftSettings => {
    if (typeof window === 'undefined') {
      return {
        coaches: [],
        ageoTimeSlots: [],
        okegawaTimeSlots: [],
      }
    }

    const saved = localStorage.getItem('shiftSettings')
    if (saved) {
      return JSON.parse(saved)
    }

    // デフォルト設定
    return {
      coaches: [
        { id: 'coach-1', name: 'Risa', color: '#ef4444', isActive: true },
        { id: 'coach-2', name: 'Gicko', color: '#3b82f6', isActive: true },
        { id: 'coach-3', name: 'Sapta', color: '#22c55e', isActive: true },
        { id: 'coach-4', name: 'Aung', color: '#f59e0b', isActive: true },
      ],
      ageoTimeSlots: [
        { id: 'ageo-1', time: '10:10-11:00', label: 'メインコーチ', isMainCoach: true },
        { id: 'ageo-2', time: '11:10-12:00', label: '幼児クラス', isMainCoach: false },
        { id: 'ageo-3', time: '13:10-14:00', label: '小学生クラス', isMainCoach: false },
      ],
      okegawaTimeSlots: [
        { id: 'oke-1', time: '9:05-9:55', label: 'メインコーチ', isMainCoach: true },
        { id: 'oke-2', time: '10:05-10:55', label: 'サブコーチA', isSubCoach: true },
        { id: 'oke-3', time: '11:30-12:30', label: 'サブコーチB', isSubCoach: true },
        { id: 'oke-4', time: '12:05-12:55', label: '特別クラス', isMainCoach: false },
      ],
    }
  }

  const [settings, setSettings] = useState<ShiftSettings>(loadSettings())
  const [shifts, setShifts] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'list'>('week')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedShifts, setSelectedShifts] = useState<string[]>([])
  const [showShiftDialog, setShowShiftDialog] = useState(false)
  const [editingShift, setEditingShift] = useState<any>(null)

  // 設定を保存
  const saveSettings = (newSettings: ShiftSettings) => {
    localStorage.setItem('shiftSettings', JSON.stringify(newSettings))
    setSettings(newSettings)
  }

  // シフトデータを localStorage から読み込む
  useEffect(() => {
    const savedShifts = localStorage.getItem('shifts')
    if (savedShifts) {
      setShifts(JSON.parse(savedShifts))
    }
  }, [])

  // シフトを保存
  const saveShifts = (newShifts: any[]) => {
    localStorage.setItem('shifts', JSON.stringify(newShifts))
    setShifts(newShifts)
  }

  // シフトを保存（ダイアログから）
  const handleSaveShift = (formData: any) => {
    if (editingShift) {
      // 編集
      const updated = shifts.map(s =>
        s.id === editingShift.id ? { ...s, ...formData } : s
      )
      saveShifts(updated)
    } else {
      // 新規追加
      const newShift = {
        id: `shift-${Date.now()}`,
        ...formData
      }
      saveShifts([...shifts, newShift])
    }
    setShowShiftDialog(false)
    setEditingShift(null)
  }

  // 講師を追加
  const addCoach = () => {
    const newCoach: Coach = {
      id: `coach-${Date.now()}`,
      name: '新しい講師',
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      isActive: true
    }
    saveSettings({ ...settings, coaches: [...settings.coaches, newCoach] })
  }

  // タイムスロットを追加
  const addTimeSlot = (school: 'ageo' | 'okegawa') => {
    const newSlot: TimeSlot = {
      id: `${school}-${Date.now()}`,
      time: '00:00-00:00',
      label: '新しい時間帯',
      isMainCoach: false,
      isSubCoach: false,
    }

    if (school === 'ageo') {
      saveSettings({ ...settings, ageoTimeSlots: [...settings.ageoTimeSlots, newSlot] })
    } else {
      saveSettings({ ...settings, okegawaTimeSlots: [...settings.okegawaTimeSlots, newSlot] })
    }
  }

  // 一括編集機能
  const BulkEditDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={selectedShifts.length === 0}>
          <Edit className="h-4 w-4 mr-2" />
          一括編集 ({selectedShifts.length}件選択)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>シフトの一括編集</DialogTitle>
          <DialogDescription>
            選択した{selectedShifts.length}件のシフトを一括で変更します
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>講師を変更</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="講師を選択" />
              </SelectTrigger>
              <SelectContent>
                {settings.coaches.filter(c => c.isActive).map(coach => (
                  <SelectItem key={coach.id} value={coach.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: coach.color }}
                      />
                      {coach.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>ステータスを変更</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="ステータスを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">確定</SelectItem>
                <SelectItem value="tentative">仮</SelectItem>
                <SelectItem value="cancelled">キャンセル</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSelectedShifts([])}>
            キャンセル
          </Button>
          <Button onClick={() => {
            // 一括更新処理
            setSelectedShifts([])
          }}>
            更新する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // 設定ダイアログ
  const SettingsDialog = () => (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          設定
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>シフト管理設定</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="coaches" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="coaches">講師管理</TabsTrigger>
            <TabsTrigger value="ageo">上尾校時間帯</TabsTrigger>
            <TabsTrigger value="okegawa">桶川校時間帯</TabsTrigger>
          </TabsList>

          <TabsContent value="coaches" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">講師一覧</h3>
              <Button size="sm" onClick={addCoach}>
                <UserPlus className="h-4 w-4 mr-2" />
                講師を追加
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>カラー</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.coaches.map((coach) => (
                  <TableRow key={coach.id}>
                    <TableCell>
                      <Input
                        value={coach.name}
                        onChange={(e) => {
                          const updated = settings.coaches.map(c =>
                            c.id === coach.id ? { ...c, name: e.target.value } : c
                          )
                          saveSettings({ ...settings, coaches: updated })
                        }}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={coach.color}
                          onChange={(e) => {
                            const updated = settings.coaches.map(c =>
                              c.id === coach.id ? { ...c, color: e.target.value } : c
                            )
                            saveSettings({ ...settings, coaches: updated })
                          }}
                          className="w-16 h-8"
                        />
                        <div
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: coach.color }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={coach.isActive}
                        onCheckedChange={(checked) => {
                          const updated = settings.coaches.map(c =>
                            c.id === coach.id ? { ...c, isActive: !!checked } : c
                          )
                          saveSettings({ ...settings, coaches: updated })
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = settings.coaches.filter(c => c.id !== coach.id)
                          saveSettings({ ...settings, coaches: updated })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="ageo" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">上尾校 時間帯設定</h3>
              <Button size="sm" onClick={() => addTimeSlot('ageo')}>
                <Plus className="h-4 w-4 mr-2" />
                時間帯を追加
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>時間</TableHead>
                  <TableHead>ラベル</TableHead>
                  <TableHead>タイプ</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.ageoTimeSlots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell>
                      <Input
                        value={slot.time}
                        onChange={(e) => {
                          const updated = settings.ageoTimeSlots.map(s =>
                            s.id === slot.id ? { ...s, time: e.target.value } : s
                          )
                          saveSettings({ ...settings, ageoTimeSlots: updated })
                        }}
                        className="w-32"
                        placeholder="00:00-00:00"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={slot.label}
                        onChange={(e) => {
                          const updated = settings.ageoTimeSlots.map(s =>
                            s.id === slot.id ? { ...s, label: e.target.value } : s
                          )
                          saveSettings({ ...settings, ageoTimeSlots: updated })
                        }}
                        className="w-40"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={
                          slot.isMainCoach ? 'main' :
                          slot.isSubCoach ? 'sub' :
                          'regular'
                        }
                        onValueChange={(value) => {
                          const updated = settings.ageoTimeSlots.map(s =>
                            s.id === slot.id ? {
                              ...s,
                              isMainCoach: value === 'main',
                              isSubCoach: value === 'sub'
                            } : s
                          )
                          saveSettings({ ...settings, ageoTimeSlots: updated })
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">通常</SelectItem>
                          <SelectItem value="main">メインコーチ</SelectItem>
                          <SelectItem value="sub">サブコーチ</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = settings.ageoTimeSlots.filter(s => s.id !== slot.id)
                          saveSettings({ ...settings, ageoTimeSlots: updated })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="okegawa" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">桶川校 時間帯設定</h3>
              <Button size="sm" onClick={() => addTimeSlot('okegawa')}>
                <Plus className="h-4 w-4 mr-2" />
                時間帯を追加
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>時間</TableHead>
                  <TableHead>ラベル</TableHead>
                  <TableHead>タイプ</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.okegawaTimeSlots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell>
                      <Input
                        value={slot.time}
                        onChange={(e) => {
                          const updated = settings.okegawaTimeSlots.map(s =>
                            s.id === slot.id ? { ...s, time: e.target.value } : s
                          )
                          saveSettings({ ...settings, okegawaTimeSlots: updated })
                        }}
                        className="w-32"
                        placeholder="00:00-00:00"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={slot.label}
                        onChange={(e) => {
                          const updated = settings.okegawaTimeSlots.map(s =>
                            s.id === slot.id ? { ...s, label: e.target.value } : s
                          )
                          saveSettings({ ...settings, okegawaTimeSlots: updated })
                        }}
                        className="w-40"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={
                          slot.isMainCoach ? 'main' :
                          slot.isSubCoach ? 'sub' :
                          'regular'
                        }
                        onValueChange={(value) => {
                          const updated = settings.okegawaTimeSlots.map(s =>
                            s.id === slot.id ? {
                              ...s,
                              isMainCoach: value === 'main',
                              isSubCoach: value === 'sub'
                            } : s
                          )
                          saveSettings({ ...settings, okegawaTimeSlots: updated })
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">通常</SelectItem>
                          <SelectItem value="main">メインコーチ</SelectItem>
                          <SelectItem value="sub">サブコーチ</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = settings.okegawaTimeSlots.filter(s => s.id !== slot.id)
                          saveSettings({ ...settings, okegawaTimeSlots: updated })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // シフト追加/編集ダイアログ
  const ShiftDialog = ({ shift, onSave, onClose }: any) => {
    const [formData, setFormData] = useState({
      date: shift?.date || selectedDate.toISOString().split('T')[0],
      school: shift?.school || '',
      timeSlot: shift?.timeSlot || '',
      coachId: shift?.coachId || '',
      notes: shift?.notes || '',
      status: shift?.status || 'confirmed'
    })

    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{shift ? 'シフトを編集' : 'シフトを追加'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>日付</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label>校舎</Label>
              <Select
                value={formData.school}
                onValueChange={(value) => setFormData({ ...formData, school: value, timeSlot: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="校舎を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ageo">上尾校</SelectItem>
                  <SelectItem value="okegawa">桶川校</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.school && (
              <div>
                <Label>時間帯</Label>
                <Select
                  value={formData.timeSlot}
                  onValueChange={(value) => setFormData({ ...formData, timeSlot: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="時間帯を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.school === 'ageo' ? settings.ageoTimeSlots : settings.okegawaTimeSlots).map(slot => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.time} - {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>講師</Label>
              <Select
                value={formData.coachId}
                onValueChange={(value) => setFormData({ ...formData, coachId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="講師を選択" />
                </SelectTrigger>
                <SelectContent>
                  {settings.coaches.filter(c => c.isActive).map(coach => (
                    <SelectItem key={coach.id} value={coach.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: coach.color }}
                        />
                        {coach.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>ステータス</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">確定</SelectItem>
                  <SelectItem value="tentative">仮</SelectItem>
                  <SelectItem value="cancelled">キャンセル</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>メモ</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="メモを入力..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button onClick={() => onSave(formData)}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // 月表示ビュー
  const MonthView = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay())

    const days = []
    const current = new Date(startDate)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
      if (i >= 28 && current.getMonth() !== month && current.getDay() === 0) break
    }

    return (
      <div>
        <div className="grid grid-cols-7 gap-1">
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} className="text-center font-medium py-2 text-sm">
              {day}
            </div>
          ))}
          {days.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0]
            const dayShifts = shifts.filter(s => s.date === dateStr)
            const isCurrentMonth = date.getMonth() === month
            const isToday = date.toDateString() === new Date().toDateString()

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[80px] border rounded p-1 text-xs",
                  !isCurrentMonth && "bg-gray-50 text-gray-400",
                  isToday && "bg-blue-50 border-blue-300",
                  isEditMode && "cursor-pointer hover:bg-blue-50"
                )}
                onClick={() => {
                  if (isEditMode) {
                    setSelectedDate(date)
                    setShowShiftDialog(true)
                  }
                }}
              >
                <div className="font-medium mb-1">{date.getDate()}</div>
                <div className="space-y-0.5">
                  {dayShifts.slice(0, 3).map(shift => {
                    const coach = settings.coaches.find(c => c.id === shift.coachId)
                    if (!coach) return null

                    return (
                      <div
                        key={shift.id}
                        className="px-1 py-0.5 rounded text-white text-[10px] truncate"
                        style={{ backgroundColor: coach.color }}
                        title={`${coach.name} - ${shift.school === 'ageo' ? '上尾' : '桶川'}`}
                      >
                        {coach.name}
                      </div>
                    )
                  })}
                  {dayShifts.length > 3 && (
                    <div className="text-gray-500 text-[10px]">
                      他{dayShifts.length - 3}件
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // リスト表示ビュー
  const ListView = () => {
    const sortedShifts = [...shifts].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const groupedShifts = sortedShifts.reduce((acc, shift) => {
      if (!acc[shift.date]) acc[shift.date] = []
      acc[shift.date].push(shift)
      return acc
    }, {} as Record<string, typeof shifts>)

    return (
      <div className="space-y-4">
        {Object.entries(groupedShifts).map(([date, dayShifts]) => {
          const dateObj = new Date(date + 'T00:00:00')
          const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()]

          return (
            <div key={date} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-lg">
                  {dateObj.toLocaleDateString('ja-JP', {
                    month: 'long',
                    day: 'numeric'
                  })} ({dayOfWeek})
                </h3>
                {isEditMode && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedDate(dateObj)
                      setShowShiftDialog(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    追加
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {dayShifts.map(shift => {
                  const coach = settings.coaches.find(c => c.id === shift.coachId)
                  const timeSlot = shift.school === 'ageo'
                    ? settings.ageoTimeSlots.find(s => s.id === shift.timeSlot)
                    : settings.okegawaTimeSlots.find(s => s.id === shift.timeSlot)

                  if (!coach || !timeSlot) return null

                  return (
                    <div
                      key={shift.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        {isEditMode && (
                          <Checkbox
                            checked={selectedShifts.includes(shift.id)}
                            onCheckedChange={(checked) => {
                              setSelectedShifts(prev =>
                                checked
                                  ? [...prev, shift.id]
                                  : prev.filter(id => id !== shift.id)
                              )
                            }}
                          />
                        )}
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: coach.color }}
                        />
                        <div>
                          <div className="font-medium">{coach.name}</div>
                          <div className="text-sm text-gray-600">
                            {shift.school === 'ageo' ? '上尾校' : '桶川校'} • {timeSlot.time}
                            {timeSlot.label && ` (${timeSlot.label})`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {shift.status === 'tentative' && (
                          <Badge variant="secondary">仮</Badge>
                        )}
                        {shift.status === 'cancelled' && (
                          <Badge variant="destructive">キャンセル</Badge>
                        )}
                        {isEditMode && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingShift(shift)
                                setShowShiftDialog(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newShifts = shifts.filter(s => s.id !== shift.id)
                                saveShifts(newShifts)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {shifts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            シフトがありません。編集モードで追加してください。
          </div>
        )}
      </div>
    )
  }

  // ビジュアルなカレンダービュー
  const CalendarView = () => {
    const days = ['日', '月', '火', '水', '木', '金', '土']
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => (
          <div key={day} className="text-center font-medium py-2 border-b">
            {day}
          </div>
        ))}
        {Array.from({ length: 7 }).map((_, dayIndex) => {
          const date = new Date(startOfWeek)
          date.setDate(date.getDate() + dayIndex)
          const dateStr = date.toISOString().split('T')[0]
          const dayShifts = shifts.filter(s => s.date === dateStr)

          return (
            <div
              key={dayIndex}
              className={cn(
                "min-h-[200px] border rounded-lg p-2",
                dayIndex === 0 || dayIndex === 6 ? "bg-gray-50" : "",
                isEditMode && "cursor-pointer hover:bg-blue-50"
              )}
              onClick={() => {
                if (isEditMode) {
                  // クリックでシフトを追加
                }
              }}
            >
              <div className="text-sm font-medium mb-1">
                {date.getDate()}日
              </div>
              <div className="space-y-1">
                {dayShifts.map(shift => {
                  const coach = settings.coaches.find(c => c.id === shift.coachId)
                  const timeSlot = shift.school === 'ageo'
                    ? settings.ageoTimeSlots.find(s => s.id === shift.timeSlot)
                    : settings.okegawaTimeSlots.find(s => s.id === shift.timeSlot)

                  if (!coach || !timeSlot) return null

                  return (
                    <div
                      key={shift.id}
                      className="p-1 rounded text-xs text-white cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: coach.color }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isEditMode) {
                          setSelectedShifts(prev =>
                            prev.includes(shift.id)
                              ? prev.filter(id => id !== shift.id)
                              : [...prev, shift.id]
                          )
                        }
                      }}
                    >
                      <div className="font-medium">{coach.name}</div>
                      <div className="opacity-90">
                        {shift.school === 'ageo' ? '上尾' : '桶川'}
                      </div>
                      <div className="opacity-90">{timeSlot.time}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* シフト追加/編集ダイアログ */}
      {showShiftDialog && (
        <ShiftDialog
          shift={editingShift}
          onSave={handleSaveShift}
          onClose={() => {
            setShowShiftDialog(false)
            setEditingShift(null)
          }}
        />
      )}

      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">シフト管理</h1>
          <p className="text-muted-foreground mt-2">
            講師のシフトを簡単に管理・調整できます
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            インポート
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            印刷
          </Button>
        </div>
      </div>

      {/* ツールバー */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  週表示
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                >
                  <Grid className="h-4 w-4 mr-2" />
                  月表示
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4 mr-2" />
                  リスト表示
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newDate = new Date(selectedDate)
                    newDate.setDate(newDate.getDate() - 7)
                    setSelectedDate(newDate)
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium">
                  {selectedDate.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newDate = new Date(selectedDate)
                    newDate.setDate(newDate.getDate() + 7)
                    setSelectedDate(newDate)
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedDate(new Date())}
                >
                  今日
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isEditMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditMode ? '編集完了' : '編集モード'}
              </Button>
              {isEditMode && <BulkEditDialog />}
              <SettingsDialog />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* メインコンテンツ */}
      <Card>
        <CardContent className="py-6">
          {viewMode === 'week' && <CalendarView />}
          {viewMode === 'month' && <MonthView />}
          {viewMode === 'list' && <ListView />}
        </CardContent>
      </Card>

      {/* 凡例 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">凡例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {settings.coaches.filter(c => c.isActive).map(coach => (
              <div key={coach.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: coach.color }}
                />
                <span className="text-sm">{coach.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}