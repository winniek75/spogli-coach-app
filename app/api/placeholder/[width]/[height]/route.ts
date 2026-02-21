import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { width: string; height: string } }
) {
  const { width, height } = params

  // SVGプレースホルダー画像を生成
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#999" text-anchor="middle" dominant-baseline="middle">
        動画サムネイル
      </text>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}