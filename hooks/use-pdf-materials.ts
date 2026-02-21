'use client'

import { useState, useEffect } from 'react'
import {
  PDFMaterial,
  PDFMaterialWithDetails,
  CreatePDFMaterialRequest,
  UpdatePDFMaterialRequest
} from '@/types/content'
import { LocalStorageService, isLocalStorageMode, initializeData } from '@/lib/local-storage'

// シードデータなし（実データのみで管理）
const seedPDFMaterials: PDFMaterialWithDetails[] = []

const STORAGE_KEY = 'pdf_materials'

export function usePDFMaterials() {
  const [pdfMaterials, setPDFMaterials] = useState<PDFMaterialWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchPDFMaterials = async (filters?: {
    category?: string
    sport?: string
    level?: number
    search?: string
    limit?: number
    offset?: number
  }) => {
    try {
      setLoading(true)
      setError(null)

      // ローカルストレージモードの場合
      if (isLocalStorageMode()) {
        // ローカルストレージから直接データを取得
        const currentData = LocalStorageService.get<PDFMaterialWithDetails[]>(STORAGE_KEY) || []
        let filteredData = [...currentData]

        // フィルタリング
        if (filters) {
          if (filters.category && filters.category !== 'all') {
            filteredData = filteredData.filter(material => material.category === filters.category)
          }
          if (filters.sport && filters.sport !== 'all') {
            filteredData = filteredData.filter(material => material.sport === filters.sport)
          }
          if (filters.level) {
            filteredData = filteredData.filter(material => material.level === filters.level)
          }
          if (filters.search && filters.search !== 'all') {
            const searchTerm = filters.search.toLowerCase()
            filteredData = filteredData.filter(material =>
              material.title.toLowerCase().includes(searchTerm) ||
              material.description?.toLowerCase().includes(searchTerm)
            )
          }
        }

        setPDFMaterials(filteredData)
        setTotal(filteredData.length)
        setLoading(false)
        return
      }

      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
      }

      const url = `/api/pdf-materials${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch PDF materials')
      }

      setPDFMaterials(data.materials)
      setTotal(data.total)
    } catch (err) {
      // エラー時もローカルストレージから読み込み
      console.warn('Error loading PDF materials:', err)
      const storedData = LocalStorageService.get<PDFMaterialWithDetails[]>(STORAGE_KEY) || []
      setPDFMaterials(storedData)
      setTotal(storedData.length)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const createPDFMaterial = async (materialData: CreatePDFMaterialRequest) => {
    try {
      const response = await fetch('/api/pdf-materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PDF material')
      }

      await fetchPDFMaterials() // リフレッシュ
      return data.pdfMaterial
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'PDF教材の作成に失敗しました')
    }
  }

  const updatePDFMaterial = async (id: string, materialData: UpdatePDFMaterialRequest) => {
    try {
      const response = await fetch(`/api/pdf-materials/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update PDF material')
      }

      await fetchPDFMaterials() // リフレッシュ
      return data.pdfMaterial
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'PDF教材の更新に失敗しました')
    }
  }

  const deletePDFMaterial = async (id: string) => {
    try {
      const response = await fetch(`/api/pdf-materials/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete PDF material')
      }

      await fetchPDFMaterials() // リフレッシュ
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'PDF教材の削除に失敗しました')
    }
  }

  const downloadPDFMaterial = async (id: string) => {
    try {
      const response = await fetch(`/api/pdf-materials/${id}/download`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to download PDF material')
      }

      // ダウンロード処理
      const link = document.createElement('a')
      link.href = data.download_url
      link.download = data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'PDF教材のダウンロードに失敗しました')
    }
  }

  const uploadPDFMaterial = async (materialData: {
    title: string
    description?: string
    sport: string
    category: string
    purpose: string
    level: number
    file_size: number
    file_url: string
    thumbnail_url?: string
    tags?: string[]
  }) => {
    try {
      // 常にローカルストレージモードを使用（Supabase未設定のため）
      const storedData = LocalStorageService.get<PDFMaterialWithDetails[]>(STORAGE_KEY) || []
      console.log('Current PDF materials in storage:', storedData.length)

      const newMaterial: PDFMaterialWithDetails = {
        ...materialData,
        id: `pdf-${Date.now()}`,
        page_count: 0, // PDFの場合、実際のページ数を取得する必要がある
        is_downloadable: true,
        view_count: 0,
        download_count: 0,
        created_by: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by_name: { name: 'ユーザー' }
      }

      const updatedData = [...storedData, newMaterial]
      LocalStorageService.set(STORAGE_KEY, updatedData)
      console.log('PDF materials after upload:', updatedData.length)

      // 確認のため、保存されたデータを読み込み
      const savedData = LocalStorageService.get<PDFMaterialWithDetails[]>(STORAGE_KEY)
      console.log('Verified saved PDF materials:', savedData?.length)

      await fetchPDFMaterials() // リフレッシュ
      return newMaterial
    } catch (err) {
      console.error('Upload error:', err)
      throw new Error(err instanceof Error ? err.message : 'PDF教材のアップロードに失敗しました')
    }
  }

  useEffect(() => {
    fetchPDFMaterials()
  }, [])

  return {
    pdfMaterials,
    loading,
    error,
    total,
    fetchPDFMaterials,
    createPDFMaterial,
    updatePDFMaterial,
    deletePDFMaterial,
    downloadPDFMaterial,
    uploadPDFMaterial,
  }
}

export function usePDFMaterial(id: string) {
  const [pdfMaterial, setPDFMaterial] = useState<PDFMaterialWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPDFMaterial = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/pdf-materials/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch PDF material')
        }

        setPDFMaterial(data.pdfMaterial)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'PDF教材の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchPDFMaterial()
  }, [id])

  return { pdfMaterial, loading, error }
}