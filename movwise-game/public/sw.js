/**
 * MovWISE Service Worker
 * PWA機能とオフライン対応
 */

const CACHE_NAME = 'movwise-v1.0.0'
const CACHE_STATIC_NAME = 'movwise-static-v1.0.0'
const CACHE_DYNAMIC_NAME = 'movwise-dynamic-v1.0.0'

// キャッシュするリソース
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/sounds/ui/click.mp3',
  '/sounds/ui/hover.mp3',
  '/sounds/game/correct.mp3',
  '/sounds/game/incorrect.mp3'
]

// キャッシュ戦略
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
}

// リソース別キャッシュ戦略
const RESOURCE_STRATEGIES = {
  '/css/': CACHE_STRATEGIES.CACHE_FIRST,
  '/js/': CACHE_STRATEGIES.CACHE_FIRST,
  '/images/': CACHE_STRATEGIES.CACHE_FIRST,
  '/sounds/': CACHE_STRATEGIES.CACHE_FIRST,
  '/api/': CACHE_STRATEGIES.NETWORK_FIRST,
  '.html': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  'firebaseapp.com': CACHE_STRATEGIES.NETWORK_ONLY,
  'firebaseio.com': CACHE_STRATEGIES.NETWORK_ONLY
}

// Service Worker インストール
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Service Worker: Static assets cached')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('❌ Service Worker: Installation failed', error)
      })
  )
})

// Service Worker アクティベーション
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_STATIC_NAME && 
                cacheName !== CACHE_DYNAMIC_NAME &&
                cacheName.startsWith('movwise-')) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker: Activated')
        return self.clients.claim()
      })
  )
})

// フェッチイベント
self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)
  
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    return
  }
  
  if (request.method !== 'GET') {
    return
  }
  
  const strategy = determineStrategy(request)
  event.respondWith(handleFetchWithStrategy(request, strategy))
})

function determineStrategy(request) {
  const url = request.url
  
  if (url.includes('firebaseapp.com') || url.includes('firebaseio.com')) {
    return CACHE_STRATEGIES.NETWORK_ONLY
  }
  
  if (url.includes('/api/')) {
    return CACHE_STRATEGIES.NETWORK_FIRST
  }
  
  for (const [pattern, strategy] of Object.entries(RESOURCE_STRATEGIES)) {
    if (url.includes(pattern)) {
      return strategy
    }
  }
  
  return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE
}

async function handleFetchWithStrategy(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return handleCacheFirst(request)
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return handleNetworkFirst(request)
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return handleStaleWhileRevalidate(request)
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request)
    default:
      return handleStaleWhileRevalidate(request)
  }
}

async function handleCacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_DYNAMIC_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Cache First strategy failed:', error)
    return new Response('Network error', { status: 408 })
  }
}

async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_DYNAMIC_NAME)
      cache.put(request, networkResponse.clone())
      return networkResponse
    } else {
      const cachedResponse = await caches.match(request)
      return cachedResponse || networkResponse
    }
  } catch (error) {
    const cachedResponse = await caches.match(request)
    return cachedResponse || createOfflineFallback(request)
  }
}

async function handleStaleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request)
  
  const networkPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        const cache = caches.open(CACHE_DYNAMIC_NAME)
        cache.then(c => c.put(request, response.clone()))
      }
      return response
    })
    .catch(() => {})
  
  return cachedResponse || networkPromise
}

function createOfflineFallback(request) {
  if (request.headers.get('accept').includes('text/html')) {
    return new Response(`
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MovWISE - オフライン</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .container {
            max-width: 500px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
          .icon { font-size: 4rem; margin-bottom: 20px; }
          h1 { margin: 0 0 20px 0; font-size: 2rem; }
          p { margin: 0 0 30px 0; font-size: 1.1rem; line-height: 1.6; }
          .button {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid white;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
          }
          .button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🛸</div>
          <h1>オフラインモード</h1>
          <p>現在、インターネット接続がありません。<br>MovWISEはオフラインでも一部機能をご利用いただけます。</p>
          <a href="/" class="button">ホームに戻る</a>
        </div>
        <script>
          window.addEventListener('online', () => {
            window.location.reload();
          });
        </script>
      </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }
  
  return new Response('Offline', { status: 503 })
}

console.log('🚀 MovWISE Service Worker loaded') 