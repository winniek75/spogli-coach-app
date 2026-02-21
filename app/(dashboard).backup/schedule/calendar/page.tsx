'use client'

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">カレンダー</h1>
        <p className="text-muted-foreground mt-2">
          レッスンスケジュールをカレンダー形式で表示します
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">月間カレンダー</h2>
          <div className="text-center text-muted-foreground py-16">
            <p>カレンダー機能は準備中です</p>
            <p className="text-sm mt-2">今後のアップデートで実装予定です</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold mb-3">今日の予定</h3>
            <div className="text-center text-muted-foreground py-4">
              <p className="text-sm">予定はありません</p>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold mb-3">今週の予定</h3>
            <div className="text-center text-muted-foreground py-4">
              <p className="text-sm">予定はありません</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}