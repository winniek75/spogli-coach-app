'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Clock,
  Users,
  Edit,
  Trash2,
  Copy,
  Share2,
  Printer,
  ChevronRight,
  PlayCircle,
  Video,
} from 'lucide-react'

// デモデータ（実際のアプリではAPIから取得）
const demoMenus = [
  {
    id: 'menu-1',
    title: 'バレーボール基礎練習',
    sport: 'volleyball',
    sportName: 'バレーボール',
    classType: 'preschool',
    duration: 50,
    description: '両手キャッチとアンダーハンドパスの基本を学ぶ',
    warmup: [
      { name: 'ジョギング', duration: 3, description: '体育館を2周' },
      { name: 'ストレッチ', duration: 5, description: '全身のストレッチ' },
    ],
    activities: [
      { name: 'ボールキャッチ練習', duration: 10, description: '両手でボールをキャッチする練習', equipment: ['バレーボール'] },
      {
        name: 'アンダーハンドパス',
        duration: 15,
        description: 'ペアでアンダーハンドパスの練習',
        equipment: ['バレーボール'],
        videoInfo: {
          id: 'video-1',
          title: 'バレーボール アンダーハンドパス基礎',
          duration: 180
        }
      },
      { name: 'ミニゲーム', duration: 12, description: '4対4のミニゲーム', equipment: ['バレーボール', 'ネット'] },
    ],
    cooldown: [
      { name: 'クールダウン', duration: 5, description: 'ストレッチと振り返り' },
    ],
    englishPhrases: ['Catch!', 'Ready!', 'Good job!', 'Nice try!'],
    notes: 'ボールの扱いに慣れていない子供には、最初は風船を使った練習から始めることも検討',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-18',
    isTemplate: true,
  },
  {
    id: 'menu-2',
    title: 'バスケットボール ドリブル強化',
    sport: 'basketball',
    sportName: 'バスケットボール',
    classType: 'elementary',
    duration: 50,
    description: 'ドリブルスキルの向上を目指す',
    warmup: [
      { name: 'ランニング', duration: 3, description: 'コートを走る' },
      { name: 'ダイナミックストレッチ', duration: 5, description: '動的ストレッチ' },
    ],
    activities: [
      { name: 'ドリブル基礎', duration: 10, description: '右手・左手でのドリブル練習', equipment: ['バスケットボール'] },
      { name: 'ドリブルリレー', duration: 10, description: 'チーム対抗ドリブルリレー', equipment: ['バスケットボール', 'コーン'] },
      { name: 'シュート練習', duration: 10, description: 'レイアップシュートの練習', equipment: ['バスケットボール', 'ゴール'] },
      { name: 'ミニゲーム', duration: 7, description: '3対3のミニゲーム', equipment: ['バスケットボール'] },
    ],
    cooldown: [
      { name: 'クールダウン', duration: 5, description: 'ストレッチと振り返り' },
    ],
    englishPhrases: ['Dribble!', 'Shoot!', 'Pass!', 'Great shot!'],
    notes: 'ドリブルが苦手な子供には個別指導の時間を設ける',
    createdAt: '2025-01-10',
    updatedAt: '2025-01-17',
    isTemplate: true,
  },
  {
    id: 'menu-3',
    title: 'サッカー キック練習',
    sport: 'soccer',
    sportName: 'サッカー',
    classType: 'preschool',
    duration: 50,
    description: 'インサイドキックの基本を学ぶ',
    warmup: [
      { name: '鬼ごっこ', duration: 5, description: 'ウォームアップを兼ねた鬼ごっこ' },
      { name: 'ストレッチ', duration: 3, description: '足のストレッチ' },
    ],
    activities: [
      { name: 'ボールタッチ', duration: 8, description: '足でボールを触る練習', equipment: ['サッカーボール'] },
      { name: 'インサイドキック', duration: 12, description: 'インサイドキックの練習', equipment: ['サッカーボール', 'コーン'] },
      { name: 'パス練習', duration: 10, description: 'ペアでパス練習', equipment: ['サッカーボール'] },
      { name: 'ミニゲーム', duration: 7, description: 'ミニゲーム', equipment: ['サッカーボール', 'ゴール'] },
    ],
    cooldown: [
      { name: 'クールダウン', duration: 5, description: 'ストレッチと振り返り' },
    ],
    englishPhrases: ['Kick!', 'Pass!', 'Goal!', 'Well done!'],
    notes: '',
    createdAt: '2025-01-12',
    updatedAt: '2025-01-16',
    isTemplate: false,
  },
]

