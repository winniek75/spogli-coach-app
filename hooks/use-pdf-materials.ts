'use client'

import { useState, useEffect } from 'react'
import {
  PDFMaterial,
  PDFMaterialWithDetails,
  CreatePDFMaterialRequest,
  UpdatePDFMaterialRequest
} from '@/types/content'

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

      setPDFMaterials(data.pdfMaterials)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF教材の取得に失敗しました')
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