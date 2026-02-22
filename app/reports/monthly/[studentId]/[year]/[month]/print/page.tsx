'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MonthlyReportTemplate } from '@/components/reports/monthly-report-template'
import { MonthlyReport } from '@/types/monthly-report'
import { Printer, Download, ArrowLeft } from 'lucide-react'

export default function MonthlyReportPrintPage() {
  const params = useParams()
  const printRef = useRef<HTMLDivElement>(null)
  const [report, setReport] = useState<MonthlyReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/monthly/${params.studentId}/${params.year}/${params.month}`)
        if (!response.ok) {
          throw new Error('Failed to fetch report')
        }
        const data = await response.json()
        setReport(data.report)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [params])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    // ここでPDF生成ライブラリ（例：jsPDF, html2canvas）を使用してPDFを生成
    // 今回はブラウザの印刷機能を利用
    handlePrint()
  }

  const handleBack = () => {
    window.close()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">レポートを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">レポートの読み込みに失敗しました</p>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleBack} className="mt-4">
            戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* 印刷時に非表示になるコントロール */}
      <div className="no-print fixed top-4 left-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
            <span className="text-sm text-muted-foreground">
              {report.student_name}さん - {report.year}年{report.month}月
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              PDF保存
            </Button>
            <Button size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              印刷
            </Button>
          </div>
        </div>
      </div>

      {/* レポート本体 */}
      <div className="pt-20" ref={printRef}>
        <MonthlyReportTemplate report={report} isPrintMode={true} />
      </div>

      {/* 印刷用スタイル */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }

          .pt-20 {
            padding-top: 0 !important;
          }

          @page {
            size: A4;
            margin: 1cm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }

        @media screen {
          .no-print {
            display: block;
          }
        }
      `}</style>
    </div>
  )
}