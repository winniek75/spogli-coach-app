'use client'

import Link from 'next/link'
import { Video, FileText } from 'lucide-react'

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">コンテンツ管理</h1>
        <p className="text-muted-foreground mt-2">
          動画や教材などのコンテンツを管理します
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/content/videos"
          className="block p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Video className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">動画一覧</h2>
              <p className="text-muted-foreground mt-1">
                レッスン動画を管理
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/content/materials"
          className="block p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">教材一覧</h2>
              <p className="text-muted-foreground mt-1">
                PDF教材を管理
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">コンテンツ統計</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-muted-foreground">動画数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-muted-foreground">教材数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-muted-foreground">総サイズ</div>
          </div>
        </div>
      </div>
    </div>
  )
}