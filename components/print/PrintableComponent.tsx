'use client'

import { ReactNode, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import PrintButton from './PrintButton'
import PrintLayout from './PrintLayout'
import { cn } from '@/lib/utils'

interface PrintableComponentProps {
  children: ReactNode
  title?: string
  subtitle?: string
  filename?: string
  className?: string
  printButtonProps?: {
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'sm' | 'default' | 'lg'
    className?: string
    title?: string
  }
  onBeforePrint?: () => void
  onAfterPrint?: () => void
}

export default function PrintableComponent({
  children,
  title,
  subtitle,
  filename = 'document',
  className,
  printButtonProps,
  onBeforePrint,
  onAfterPrint,
}: PrintableComponentProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: filename,
    onBeforeGetContent: onBeforePrint,
    onAfterPrint: onAfterPrint,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm;
      }

      @media print {
        body {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
        }

        .print-hidden {
          display: none !important;
        }

        .print-only {
          display: block !important;
        }
      }
    `,
  })

  const handlePrintWithOptions = async (options: any) => {
    // 印刷オプションをスタイルに適用
    const style = document.createElement('style')
    style.innerHTML = `
      @page {
        size: ${options.pageSize} ${options.pageOrientation};
        margin: 15mm;
      }

      @media print {
        html {
          zoom: ${options.scale / 100};
          ${options.colorMode === 'grayscale' ? 'filter: grayscale(100%);' : ''}
        }
      }
    `
    document.head.appendChild(style)

    // 印刷実行
    await handlePrint()

    // スタイル削除
    document.head.removeChild(style)
  }

  const handleDownloadPdf = async (options: any) => {
    // PDF生成のためのオプション処理
    // 実際の実装では jsPDF や Puppeteer を使用
    console.log('PDF download with options:', options)

    // 簡易実装: 印刷ダイアログを開く
    await handlePrintWithOptions(options)
  }

  const handlePreview = () => {
    // プレビューモードで別ウィンドウを開く
    const printWindow = window.open('', '_blank')
    if (printWindow && componentRef.current) {
      const content = componentRef.current.innerHTML
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename} - プレビュー</title>
          <link rel="stylesheet" href="/styles/print.css">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #000;
              background: #fff;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  return (
    <div className={cn('printable-container', className)}>
      {/* 画面表示用コンテンツ */}
      <div className="flex justify-between items-center mb-4 print-hidden">
        <div>
          {title && (
            <h1 className="text-2xl font-bold">{title}</h1>
          )}
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>
        <PrintButton
          onPrint={handlePrintWithOptions}
          onPreview={handlePreview}
          onDownloadPdf={handleDownloadPdf}
          {...printButtonProps}
        />
      </div>

      {/* 印刷用レイアウト */}
      <PrintLayout
        ref={componentRef}
        title={title}
        subtitle={subtitle}
        className="print-content"
      >
        {children}
      </PrintLayout>
    </div>
  )
}