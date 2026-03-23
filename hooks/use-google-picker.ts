'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly'

type PickerType = 'video' | 'image'

interface PickerResult {
  id: string
  name: string
  mimeType: string
  url: string
}

interface UseGooglePickerOptions {
  onPicked?: (result: PickerResult) => void
}

export function useGooglePicker(options?: UseGooglePickerOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tokenClientRef = useRef<google.accounts.oauth2.TokenClient | null>(null)
  const accessTokenRef = useRef<string | null>(null)
  const pickerTypeRef = useRef<PickerType>('video')
  const onPickedRef = useRef(options?.onPicked)

  // Keep callback ref in sync
  useEffect(() => {
    onPickedRef.current = options?.onPicked
  }, [options?.onPicked])

  // Load Google API scripts
  useEffect(() => {
    const loadScript = (src: string, id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
          resolve()
          return
        }
        const script = document.createElement('script')
        script.id = id
        script.src = src
        script.async = true
        script.defer = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load ${src}`))
        document.head.appendChild(script)
      })
    }

    const init = async () => {
      try {
        await Promise.all([
          loadScript('https://apis.google.com/js/api.js', 'google-api-script'),
          loadScript('https://accounts.google.com/gsi/client', 'google-gsi-script'),
        ])

        // Load the picker API
        await new Promise<void>((resolve) => {
          window.gapi.load('picker', () => resolve())
        })

        // Initialize OAuth token client
        tokenClientRef.current = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: () => {}, // Will be overridden when opening picker
        })
      } catch (err) {
        console.error('Failed to initialize Google APIs:', err)
        setError('Google APIの読み込みに失敗しました')
      }
    }

    init()
  }, [])

  const createPicker = useCallback((type: PickerType, token: string) => {
    const mimeTypes = type === 'video'
      ? 'video/mp4,video/quicktime,video/webm,video/avi,video/x-msvideo'
      : 'image/jpeg,image/png,image/webp,image/gif'

    const view = new google.picker.DocsView()
    view.setMimeTypes(mimeTypes)
    view.setIncludeFolders(true)

    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(token)
      .setDeveloperKey(API_KEY)
      .setTitle(type === 'video' ? '動画を選択' : '画像を選択')
      .setLocale('ja')
      .setCallback((data: google.picker.ResponseObject) => {
        if (data.action === google.picker.Action.PICKED && data.docs.length > 0) {
          const doc = data.docs[0]
          const result: PickerResult = {
            id: doc.id,
            name: doc.name,
            mimeType: doc.mimeType,
            url: `https://drive.google.com/file/d/${doc.id}/view`,
          }
          onPickedRef.current?.(result)
        }
        setIsLoading(false)
      })
      .build()

    picker.setVisible(true)
  }, [])

  const openPicker = useCallback((type: PickerType = 'video') => {
    if (!tokenClientRef.current) {
      setError('Google APIが初期化されていません。ページを再読み込みしてください。')
      return
    }

    setIsLoading(true)
    setError(null)
    pickerTypeRef.current = type

    // If we already have a token, use it directly
    if (accessTokenRef.current) {
      createPicker(type, accessTokenRef.current)
      return
    }

    // Request a new access token
    tokenClientRef.current = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: google.accounts.oauth2.TokenResponse) => {
        if (response.error) {
          setError('Google認証に失敗しました。もう一度お試しください。')
          setIsLoading(false)
          return
        }
        if (response.access_token) {
          accessTokenRef.current = response.access_token
          createPicker(pickerTypeRef.current, response.access_token)
        }
      },
    })

    tokenClientRef.current.requestAccessToken()
  }, [createPicker])

  return {
    openPicker,
    isLoading,
    error,
  }
}
