/**
 * ローカルストレージを使用したデータ永続化サービス
 * デモモードでも実データのように扱えるようにする
 */

const STORAGE_PREFIX = 'spogli_coach_'

export class LocalStorageService {
  /**
   * データを取得
   */
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null

    try {
      const item = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  }

  /**
   * データを保存
   */
  static set<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') return false

    try {
      window.localStorage.setItem(
        `${STORAGE_PREFIX}${key}`,
        JSON.stringify(value)
      )
      return true
    } catch (error) {
      console.error('Error writing to localStorage:', error)
      return false
    }
  }

  /**
   * データを削除
   */
  static remove(key: string): boolean {
    if (typeof window === 'undefined') return false

    try {
      window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
      return true
    } catch (error) {
      console.error('Error removing from localStorage:', error)
      return false
    }
  }

  /**
   * 初回起動かどうかをチェック
   */
  static isFirstTime(key: string): boolean {
    if (typeof window === 'undefined') return true

    const initialized = window.localStorage.getItem(`${STORAGE_PREFIX}${key}_initialized`)
    return !initialized
  }

  /**
   * 初期化済みフラグを設定
   */
  static setInitialized(key: string): void {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(`${STORAGE_PREFIX}${key}_initialized`, 'true')
  }

  /**
   * 全データをクリア（開発用）
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return

    const keys = Object.keys(window.localStorage)
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        window.localStorage.removeItem(key)
      }
    })
  }
}

/**
 * データマージ用のヘルパー関数
 * 既存データとシードデータをマージ
 */
export function mergeWithSeedData<T extends { id: string }>(
  existingData: T[] | null,
  seedData: T[]
): T[] {
  if (!existingData || existingData.length === 0) {
    return seedData
  }

  // 既存データのIDセットを作成
  const existingIds = new Set(existingData.map(item => item.id))

  // シードデータから重複しないものだけを追加
  const newSeedData = seedData.filter(item => !existingIds.has(item.id))

  return [...existingData, ...newSeedData]
}

/**
 * データの初期化
 * 初回起動時にシードデータを投入
 */
export function initializeData<T extends { id: string }>(
  storageKey: string,
  seedData: T[]
): T[] {
  // 既存データを取得
  const existingData = LocalStorageService.get<T[]>(storageKey)

  // データが存在しない場合はシードデータで初期化
  if (!existingData || existingData.length === 0) {
    // 初回起動フラグの確認
    if (LocalStorageService.isFirstTime(storageKey)) {
      LocalStorageService.set(storageKey, seedData)
      LocalStorageService.setInitialized(storageKey)
      return seedData
    }
    // 既に初期化済みでデータが空の場合は空配列を返す
    return []
  }

  // 既存データがある場合はそれを返す
  return existingData
}

/**
 * デモモードかどうかを判定
 * Supabaseが設定されていない場合はローカルストレージモード
 */
export function isLocalStorageMode(): boolean {
  if (typeof window === 'undefined') return true

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !supabaseUrl ||
         supabaseUrl.includes('your-project') ||
         supabaseUrl === ''
}