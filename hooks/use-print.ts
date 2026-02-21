'use client'

import { useCallback } from 'react'

interface PrintOptions {
  title?: string
  orientation?: 'portrait' | 'landscape'
  size?: 'A4' | 'A3' | 'Letter'
  margins?: string
  scale?: number
  colorMode?: 'color' | 'grayscale'
}

interface UsePrintReturn {
  printElement: (element: HTMLElement, options?: PrintOptions) => void
  printContent: (content: string, options?: PrintOptions) => void
  downloadPdf: (element: HTMLElement, filename?: string) => void
  printPage: (options?: PrintOptions) => void
}

export function usePrint(): UsePrintReturn {
  // 要素を印刷
  const printElement = useCallback((element: HTMLElement, options: PrintOptions = {}) => {
    const {
      title = 'Document',
      orientation = 'portrait',
      size = 'A4',
      margins = '15mm',
      scale = 1,
      colorMode = 'color'
    } = options

    // 印刷用ウィンドウを作成
    const printWindow = window.open('', '_blank', 'width=800,height=600')

    if (!printWindow) {
      throw new Error('印刷ウィンドウを開けませんでした')
    }

    // スタイルを含めた HTML を生成
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          @page {
            size: ${size} ${orientation};
            margin: ${margins};
          }

          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
            ${colorMode === 'grayscale' ? 'filter: grayscale(100%);' : ''}
            ${scale !== 1 ? `zoom: ${scale};` : ''}
          }

          @media print {
            .print-hidden, .no-print {
              display: none !important;
            }

            .print-visible, .print-only {
              display: block !important;
            }

            .print-inline {
              display: inline !important;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th, td {
              border: 1px solid #333;
              padding: 5pt;
              text-align: left;
            }

            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }

            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid;
              margin-top: 0;
            }

            p, li {
              orphans: 3;
              widows: 3;
            }

            .page-break {
              page-break-before: always;
            }

            .no-page-break {
              page-break-inside: avoid;
            }
          }

          /* 印刷プレビュー用のスタイル */
          @media screen {
            body {
              max-width: 210mm;
              margin: 20px auto;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              background: white;
            }
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
  }, [])

  // HTMLコンテンツを印刷
  const printContent = useCallback((content: string, options: PrintOptions = {}) => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    printElement(tempDiv, options)
  }, [printElement])

  // PDFとしてダウンロード（簡易版）
  const downloadPdf = useCallback((element: HTMLElement, filename = 'document.pdf') => {
    // 実際の実装では jsPDF や Puppeteer を使用
    console.log('PDF download requested:', filename)

    // 現状では印刷ダイアログを開く（ユーザーが「PDFに保存」を選択可能）
    printElement(element, {
      title: filename.replace('.pdf', ''),
    })
  }, [printElement])

  // 現在のページを印刷
  const printPage = useCallback((options: PrintOptions = {}) => {
    const {
      orientation = 'portrait',
      size = 'A4',
      margins = '15mm',
      scale = 1,
      colorMode = 'color'
    } = options

    // 動的にスタイルを追加
    const style = document.createElement('style')
    style.innerHTML = `
      @page {
        size: ${size} ${orientation};
        margin: ${margins};
      }

      @media print {
        body {
          ${colorMode === 'grayscale' ? 'filter: grayscale(100%);' : ''}
          ${scale !== 1 ? `zoom: ${scale};` : ''}
        }

        .print-hidden, .no-print {
          display: none !important;
        }

        .print-visible, .print-only {
          display: block !important;
        }

        .print-inline {
          display: inline !important;
        }
      }
    `

    document.head.appendChild(style)

    // 印刷実行
    window.print()

    // 印刷後にスタイルを削除
    setTimeout(() => {
      document.head.removeChild(style)
    }, 1000)
  }, [])

  return {
    printElement,
    printContent,
    downloadPdf,
    printPage,
  }
}

// 印刷ユーティリティ関数
export const printUtils = {
  // 印刷前の前処理
  preparePrint: () => {
    // 印刷用のクラスを追加
    document.body.classList.add('printing')

    // 印刷に不要な要素を非表示
    const elementsToHide = document.querySelectorAll('.print-hidden, .no-print')
    elementsToHide.forEach(el => {
      el.classList.add('temp-hidden')
    })

    // 印刷用要素を表示
    const elementsToShow = document.querySelectorAll('.print-only')
    elementsToShow.forEach(el => {
      el.classList.add('temp-visible')
    })
  },

  // 印刷後の後処理
  cleanupPrint: () => {
    // クラスを削除
    document.body.classList.remove('printing')

    // 一時的に非表示にした要素を復元
    const tempHidden = document.querySelectorAll('.temp-hidden')
    tempHidden.forEach(el => {
      el.classList.remove('temp-hidden')
    })

    // 一時的に表示した要素を元に戻す
    const tempVisible = document.querySelectorAll('.temp-visible')
    tempVisible.forEach(el => {
      el.classList.remove('temp-visible')
    })
  },

  // 改ページを挿入
  insertPageBreak: (element: HTMLElement) => {
    const pageBreak = document.createElement('div')
    pageBreak.className = 'page-break'
    element.appendChild(pageBreak)
  },

  // 印刷用のQRコードを生成
  generatePrintQR: (text: string, size = 100) => {
    // 実際の実装では qrcode.js などを使用
    const qrDiv = document.createElement('div')
    qrDiv.className = 'qr-code-print'
    qrDiv.innerHTML = `
      <div style="border: 1px solid #333; width: ${size}px; height: ${size}px; display: inline-block; text-align: center; line-height: ${size}px; font-size: 10px;">
        QR: ${text.substring(0, 10)}...
      </div>
    `
    return qrDiv
  },

  // 印刷プレビューを表示
  showPreview: (element: HTMLElement, title = 'Preview') => {
    const previewWindow = window.open('', '_blank', 'width=800,height=600')

    if (previewWindow) {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title} - プレビュー</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 210mm;
              margin: 20px auto;
              padding: 20px;
              background: white;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }

            .preview-header {
              background: #f0f0f0;
              padding: 10px;
              text-align: center;
              margin-bottom: 20px;
              border: 1px solid #ccc;
            }
          </style>
        </head>
        <body>
          <div class="preview-header">
            <h2>印刷プレビュー: ${title}</h2>
            <p>実際の印刷時のレイアウトです</p>
          </div>
          ${element.outerHTML}
        </body>
        </html>
      `

      previewWindow.document.write(html)
      previewWindow.document.close()
    }
  }
}