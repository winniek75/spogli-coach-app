/**
 * MovWISE Deployment Configuration
 * 本番環境とデプロイ設定
 */

// 環境設定
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production'
}

// 現在の環境を判定
export const getCurrentEnvironment = () => {
  if (import.meta.env.NODE_ENV === 'production') {
    if (window.location.hostname === 'staging.movwise.com') {
      return ENVIRONMENT.STAGING
    }
    return ENVIRONMENT.PRODUCTION
  }
  return ENVIRONMENT.DEVELOPMENT
}

// 環境別設定
export const CONFIG = {
  [ENVIRONMENT.DEVELOPMENT]: {
    API_BASE_URL: 'http://localhost:3000/api',
    FIREBASE_CONFIG: {
      apiKey: "AIzaSyDevelopmentKey123456789",
      authDomain: "movwise-dev.firebaseapp.com",
      projectId: "movwise-dev",
      storageBucket: "movwise-dev.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:development123",
      databaseURL: "https://movwise-dev-default-rtdb.firebaseio.com/"
    },
    DEBUG: true,
    LOG_LEVEL: 'debug',
    ANALYTICS_ENABLED: false,
    ERROR_REPORTING_ENABLED: false
  },
  
  [ENVIRONMENT.STAGING]: {
    API_BASE_URL: 'https://staging-api.movwise.com/api',
    FIREBASE_CONFIG: {
      apiKey: "AIzaSyStagingKey123456789",
      authDomain: "movwise-staging.firebaseapp.com", 
      projectId: "movwise-staging",
      storageBucket: "movwise-staging.appspot.com",
      messagingSenderId: "987654321",
      appId: "1:987654321:web:staging123",
      databaseURL: "https://movwise-staging-default-rtdb.firebaseio.com/"
    },
    DEBUG: true,
    LOG_LEVEL: 'info',
    ANALYTICS_ENABLED: true,
    ERROR_REPORTING_ENABLED: true
  },
  
  [ENVIRONMENT.PRODUCTION]: {
    API_BASE_URL: 'https://api.movwise.com/api',
    FIREBASE_CONFIG: {
      apiKey: "AIzaSyProductionKey123456789",
      authDomain: "movwise-prod.firebaseapp.com",
      projectId: "movwise-prod", 
      storageBucket: "movwise-prod.appspot.com",
      messagingSenderId: "456789123",
      appId: "1:456789123:web:production123",
      databaseURL: "https://movwise-prod-default-rtdb.firebaseio.com/"
    },
    DEBUG: false,
    LOG_LEVEL: 'error',
    ANALYTICS_ENABLED: true,
    ERROR_REPORTING_ENABLED: true
  }
}

// 現在の設定を取得
export const getConfig = () => {
  const environment = getCurrentEnvironment()
  return CONFIG[environment]
}

// デプロイ情報
export const DEPLOYMENT_INFO = {
  VERSION: '1.0.0',
  BUILD_TIME: new Date().toISOString(),
  COMMIT_HASH: process.env.VITE_COMMIT_HASH || 'unknown',
  BRANCH: process.env.VITE_BRANCH || 'main'
}

// Firebase セキュリティルール
export const FIREBASE_SECURITY_RULES = {
  firestore: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // セッションは認証されたユーザーのみ
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // ゲームデータは講師または参加者のみ
    match /games/{gameId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'teacher' || 
         request.auth.uid in resource.data.participants);
    }
    
    // 緊急通話は認証されたユーザーのみ
    match /emergency_calls/{callId} {
      allow read, write: if request.auth != null;
    }
    
    // 分析データは講師のみ書き込み可能
    match /analytics/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role == 'teacher';
    }
    
    // フィードバックは認証されたユーザーのみ
    match /feedback/{feedbackId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}`,
  
  realtimeDatabase: `{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "sessions": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null && (auth.uid === newData.child('hostId').val() || 
                  newData.child('participants').hasChild(auth.uid))"
      }
    },
    "games": {
      "$gameId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "emergency_calls": {
      "$callId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}`
}

// パフォーマンス目標値
export const PERFORMANCE_TARGETS = {
  // Core Web Vitals
  FCP: 1800, // First Contentful Paint (ms)
  LCP: 2500, // Largest Contentful Paint (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  FID: 100,  // First Input Delay (ms)
  TTI: 3800, // Time to Interactive (ms)
  
  // Additional metrics
  CONNECTION_SUCCESS_RATE: 95, // 95%以上
  RESPONSE_TIME: 200,          // 200ms以内
  SESSION_STABILITY: 95,       // 切断率5%以下
  MAX_CONCURRENT_SESSIONS: 100 // 100セッション対応
}

// セキュリティ設定
export const SECURITY_CONFIG = {
  CSP: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "https://apis.google.com", "https://www.gstatic.com"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    'font-src': ["'self'", "https://fonts.gstatic.com"],
    'img-src': ["'self'", "data:", "https:"],
    'connect-src': ["'self'", "https://*.firebaseapp.com", "https://*.firebaseio.com", "https://identitytoolkit.googleapis.com"],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  },
  
  HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }
}

// CDN設定
export const CDN_CONFIG = {
  STATIC_ASSETS: {
    domain: 'cdn.movwise.com',
    paths: ['/css', '/js', '/images', '/sounds', '/icons'],
    maxAge: 31536000, // 1年
    compression: true
  },
  
  DYNAMIC_CONTENT: {
    domain: 'api.movwise.com',
    paths: ['/api'],
    maxAge: 3600, // 1時間
    compression: true
  }
}

