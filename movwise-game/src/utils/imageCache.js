class ImageCache {
  constructor(maxSize = 50) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.accessCount = new Map()
  }

  // 画像のキャッシュ
  async cacheImage(url) {
    if (this.cache.has(url)) {
      this.accessCount.set(url, (this.accessCount.get(url) || 0) + 1)
      return this.cache.get(url)
    }

    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)

      // キャッシュサイズの管理
      if (this.cache.size >= this.maxSize) {
        this.removeLeastAccessed()
      }

      this.cache.set(url, objectUrl)
      this.accessCount.set(url, 1)
      return objectUrl
    } catch (error) {
      console.error('画像のキャッシュに失敗しました:', error)
      return url
    }
  }

  // 最もアクセスが少ない画像を削除
  removeLeastAccessed() {
    let minAccess = Infinity
    let leastAccessedUrl = null

    for (const [url, count] of this.accessCount) {
      if (count < minAccess) {
        minAccess = count
        leastAccessedUrl = url
      }
    }

    if (leastAccessedUrl) {
      URL.revokeObjectURL(this.cache.get(leastAccessedUrl))
      this.cache.delete(leastAccessedUrl)
      this.accessCount.delete(leastAccessedUrl)
    }
  }

  // キャッシュのクリア
  clear() {
    for (const objectUrl of this.cache.values()) {
      URL.revokeObjectURL(objectUrl)
    }
    this.cache.clear()
    this.accessCount.clear()
  }

  // 特定のURLのキャッシュを削除
  remove(url) {
    if (this.cache.has(url)) {
      URL.revokeObjectURL(this.cache.get(url))
      this.cache.delete(url)
      this.accessCount.delete(url)
    }
  }
}

export const imageCache = new ImageCache() 