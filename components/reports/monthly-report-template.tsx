'use client'

import React from 'react'
import { MonthlyReport } from '@/types/monthly-report'

interface MonthlyReportTemplateProps {
  report: MonthlyReport
  isPrintMode?: boolean
}

export function MonthlyReportTemplate({ report, isPrintMode = false }: MonthlyReportTemplateProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  const getStarRating = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(3 - rating)
  }

  const getProgressBar = (percentage: number) => {
    const filled = Math.round(percentage / 10)
    return '■'.repeat(filled) + '□'.repeat(10 - filled)
  }

  return (
    <div className={`max-w-4xl mx-auto bg-white ${isPrintMode ? 'print-template' : 'p-8'}`}>
      <style jsx>{`
        @media print {
          .print-template {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }

        .spogli-bg {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1419 100%);
        }

        .spogli-accent {
          color: #7fdbca;
        }

        .badge-star { color: #ffd700; }
        .badge-shield { color: #4a90e2; }
        .badge-crown { color: #e94b3c; }

        .skill-vision { background-color: #3b82f6; }
        .skill-rhythm { background-color: #a855f7; }
        .skill-coordination { background-color: #22c55e; }
      `}</style>

      {/* ヘッダー */}
      <div className="spogli-bg text-white p-8 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">スポぐり通信</h1>
            <h2 className="text-xl spogli-accent">
              {report.year}年{report.month}月 月次成長レポート
            </h2>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">発行日</div>
            <div className="text-lg">{formatDate(report.generated_at)}</div>
          </div>
        </div>
      </div>

      {/* 生徒基本情報 */}
      <div className="bg-gray-50 p-6 border-x">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            {report.photo_url ? (
              <img
                src={report.photo_url}
                alt={report.student_name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-2xl text-gray-600">👤</span>
              </div>
            )}
          </div>
          <div className="flex-grow">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">お名前</div>
                <div className="text-xl font-bold">{report.student_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">年齢</div>
                <div className="text-lg">{report.student_age}歳</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">スクール</div>
                <div className="text-lg">{report.school === 'ageo' ? '上尾校' : '桶川校'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">入会日</div>
                <div className="text-lg">{formatDate(report.enrollment_date)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 出席状況 */}
      <div className="p-6 border-x">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <span className="text-blue-500 mr-2">📅</span>
          今月の出席状況
        </h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{report.attendance_count}</div>
              <div className="text-sm text-gray-600">出席回数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{report.total_lessons}</div>
              <div className="text-sm text-gray-600">総レッスン数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{report.attendance_rate}%</div>
              <div className="text-sm text-gray-600">出席率</div>
            </div>
          </div>
        </div>
      </div>

      {/* 現在のレベル */}
      <div className="p-6 border-x">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <span className="text-yellow-500 mr-2">🏆</span>
          現在のレベル
        </h3>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xl font-bold flex items-center gap-2">
                Level {report.current_level.level}
                {report.current_level.is_on_track ? (
                  <span className="text-green-500 text-sm">✓ 順調</span>
                ) : (
                  <span className="text-orange-500 text-sm">⚠ 要サポート</span>
                )}
              </div>
              <div className="text-lg text-yellow-700">{report.current_level.title}</div>
              <div className="text-sm text-gray-600 mt-2">{report.current_level.description}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">次回認定まで</div>
              <div className="text-lg font-bold">{report.current_level.next_level_months}ヶ月</div>
              <div className="text-xs text-gray-500">
                ({formatDate(report.current_level.next_certification_date)})
              </div>
            </div>
          </div>

          {/* 進捗詳細 */}
          <div className="border-t pt-3 mt-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">入会からの経過:</span>
                <span className="ml-2 font-medium">{report.current_level.months_since_enrollment}ヶ月</span>
              </div>
              <div>
                <span className="text-gray-600">予定レベル:</span>
                <span className="ml-2 font-medium">Level {report.current_level.expected_level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* スキル評価 */}
      {report.skill_evaluation.evaluation_count > 0 && (
        <div className="p-6 border-x">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="text-purple-500 mr-2">{report.skill_evaluation.sport_emoji}</span>
            今月のスキル評価
          </h3>

          {/* トレーニング平均 */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">トレーニング平均</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-sm text-blue-600">👁 Vision</div>
                <div className="text-lg font-bold">{getStarRating(report.skill_evaluation.training_averages.vision)}</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded">
                <div className="text-sm text-purple-600">🎵 Rhythm</div>
                <div className="text-lg font-bold">{getStarRating(report.skill_evaluation.training_averages.rhythm)}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-sm text-green-600">🤸 Coordination</div>
                <div className="text-lg font-bold">{getStarRating(report.skill_evaluation.training_averages.coordination)}</div>
              </div>
            </div>
          </div>

          {/* 個別スキル評価 */}
          {report.skill_evaluation.skills.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">個別スキル評価</h4>
              <div className="space-y-2">
                {report.skill_evaluation.skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <span
                        className="px-2 py-1 text-xs text-white rounded"
                        style={{ backgroundColor: skill.category_color }}
                      >
                        {skill.category}
                      </span>
                      <span className="font-medium">{skill.skill_name}</span>
                    </div>
                    <div className="text-lg font-bold">
                      {getStarRating(skill.rating)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* バッジ状況 */}
      <div className="p-6 border-x">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <span className="text-yellow-500 mr-2">🏅</span>
          バッジ状況
        </h3>

        {/* 獲得済みバッジ */}
        {report.badges.earned.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-green-600">獲得済みバッジ</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {report.badges.earned.map((badge, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{badge.category}</div>
                    <div className="text-xs text-gray-600">{formatDate(badge.earned_date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 進行中バッジ */}
        {report.badges.in_progress.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-blue-600">チャレンジ中</h4>
            <div className="space-y-3">
              {report.badges.in_progress.map((badge, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{badge.icon}</span>
                    <div className="flex-grow">
                      <div className="font-medium">{badge.category}</div>
                      <div className="text-sm text-gray-600">
                        {badge.current_count} / {badge.required_count} ★★★
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {badge.progress_percentage}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${badge.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 将来のバッジ候補 */}
        {report.badges.potential && report.badges.potential.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 text-purple-600">新たなバッジ候補</h4>
            <div className="space-y-2">
              {report.badges.potential.map((badge, index) => (
                <div key={index} className="p-3 bg-purple-50 rounded-lg border-2 border-dashed border-purple-200">
                  <div className="flex items-center gap-3">
                    <span className="text-lg opacity-60">{badge.icon}</span>
                    <div className="flex-grow">
                      <div className="font-medium text-purple-700">{badge.sport} - {badge.category}</div>
                      <div className="text-sm text-purple-600">
                        現在: {badge.current_count} / {badge.required_count} ★★★
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-purple-600">{badge.progress_percentage}%</div>
                      <div className="text-xs text-purple-500">候補</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 成長まとめ */}
      <div className="p-6 border-x">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <span className="text-green-500 mr-2">🌟</span>
          成長まとめ
        </h3>

        {/* できるようになったこと */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-green-600">✅ できるようになったこと</h4>
          {report.growth_summary.achievements.length > 0 ? (
            <ul className="space-y-2">
              {report.growth_summary.achievements.map((achievement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 italic">コーチからのコメントをお待ちください</div>
          )}
        </div>

        {/* 来月チャレンジすること */}
        <div>
          <h4 className="font-semibold mb-3 text-blue-600">🎯 来月チャレンジすること</h4>
          {report.growth_summary.next_challenges.length > 0 ? (
            <ul className="space-y-2">
              {report.growth_summary.next_challenges.map((challenge, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 italic">コーチからのコメントをお待ちください</div>
          )}
        </div>
      </div>

      {/* コーチからのメッセージ */}
      <div className="p-6 border-x border-b rounded-b-lg">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <span className="text-red-500 mr-2">💌</span>
          Coach's Message
        </h3>
        <div className="bg-red-50 p-4 rounded-lg min-h-[120px]">
          {report.coach_note ? (
            <div className="whitespace-pre-wrap leading-relaxed">{report.coach_note}</div>
          ) : (
            <div className="text-gray-500 italic">コーチからのメッセージをお待ちください</div>
          )}
        </div>
      </div>

      {/* フッター */}
      <div className="text-center py-4 text-sm text-gray-500 border-t">
        <div className="spogli-accent font-semibold">スポーツビジョントレーニング専門スクール スポぐり</div>
        <div>Generated on {formatDate(report.generated_at)}</div>
      </div>
    </div>
  )
}