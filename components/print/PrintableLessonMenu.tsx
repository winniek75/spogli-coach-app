'use client'

import { LessonMenuWithDetails } from '@/types/lesson-menu'
import PrintableComponent from './PrintableComponent'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, Target, BookOpen, AlertTriangle } from 'lucide-react'

interface PrintableLessonMenuProps {
  lessonMenu: LessonMenuWithDetails
  showActivities?: boolean
  showEquipment?: boolean
  showNotes?: boolean
  className?: string
}

export default function PrintableLessonMenu({
  lessonMenu,
  showActivities = true,
  showEquipment = true,
  showNotes = true,
  className,
}: PrintableLessonMenuProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}時間${mins > 0 ? mins + '分' : ''}`
    }
    return `${mins}分`
  }

  const getSportBadgeColor = (sport: string) => {
    const colors = {
      soccer: 'bg-green-100 text-green-800',
      basketball: 'bg-orange-100 text-orange-800',
      baseball: 'bg-blue-100 text-blue-800',
    }
    return colors[sport as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getLevelBadgeColor = (level: number) => {
    if (level <= 2) return 'bg-yellow-100 text-yellow-800'
    if (level <= 4) return 'bg-blue-100 text-blue-800'
    return 'bg-purple-100 text-purple-800'
  }

  return (
    <PrintableComponent
      title={lessonMenu.title}
      subtitle={`${lessonMenu.sport} レッスンメニュー`}
      filename={`lesson-menu-${lessonMenu.title.replace(/[^\w\s]/gi, '')}`}
      className={className}
      printButtonProps={{
        variant: 'outline',
        title: 'レッスンメニューを印刷',
      }}
    >
      <div className="lesson-menu-print space-y-6">
        {/* ヘッダー情報 */}
        <div className="lesson-menu-header">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{lessonMenu.title}</h2>
            <div className="flex gap-2">
              <Badge className={getSportBadgeColor(lessonMenu.sport)}>
                {lessonMenu.sport}
              </Badge>
              <Badge className={getLevelBadgeColor(lessonMenu.level)}>
                Level {lessonMenu.level}
              </Badge>
            </div>
          </div>

          {lessonMenu.description && (
            <p className="text-gray-700 mb-4">{lessonMenu.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(lessonMenu.duration_minutes)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{lessonMenu.max_participants}名</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{lessonMenu.activities?.length || 0}項目</span>
            </div>
            <div className="text-sm text-gray-600">
              作成者: {lessonMenu.created_by_name || 'Unknown'}
            </div>
          </div>
        </div>

        {/* 目標 */}
        {lessonMenu.objectives && lessonMenu.objectives.length > 0 && (
          <div className="lesson-menu-section">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5" />
              目標・ねらい
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {lessonMenu.objectives.map((objective, index) => (
                <li key={index} className="text-gray-700">{objective}</li>
              ))}
            </ul>
          </div>
        )}

        {/* アクティビティ */}
        {showActivities && lessonMenu.activities && lessonMenu.activities.length > 0 && (
          <div className="lesson-menu-section">
            <h3 className="text-lg font-semibold mb-4">練習内容</h3>
            <div className="space-y-4">
              {lessonMenu.activities.map((activity, index) => (
                <div key={activity.id} className="lesson-menu-activity">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">
                      {index + 1}. {activity.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{activity.duration_minutes}分</span>
                      <Badge variant="outline">{activity.activity_type}</Badge>
                    </div>
                  </div>

                  {activity.description && (
                    <p className="text-gray-700 mb-2">{activity.description}</p>
                  )}

                  {activity.instructions && (
                    <div className="mb-2">
                      <h5 className="font-medium text-sm mb-1">実施方法:</h5>
                      <p className="text-sm text-gray-600">{activity.instructions}</p>
                    </div>
                  )}

                  {activity.coaching_points && activity.coaching_points.length > 0 && (
                    <div className="mb-2">
                      <h5 className="font-medium text-sm mb-1">コーチングポイント:</h5>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {activity.coaching_points.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activity.equipment && activity.equipment.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-1">使用器具:</h5>
                      <p className="text-sm text-gray-600">{activity.equipment.join(', ')}</p>
                    </div>
                  )}

                  {activity.variations && activity.variations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <h5 className="font-medium text-sm mb-1">バリエーション:</h5>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {activity.variations.map((variation, idx) => (
                          <li key={idx}>{variation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 必要な器具 */}
        {showEquipment && lessonMenu.equipment_needed && lessonMenu.equipment_needed.length > 0 && (
          <div className="lesson-menu-section">
            <h3 className="text-lg font-semibold mb-3">必要な器具・設備</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {lessonMenu.equipment_needed.map((equipment, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  {equipment}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 注意事項・備考 */}
        {showNotes && lessonMenu.notes && (
          <div className="lesson-menu-section">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              注意事項・備考
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{lessonMenu.notes}</p>
            </div>
          </div>
        )}

        {/* メニュー詳細情報 */}
        <div className="lesson-menu-section border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">メニュー情報</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">作成日:</span>
              <span className="ml-2">{new Date(lessonMenu.created_at).toLocaleDateString('ja-JP')}</span>
            </div>
            <div>
              <span className="font-medium">最終更新:</span>
              <span className="ml-2">{new Date(lessonMenu.updated_at).toLocaleDateString('ja-JP')}</span>
            </div>
            <div>
              <span className="font-medium">使用回数:</span>
              <span className="ml-2">{lessonMenu.usage_count || 0}回</span>
            </div>
            {lessonMenu.last_used_date && (
              <div>
                <span className="font-medium">最終利用:</span>
                <span className="ml-2">{new Date(lessonMenu.last_used_date).toLocaleDateString('ja-JP')}</span>
              </div>
            )}
          </div>
        </div>

        {/* 印刷専用の空白スペース */}
        <div className="print-only mt-8 space-y-4">
          <div>
            <h4 className="font-semibold mb-2">実施記録</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="w-16">実施日:</span>
                <div className="border-b border-gray-300 flex-1 h-6"></div>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-16">参加者数:</span>
                <div className="border-b border-gray-300 w-20 h-6"></div>
                <span>名</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-16">天候:</span>
                <div className="border-b border-gray-300 w-32 h-6"></div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">実施後の振り返り</h4>
            <div className="space-y-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="border-b border-gray-300 h-6"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PrintableComponent>
  )
}