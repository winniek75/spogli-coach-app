'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ImageIcon, Loader2, X } from 'lucide-react'
import { convertGoogleDriveImageUrl } from '@/lib/google-drive-utils'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const SCOPE = 'https://www.googleapis.com/auth/drive.readonly'

interface GoogleDrivePickerProps {
  value?: string
  onChange: (url: string) => void
  label?: string
}

let pickerApiLoaded = false
let gisLoaded = false
let tokenClient: google.accounts.oauth2.TokenClient | null = null
let accessToken: string | null = null

export function GoogleDrivePicker({ value, onChange, label = 'Google Driveから選択' }: GoogleDrivePickerProps) {
  const [loading, setLoading] = useState(false)
  const [scriptsReady, setScriptsReady] = useState(false)

  // Google API スクリプトをロード
  useEffect(() => {
    const loadScripts = async () => {
      // Google API (Picker)
      if (!document.getElementById('google-api-script')) {
        const gapiScript = document.createElement('script')
        gapiScript.id = 'google-api-script'
        gapiScript.src = 'https://apis.google.com/js/api.js'
        gapiScript.onload = () => {
          window.gapi.load('picker', () => {
            pickerApiLoaded = true
            checkReady()
          })
        }
        document.body.appendChild(gapiScript)
      } else if (window.gapi) {
        if (!pickerApiLoaded) {
          window.gapi.load('picker', () => {
            pickerApiLoaded = true
            checkReady()
          })
        }
      }

      // Google Identity Services (OAuth)
      if (!document.getElementById('google-gis-script')) {
        const gisScript = document.createElement('script')
        gisScript.id = 'google-gis-script'
        gisScript.src = 'https://accounts.google.com/gsi/client'
        gisScript.onload = () => {
          gisLoaded = true
          checkReady()
        }
        document.body.appendChild(gisScript)
      } else {
        gisLoaded = true
        checkReady()
      }
    }

    const checkReady = () => {
      if (pickerApiLoaded && gisLoaded) {
        setScriptsReady(true)
      }
    }

    loadScripts()
  }, [])

  const createPicker = useCallback(() => {
    if (!accessToken) return

    const view = new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES)
    view.setIncludeFolders(true)
    view.setSelectFolderEnabled(false)

    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(API_KEY!)
      .setCallback((data: google.picker.ResponseObject) => {
        if (data.action === google.picker.Action.PICKED) {
          const doc = data.docs[0]
          const fileId = doc.id
          // Google Drive の共有URLを生成
          const driveUrl = `https://drive.google.com/file/d/${fileId}/view`
          onChange(driveUrl)
        }
        setLoading(false)
      })
      .setTitle('プロフィール画像を選択')
      .setLocale('ja')
      .build()

    picker.setVisible(true)
  }, [onChange])

  const handleClick = useCallback(() => {
    if (!scriptsReady || !API_KEY || !CLIENT_ID) return
    setLoading(true)

    // すでにトークンがあればそのまま Picker を開く
    if (accessToken) {
      createPicker()
      return
    }

    // OAuth トークンを取得
    if (!tokenClient) {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: (response: google.accounts.oauth2.TokenResponse) => {
          if (response.access_token) {
            accessToken = response.access_token
            createPicker()
          } else {
            setLoading(false)
          }
        },
      })
    }

    tokenClient.requestAccessToken()
  }, [scriptsReady, createPicker])

  const handleClear = () => {
    onChange('')
  }

  const previewUrl = value ? convertGoogleDriveImageUrl(value, 'm') : null

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={loading || !scriptsReady}
          className="flex-1"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4 mr-2" />
          )}
          {loading ? '選択中...' : label}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="icon" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {previewUrl && (
        <div className="flex items-center gap-3">
          <img
            src={previewUrl}
            alt="プロフィール画像プレビュー"
            className="w-20 h-20 object-cover rounded-lg border"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <p className="text-xs text-muted-foreground">選択済み</p>
        </div>
      )}
    </div>
  )
}
