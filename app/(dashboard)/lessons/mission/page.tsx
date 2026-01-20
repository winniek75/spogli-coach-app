'use client'

export default function MissionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ミッションシート</h1>
        <p className="text-muted-foreground mt-2">
          生徒のミッションシートを管理します
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">今日のミッション</h2>
          <div className="text-center text-muted-foreground py-8">
            <p>ミッションシート機能は準備中です</p>
            <p className="text-sm mt-2">今後のアップデートで実装予定です</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">ミッション履歴</h2>
          <div className="text-center text-muted-foreground py-8">
            <p>ミッション履歴機能は準備中です</p>
            <p className="text-sm mt-2">今後のアップデートで実装予定です</p>
          </div>
        </div>
      </div>
    </div>
  )
}