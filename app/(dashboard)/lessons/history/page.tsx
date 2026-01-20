'use client'

export default function LessonsHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">評価履歴</h1>
        <p className="text-muted-foreground mt-2">
          レッスンの評価履歴を確認できます
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">最近の評価</h2>
          <div className="text-center text-muted-foreground py-8">
            <p>評価履歴機能は準備中です</p>
            <p className="text-sm mt-2">今後のアップデートで実装予定です</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">評価統計</h2>
          <div className="text-center text-muted-foreground py-8">
            <p>評価統計機能は準備中です</p>
            <p className="text-sm mt-2">今後のアップデートで実装予定です</p>
          </div>
        </div>
      </div>
    </div>
  )
}