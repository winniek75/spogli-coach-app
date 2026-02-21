'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { usePDFMaterials } from '@/hooks/use-pdf-materials'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Download,
  Edit,
  Trash2,
  Eye,
  HardDrive,
  AlertTriangle,
  BookOpen,
} from 'lucide-react'
import { PDFMaterialWithDetails, CONTENT_CATEGORIES, PDF_PURPOSES } from '@/types/content'

export default function MaterialsPage() {
  const params = useParams()
  const locale = params?.locale || 'ja'
  const { pdfMaterials, loading, error, fetchPDFMaterials, downloadPDFMaterial, deletePDFMaterial } = usePDFMaterials()
  const [searchTerm, setSearchTerm] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sportFilter, setSportFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  const handleSearch = () => {
    fetchPDFMaterials({
      search: searchTerm,
      category: categoryFilter,
      sport: sportFilter,
      level: levelFilter ? parseInt(levelFilter) : undefined,
    })
  }

  const handleDownload = async (material: PDFMaterialWithDetails) => {
    try {
      await downloadPDFMaterial(material.id)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('この教材を削除しますか？')) {
      try {
        await deletePDFMaterial(id)
      } catch (err) {
        console.error('Delete failed:', err)
      }
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '不明'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getSportBadgeColor = (sport: string) => {
    const colors = {
      soccer: 'bg-green-100 text-green-800',
      basketball: 'bg-orange-100 text-orange-800',
      baseball: 'bg-blue-100 text-blue-800',
    }
    return colors[sport as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getLevelBadgeColor = (level: number) => {
    if (level <= 2) return 'bg-yellow-100 text-yellow-800'
    if (level <= 4) return 'bg-blue-100 text-blue-800'
    return 'bg-purple-100 text-purple-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">教材データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>再試行</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">教材ライブラリ</h1>
          <p className="text-muted-foreground mt-2">
            PDF教材の管理・閲覧・ダウンロード
          </p>
        </div>
        <Link href={`/${locale}/content/materials/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            教材をアップロード
          </Button>
        </Link>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="タイトル、説明で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全カテゴリ</SelectItem>
                {Object.entries(CONTENT_CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger>
                <SelectValue placeholder="スポーツで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全スポーツ</SelectItem>
                <SelectItem value="soccer">サッカー</SelectItem>
                <SelectItem value="basketball">バスケットボール</SelectItem>
                <SelectItem value="baseball">野球</SelectItem>
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="レベルで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全レベル</SelectItem>
                <SelectItem value="1">Lv1: Rookie</SelectItem>
                <SelectItem value="2">Lv2: Challenger</SelectItem>
                <SelectItem value="3">Lv3: Adventurer</SelectItem>
                <SelectItem value="4">Lv4: Explorer</SelectItem>
                <SelectItem value="5">Lv5: Champion</SelectItem>
                <SelectItem value="6">Lv6: Master</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSearch}>検索</Button>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {pdfMaterials.length}件の教材
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 教材一覧 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pdfMaterials.map((material) => (
          <Card key={material.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0">
                    {material.thumbnail_url ? (
                      <img
                        src={material.thumbnail_url}
                        alt={material.title}
                        className="w-12 h-16 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-muted flex items-center justify-center rounded border">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {material.title}
                    </CardTitle>
                    {material.description && (
                      <CardDescription className="line-clamp-2 mt-1">
                        {material.description}
                      </CardDescription>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/content/materials/${material.id}/view`}>
                        <Eye className="h-4 w-4 mr-2" />
                        プレビュー
                      </Link>
                    </DropdownMenuItem>
                    {material.is_downloadable && (
                      <DropdownMenuItem onClick={() => handleDownload(material)}>
                        <Download className="h-4 w-4 mr-2" />
                        ダウンロード
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href={`/content/materials/${material.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        編集
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(material.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={getSportBadgeColor(material.sport)}>
                  {material.sport}
                </Badge>
                <Badge className={getLevelBadgeColor(material.level)}>
                  Lv{material.level}
                </Badge>
                <Badge variant="outline">
                  {CONTENT_CATEGORIES[material.category as keyof typeof CONTENT_CATEGORIES]}
                </Badge>
                {!material.is_downloadable && (
                  <Badge variant="secondary">閲覧のみ</Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{material.view_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  <span>{material.download_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  <span>{formatFileSize(material.file_size)}</span>
                </div>
              </div>

              {material.tags && material.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {material.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {material.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{material.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                作成者: {material.created_by_name || 'Unknown'} • {new Date(material.created_at).toLocaleDateString('ja-JP')}
              </div>

              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/content/materials/${material.id}/view`}>
                    <Eye className="h-3 w-3 mr-1" />
                    プレビュー
                  </Link>
                </Button>
                {material.is_downloadable && (
                  <Button
                    size="sm"
                    onClick={() => handleDownload(material)}
                    className="flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    ダウンロード
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pdfMaterials.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            教材が見つかりません
          </p>
          <p className="text-muted-foreground mb-4">
            検索条件を変更するか、新しい教材をアップロードしてください
          </p>
          <Link href="/content/materials/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              教材をアップロード
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}