// モニタリング設定
export const MONITORING_CONFIG = {
  ERROR_REPORTING: {
    enabled: getConfig().ERROR_REPORTING_ENABLED,
    sampleRate: 1.0,
    ignoredErrors: [
      'Script error.',
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded'
    ]
  },
  
  ANALYTICS: {
    enabled: getConfig().ANALYTICS_ENABLED,
    trackingId: process.env.VITE_GA_TRACKING_ID,
    sampleRate: 100,
    anonymizeIp: true
  },
  
  PERFORMANCE: {
    enabled: true,
    sampleRate: 10, // 10%のトラフィックを監視
    thresholds: PERFORMANCE_TARGETS
  }
}

// βテスト設定
export const BETA_TEST_CONFIG = {
  ENABLED: process.env.VITE_BETA_TEST === 'true',
  MAX_TEACHERS: 10,
  MAX_STUDENTS: 30,
  TEST_DURATION_DAYS: 14,
  FEEDBACK_COLLECTION: {
    enabled: true,
    surveyUrl: 'https://forms.gle/movwise-beta-feedback',
    reminderInterval: 3, // 3日ごと
    exitSurveyUrl: 'https://forms.gle/movwise-beta-exit'
  },
  FEATURE_FLAGS: {
    cooperativeGames: true,
    teacherDashboard: true,
    emergencyCalls: true,
    offlineMode: true,
    advancedAnalytics: false // βテストでは無効
  }
}

// 収益化設定
export const MONETIZATION_CONFIG = {
  PRICING_TIERS: {
    FREE: {
      name: 'フリープラン',
      price: 0,
      sessionsPerMonth: 10,
      studentsPerSession: 5,
      features: ['基本ゲーム', '基本レポート']
    },
    BASIC: {
      name: 'ベーシックプラン',
      price: 980, // 月額
      sessionsPerMonth: 50,
      studentsPerSession: 15,
      features: ['全ゲーム', '詳細レポート', '協力学習', '緊急通話']
    },
    PREMIUM: {
      name: 'プレミアムプラン',
      price: 1980, // 月額
      sessionsPerMonth: -1, // 無制限
      studentsPerSession: 30,
      features: ['全機能', 'カスタマイズ', 'API アクセス', '優先サポート']
    }
  },
  
  TARGETS: {
    TEACHER_REGISTRATIONS: 50, // 初月
    MONTHLY_SESSIONS: 500,     // 月間
    CONVERSION_RATE: 12,       // 12%以上
    COMPLETION_RATE: 80        // 80%以上
  }
}

// デプロイメント手順
export const DEPLOYMENT_STEPS = {
  PRE_DEPLOYMENT: [
    'セキュリティスキャンの実行',
    'パフォーマンステストの実行',
    'Firebase設定の確認',
    '環境変数の設定',
    'CDN設定の確認'
  ],
  
  DEPLOYMENT: [
    'ビルドの作成',
    'ファイルの圧縮',
    'CDNへのアップロード',
    'Firebase Hostingへのデプロイ',
    'DNS設定の更新'
  ],
  
  POST_DEPLOYMENT: [
    'ヘルスチェックの実行',
    'パフォーマンス監視の開始',
    'エラー監視の開始',
    'ユーザー通知の送信',
    'ドキュメントの更新'
  ]
}

// 初期データ投入設定
export const INITIAL_DATA_CONFIG = {
  SAMPLE_TEACHERS: [
    {
      id: 'teacher_001',
      name: '田中先生',
      email: 'tanaka@example.com',
      school: 'さくら小学校',
      grade: '3年生',
      subjects: ['国語', '英語']
    },
    {
      id: 'teacher_002', 
      name: '佐藤先生',
      email: 'sato@example.com',
      school: 'ひまわり小学校',
      grade: '4年生',
      subjects: ['英語', '算数']
    }
  ],
  
  SAMPLE_GAMES: [
    {
      id: 'sound_radar_001',
      name: 'Sound Radar Command',
      type: 'cooperative',
      difficulty: 'beginner',
      duration: 15,
      maxPlayers: 4
    },
    {
      id: 'grammar_spacecraft_001',
      name: 'Grammar Construction Spacecraft',
      type: 'cooperative',
      difficulty: 'intermediate',
      duration: 20,
      maxPlayers: 6
    }
  ],
  
  SAMPLE_CONTENT: [
    {
      category: 'phonics',
      level: 1,
      items: ['a', 'b', 'c', 'd', 'e']
    },
    {
      category: 'sight_words',
      level: 1,
      items: ['the', 'and', 'to', 'a', 'in']
    }
  ]
}

// ログ設定
export const LOGGING_CONFIG = {
  LEVELS: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  },
  
  TRANSPORTS: {
    CONSOLE: {
      enabled: true,
      level: getConfig().LOG_LEVEL
    },
    
    REMOTE: {
      enabled: getConfig().ERROR_REPORTING_ENABLED,
      endpoint: '/api/logs',
      level: 'error',
      batchSize: 10,
      flushInterval: 5000
    }
  }
}

// エクスポート用のメイン設定オブジェクト
export const DEPLOYMENT_CONFIG = {
  environment: getCurrentEnvironment(),
  config: getConfig(),
  deployment: DEPLOYMENT_INFO,
  firebase: FIREBASE_SECURITY_RULES,
  performance: PERFORMANCE_TARGETS,
  security: SECURITY_CONFIG,
  cdn: CDN_CONFIG,
  monitoring: MONITORING_CONFIG,
  betaTest: BETA_TEST_CONFIG,
  monetization: MONETIZATION_CONFIG,
  steps: DEPLOYMENT_STEPS,
  initialData: INITIAL_DATA_CONFIG,
  logging: LOGGING_CONFIG
}

export default DEPLOYMENT_CONFIG