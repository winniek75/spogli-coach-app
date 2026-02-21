'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  MessageSquare,
  QrCode,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
} from 'lucide-react'

interface LineConnectionProps {
  currentLineUserId?: string
  onConnect: (lineUserId: string) => Promise<void>
  onDisconnect: () => Promise<void>
  onTestMessage: () => Promise<void>
}

export default function LineConnection({
  currentLineUserId,
  onConnect,
  onDisconnect,
  onTestMessage,
}: LineConnectionProps) {
  const [lineUserId, setLineUserId] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)

  // QRコード生成
  const generateQRCode = async () => {
    setLoading(true)
    try {
      // 実際の実装では、LINEボットの友達追加用QRコードを生成
      const botUrl = `https://lin.ee/${process.env.NEXT_PUBLIC_LINE_BOT_ID || 'YOUR_BOT_ID'}`
      setQrCode(botUrl)
      setShowQRDialog(true)
    } catch (error) {
      console.error('QR code generation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // LINE接続
  const handleConnect = async () => {
    if (!lineUserId.trim()) return

    setLoading(true)
    try {
      await onConnect(lineUserId.trim())
      setLineUserId('')
    } catch (error) {
      console.error('LINE connection failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // テストメッセージ送信
  const handleTestMessage = async () => {
    setTestLoading(true)
    try {
      await onTestMessage()
    } catch (error) {
      console.error('Test message failed:', error)
    } finally {
      setTestLoading(false)
    }
  }

  // URLコピー
  const copyUrl = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-600" />
          LINE連携
        </CardTitle>
        <CardDescription>
          LINEでの通知受信を設定できます
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentLineUserId ? (
          // 接続済み状態
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-700">LINE連携済み</span>
              <Badge variant="outline" className="ml-auto">
                接続中
              </Badge>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                LINE ID: {currentLineUserId}で連携されています
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                onClick={handleTestMessage}
                disabled={testLoading}
                variant="outline"
                size="sm"
              >
                {testLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4 mr-2" />
                )}
                テストメッセージ送信
              </Button>
              <Button
                onClick={onDisconnect}
                variant="destructive"
                size="sm"
              >
                連携解除
              </Button>
            </div>
          </div>
        ) : (
          // 未接続状態
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                LINEでの通知を受信するには、ボットと友達になってIDを設定してください
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              {/* Step 1: QRコード表示 */}
              <div>
                <Label className="text-sm font-medium">ステップ1: ボットと友達になる</Label>
                <div className="mt-2">
                  <Button onClick={generateQRCode} disabled={loading} variant="outline">
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <QrCode className="h-4 w-4 mr-2" />
                    )}
                    QRコードを表示
                  </Button>
                </div>
              </div>

              {/* Step 2: LINE ID入力 */}
              <div>
                <Label htmlFor="lineUserId" className="text-sm font-medium">
                  ステップ2: LINE IDを入力
                </Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="lineUserId"
                    value={lineUserId}
                    onChange={(e) => setLineUserId(e.target.value)}
                    placeholder="LINE User ID (例: U1234567890abcdef...)"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleConnect}
                    disabled={loading || !lineUserId.trim()}
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    接続
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ボットにメッセージを送ると、あなたのLINE IDが自動で表示されます
                </p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">設定方法:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>上記のQRコードをスキャンしてボットと友達になる</li>
                <li>ボットに「ID」とメッセージを送信する</li>
                <li>返信されたLINE IDをコピーして上記に入力する</li>
                <li>「接続」ボタンを押して設定完了</li>
              </ol>
            </div>
          </div>
        )}

        {/* QRコード表示ダイアログ */}
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Spogli Coach Bot</DialogTitle>
              <DialogDescription>
                以下のQRコードをLINEアプリでスキャンしてボットと友達になってください
              </DialogDescription>
            </DialogHeader>

            <div className="text-center space-y-4">
              {qrCode && (
                <>
                  {/* QRコード画像（実際の実装では qrcode ライブラリを使用） */}
                  <div className="flex justify-center">
                    <div className="w-48 h-48 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <QrCode className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">QRコード</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      QRコードが読み取れない場合は、以下のURLをコピーしてLINEで開いてください:
                    </p>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Input
                        value={qrCode}
                        readOnly
                        className="text-xs"
                      />
                      <Button size="sm" onClick={copyUrl}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setShowQRDialog(false)}>閉じる</Button>
              <Button asChild>
                <a
                  href={qrCode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  LINEで開く
                </a>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}