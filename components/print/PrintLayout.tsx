'use client'

import { ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface PrintLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  includeHeader?: boolean
  includeFooter?: boolean
  includeDate?: boolean
  includeSignature?: boolean
  className?: string
  watermark?: string
  pageOrientation?: 'portrait' | 'landscape'
  pageSize?: 'A4' | 'A3' | 'Letter'
}

const PrintLayout = forwardRef<HTMLDivElement, PrintLayoutProps>(({
  children,
  title,
  subtitle,
  includeHeader = true,
  includeFooter = true,
  includeDate = true,
  includeSignature = false,
  className,
  watermark,
  pageOrientation = 'portrait',
  pageSize = 'A4',
}, ref) => {
  const currentDate = new Date().toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      ref={ref}
      className={cn(
        'print-layout bg-white text-black min-h-screen',
        pageOrientation === 'landscape' && 'print-landscape',
        pageSize === 'A3' && 'print-a3',
        pageSize === 'Letter' && 'print-letter',
        className
      )}
    >
      {/* 透かし */}
      {watermark && (
        <div className="watermark print-only">
          {watermark}
        </div>
      )}

      {/* 印刷用ヘッダー */}
      {includeHeader && (
        <header className="print-header print-only">
          <div className="text-center">
            {title && (
              <h1 className="text-xl font-bold mb-2">{title}</h1>
            )}
            {subtitle && (
              <p className="text-gray-600">{subtitle}</p>
            )}
            {includeDate && (
              <p className="text-sm text-gray-500 mt-2 print-date">
                {currentDate}
              </p>
            )}
          </div>
        </header>
      )}

      {/* メインコンテンツ */}
      <main className="print-content">
        {children}
      </main>

      {/* 署名欄 */}
      {includeSignature && (
        <section className="signature-section print-only">
          <h3 className="text-lg font-semibold mb-4">署名</h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm text-gray-600 mb-2">担当者</label>
              <div className="signature-line"></div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">確認者</label>
              <div className="signature-line"></div>
            </div>
          </div>
        </section>
      )}

      {/* 印刷用フッター */}
      {includeFooter && (
        <footer className="print-footer print-only">
          <p>
            © 2024 Spogli Coach App. All rights reserved.
            {includeDate && ` | 印刷日時: ${currentDate}`}
          </p>
        </footer>
      )}
    </div>
  )
})

PrintLayout.displayName = 'PrintLayout'

export default PrintLayout