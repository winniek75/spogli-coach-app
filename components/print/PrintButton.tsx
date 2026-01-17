'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Printer,
  FileText,
  Download,
  Settings,
  ChevronDown,
  CheckCircle,
} from 'lucide-react'

interface PrintOptions {
  includeHeader: boolean
  includeFooter: boolean
  includeSignature: boolean
  includeDate: boolean
  pageOrientation: 'portrait' | 'landscape'
  pageSize: 'A4' | 'A3' | 'Letter'
  colorMode: 'color' | 'grayscale'
  scale: number
}

interface PrintButtonProps {
  onPrint: (options: PrintOptions) => void
  onPreview?: () => void
  onDownloadPdf?: (options: PrintOptions) => void
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
  title?: string
}

const defaultPrintOptions: PrintOptions = {
  includeHeader: true,
  includeFooter: true,
  includeSignature: false,
  includeDate: true,
  pageOrientation: 'portrait',
  pageSize: 'A4',
  colorMode: 'color',
  scale: 100,
}

export default function PrintButton({
  onPrint,
  onPreview,
  onDownloadPdf,
  className,
  variant = 'outline',
  size = 'default',
  disabled = false,
  title = '印刷',
}: PrintButtonProps) {
  const [showOptions, setShowOptions] = useState(false)
  const [options, setOptions] = useState<PrintOptions>(defaultPrintOptions)
  const [printing, setPrinting] = useState(false)

  // 即座に印刷
  const handleQuickPrint = async () => {
    setPrinting(true)
    try {
      await onPrint(defaultPrintOptions)
    } finally {
      setPrinting(false)
    }
  }

  // オプション付き印刷
  const handlePrintWithOptions = async () => {
    setPrinting(true)
    try {
      await onPrint(options)
      setShowOptions(false)
    } finally {
      setPrinting(false)
    }
  }

  // PDF ダウンロード
  const handleDownloadPdf = async () => {
    if (onDownloadPdf) {
      setPrinting(true)
      try {
        await onDownloadPdf(options)
        setShowOptions(false)
      } finally {
        setPrinting(false)
      }
    }
  }

  // プレビュー
  const handlePreview = () => {
    if (onPreview) {
      onPreview()
    }
  }

  const updateOption = (key: keyof PrintOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={disabled || printing}
            className={className}
          >
            {printing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            <span className="ml-2">{title}</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleQuickPrint} disabled={printing}>
            <Printer className="h-4 w-4 mr-2" />
            すぐに印刷
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowOptions(true)} disabled={printing}>
            <Settings className="h-4 w-4 mr-2" />
            詳細設定で印刷
          </DropdownMenuItem>

          {onPreview && (
            <DropdownMenuItem onClick={handlePreview}>
              <FileText className="h-4 w-4 mr-2" />
              プレビュー
            </DropdownMenuItem>
          )}

          {onDownloadPdf && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDownloadPdf} disabled={printing}>
                <Download className="h-4 w-4 mr-2" />
                PDF ダウンロード
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 印刷オプションダイアログ */}
      <Dialog open={showOptions} onOpenChange={setShowOptions}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>印刷設定</DialogTitle>
            <DialogDescription>
              印刷の詳細設定を行ってください
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* ページ設定 */}
            <div className="space-y-4">
              <Label className="text-base font-medium">ページ設定</Label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orientation" className="text-sm">向き</Label>
                  <Select
                    value={options.pageOrientation}
                    onValueChange={(value) => updateOption('pageOrientation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">縦向き</SelectItem>
                      <SelectItem value="landscape">横向き</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="pageSize" className="text-sm">サイズ</Label>
                  <Select
                    value={options.pageSize}
                    onValueChange={(value) => updateOption('pageSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="colorMode" className="text-sm">カラーモード</Label>
                  <Select
                    value={options.colorMode}
                    onValueChange={(value) => updateOption('colorMode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">カラー</SelectItem>
                      <SelectItem value="grayscale">グレースケール</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scale" className="text-sm">拡大率</Label>
                  <Select
                    value={options.scale.toString()}
                    onValueChange={(value) => updateOption('scale', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="75">75%</SelectItem>
                      <SelectItem value="100">100%</SelectItem>
                      <SelectItem value="125">125%</SelectItem>
                      <SelectItem value="150">150%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 印刷オプション */}
            <div className="space-y-4">
              <Label className="text-base font-medium">印刷オプション</Label>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeHeader"
                    checked={options.includeHeader}
                    onCheckedChange={(checked) => updateOption('includeHeader', checked)}
                  />
                  <Label htmlFor="includeHeader" className="text-sm">
                    ヘッダーを含める
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeFooter"
                    checked={options.includeFooter}
                    onCheckedChange={(checked) => updateOption('includeFooter', checked)}
                  />
                  <Label htmlFor="includeFooter" className="text-sm">
                    フッターを含める
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDate"
                    checked={options.includeDate}
                    onCheckedChange={(checked) => updateOption('includeDate', checked)}
                  />
                  <Label htmlFor="includeDate" className="text-sm">
                    印刷日時を含める
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeSignature"
                    checked={options.includeSignature}
                    onCheckedChange={(checked) => updateOption('includeSignature', checked)}
                  />
                  <Label htmlFor="includeSignature" className="text-sm">
                    署名欄を追加
                  </Label>
                </div>
              </div>
            </div>

            {/* 現在の設定プレビュー */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <Label className="text-sm font-medium">現在の設定</Label>
              <div className="text-xs text-gray-600 mt-1 space-y-1">
                <div>ページ: {options.pageSize} {options.pageOrientation === 'portrait' ? '縦向き' : '横向き'}</div>
                <div>カラー: {options.colorMode === 'color' ? 'カラー' : 'グレースケール'}</div>
                <div>拡大率: {options.scale}%</div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setOptions(defaultPrintOptions)}
            >
              リセット
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowOptions(false)}
              >
                キャンセル
              </Button>
              {onDownloadPdf && (
                <Button
                  variant="outline"
                  onClick={handleDownloadPdf}
                  disabled={printing}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              )}
              <Button
                onClick={handlePrintWithOptions}
                disabled={printing}
              >
                {printing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                ) : (
                  <Printer className="h-4 w-4 mr-2" />
                )}
                印刷
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}