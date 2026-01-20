'use client'

export default function PrintPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">印刷</h1>
        <p className="text-muted-foreground mt-2">
          レポートや資料を印刷します
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">印刷可能な資料</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">生徒レポート</h3>
              <p className="text-sm text-muted-foreground mt-1">
                生徒の進捗と評価をまとめたレポート
              </p>
              <button className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                印刷準備中
              </button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">出席簿</h3>
              <p className="text-sm text-muted-foreground mt-1">
                月次出席記録
              </p>
              <button className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                印刷準備中
              </button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">バッジ証明書</h3>
              <p className="text-sm text-muted-foreground mt-1">
                獲得したバッジの証明書
              </p>
              <button className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                印刷準備中
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">印刷設定</h2>
          <div className="text-center text-muted-foreground py-8">
            <p>印刷機能は準備中です</p>
            <p className="text-sm mt-2">今後のアップデートで実装予定です</p>
          </div>
        </div>
      </div>
    </div>
  )
}