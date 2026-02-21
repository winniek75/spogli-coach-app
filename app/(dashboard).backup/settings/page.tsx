'use client'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">設定</h1>
        <p className="text-muted-foreground mt-2">
          システムの設定を管理します
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">基本設定</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">システム名</label>
              <input
                type="text"
                value="スポぐり講師管理システム"
                className="w-full p-2 border rounded-md bg-muted"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">タイムゾーン</label>
              <select className="w-full p-2 border rounded-md bg-muted" disabled>
                <option>Asia/Tokyo (JST)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">通知設定</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>メール通知</span>
              <input type="checkbox" className="rounded" disabled />
            </div>
            <div className="flex items-center justify-between">
              <span>LINE通知</span>
              <input type="checkbox" className="rounded" disabled />
            </div>
            <div className="flex items-center justify-between">
              <span>プッシュ通知</span>
              <input type="checkbox" className="rounded" disabled />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">データ管理</h2>
          <div className="text-center text-muted-foreground py-8">
            <p>データ管理機能は準備中です</p>
            <p className="text-sm mt-2">今後のアップデートで実装予定です</p>
          </div>
        </div>
      </div>
    </div>
  )
}