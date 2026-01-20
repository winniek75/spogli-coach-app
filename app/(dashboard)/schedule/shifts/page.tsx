'use client'

export default function ShiftsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">シフト管理</h1>
        <p className="text-muted-foreground mt-2">
          講師のシフトスケジュールを管理します
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">今週のシフト</h2>
          <div className="text-center text-muted-foreground py-8">
            <p>シフト管理機能は準備中です</p>
            <p className="text-sm mt-2">今後のアップデートで実装予定です</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">シフト設定</h2>
          <div className="text-center text-muted-foreground py-8">
            <p>シフト設定機能は準備中です</p>
            <p className="text-sm mt-2">今後のアップデートで実装予定です</p>
          </div>
        </div>
      </div>
    </div>
  )
}