export default function LessonMenuDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [menu, setMenu] = useState<any>(null)

  useEffect(() => {
    // 実際のアプリではAPIから取得
    const foundMenu = demoMenus.find(m => m.id === params.id)
    if (foundMenu) {
      setMenu(foundMenu)
    }
  }, [params.id])

  if (!menu) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">メニューが見つかりません</h2>
          <p className="text-muted-foreground mb-4">指定されたメニューは存在しません</p>
          <Button asChild>
            <Link href="/lessons/menus">
              <ArrowLeft className="h-4 w-4 mr-2" />
              メニュー一覧に戻る
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const getSportIcon = (sport: string) => {
    const icons: { [key: string]: string } = {
      volleyball: '🏐',
      basketball: '🏀',
      soccer: '⚽',
      tennis: '🎾',
      rugby: '🏉',
      baseball: '⚾',
    }
    return icons[sport] || '🏃'
  }

  const handleDelete = () => {
    if (confirm('このレッスンメニューを削除しますか？')) {
      // 実際のアプリではAPI経由で削除
      router.push('/lessons/menus')
    }
  }

  const handleDuplicate = () => {
    // 実際のアプリではAPI経由で複製
    router.push('/lessons/menus')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/lessons/menus">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <span className="text-4xl">{getSportIcon(menu.sport)}</span>
              {menu.title}
            </h1>
            <p className="text-muted-foreground mt-1">{menu.description}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            印刷
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            共有
          </Button>
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            コピー
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/lessons/menus/${menu.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            削除
          </Button>
        </div>
      </div>

      {/* メタ情報 */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">スポーツ</p>
              <p className="font-medium">{menu.sportName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">対象クラス</p>
              <p className="font-medium">{menu.classType === 'preschool' ? '幼児' : '小学生'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">所要時間</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {menu.duration}分
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">タイプ</p>
              {menu.isTemplate ? (
                <Badge variant="secondary">テンプレート</Badge>
              ) : (
                <Badge variant="outline">カスタム</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* タイムライン */}
      <Card>
        <CardHeader>
          <CardTitle>レッスンの流れ</CardTitle>
          <CardDescription>時間配分と活動内容</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ウォームアップ */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full" />
              <h3 className="font-semibold">ウォームアップ</h3>
              <Badge variant="outline" className="text-xs">
                {menu.warmup.reduce((sum: number, item: any) => sum + item.duration, 0)}分
              </Badge>
            </div>
            <div className="ml-5 space-y-2">
              {menu.warmup.map((item: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground min-w-[40px]">
                    {item.duration}分
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* メインアクティビティ */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full" />
              <h3 className="font-semibold">メインアクティビティ</h3>
              <Badge variant="outline" className="text-xs">
                {menu.activities.reduce((sum: number, item: any) => sum + item.duration, 0)}分
              </Badge>
            </div>
            <div className="ml-5 space-y-2">
              {menu.activities.map((item: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground min-w-[40px]">
                    {item.duration}分
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                    {item.equipment && item.equipment.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.equipment.map((eq: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {eq}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {item.videoInfo && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <PlayCircle className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm text-blue-900">{item.videoInfo.title}</p>
                            <p className="text-xs text-blue-700">
                              指導動画 • {Math.floor(item.videoInfo.duration / 60)}:{(item.videoInfo.duration % 60).toString().padStart(2, '0')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* クールダウン */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-400 rounded-full" />
              <h3 className="font-semibold">クールダウン</h3>
              <Badge variant="outline" className="text-xs">
                {menu.cooldown.reduce((sum: number, item: any) => sum + item.duration, 0)}分
              </Badge>
            </div>
            <div className="ml-5 space-y-2">
              {menu.cooldown.map((item: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground min-w-[40px]">
                    {item.duration}分
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 英語フレーズ */}
      {menu.englishPhrases && menu.englishPhrases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>英語フレーズ</CardTitle>
            <CardDescription>レッスン中に使える英語表現</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {menu.englishPhrases.map((phrase: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-base py-1 px-3">
                  {phrase}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 備考 */}
      {menu.notes && (
        <Card>
          <CardHeader>
            <CardTitle>備考</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{menu.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* 更新情報 */}
      <Card>
        <CardHeader>
          <CardTitle>更新情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">作成日</p>
              <p className="font-medium">{menu.createdAt}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">最終更新</p>
              <p className="font-medium">{menu.updatedAt}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}