/**
 * 協力学習セッション管理
 * WebRTC + Socket.IOベースのリアルタイム協力システム
 */

import { io } from 'socket.io-client'
import { ref, reactive } from 'vue'

export class CollaborativeSession {
  constructor() {
    this.socket = null
    this.localStream = null
    this.remoteStream = null
    this.peerConnection = null
    this.dataChannel = null
    
    // セッション状態
    this.sessionState = reactive({
      isConnected: false,
      sessionId: null,
      role: null, // 'teacher' | 'student'
      participants: [],
      currentGame: null,
      sharedData: {}
    })
    
    // 設定
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // TURN server (本番では必要)
      ]
    }
  }

  /**
   * セッション初期化
   */
  async initialize(serverUrl = 'ws://localhost:3001') {
    try {
      // Socket.IO接続
      this.socket = io(serverUrl, {
        transports: ['websocket'],
        upgrade: true
      })
      
      this.setupSocketEvents()
      console.log('📡 Collaborative session initialized')
      
    } catch (error) {
      console.error('Failed to initialize collaborative session:', error)
      throw error
    }
  }

  /**
   * Socket.IOイベント設定
   */
  setupSocketEvents() {
    // 接続確立
    this.socket.on('connect', () => {
      console.log('🔗 Connected to collaboration server')
      this.sessionState.isConnected = true
    })

    // セッション作成成功
    this.socket.on('session-created', (sessionData) => {
      this.sessionState.sessionId = sessionData.sessionId
      this.sessionState.role = sessionData.role
      console.log(`👨‍🏫 Session created: ${sessionData.sessionId}`)
    })

    // セッション参加成功
    this.socket.on('session-joined', (sessionData) => {
      this.sessionState.sessionId = sessionData.sessionId
      this.sessionState.role = sessionData.role
      this.sessionState.participants = sessionData.participants
      console.log(`🎓 Joined session: ${sessionData.sessionId}`)
    })

    // 新しい参加者
    this.socket.on('participant-joined', (participant) => {
      this.sessionState.participants.push(participant)
      console.log(`👋 New participant: ${participant.name}`)
    })

    // WebRTCシグナリング
    this.socket.on('webrtc-offer', this.handleWebRTCOffer.bind(this))
    this.socket.on('webrtc-answer', this.handleWebRTCAnswer.bind(this))
    this.socket.on('webrtc-ice-candidate', this.handleICECandidate.bind(this))

    // ゲーム状態同期
    this.socket.on('game-state-sync', (gameState) => {
      this.sessionState.currentGame = gameState
      this.onGameStateReceived?.(gameState)
    })

    // リアルタイム操作
    this.socket.on('real-time-action', (action) => {
      this.onRealtimeAction?.(action)
    })

    // 講師からの指導
    this.socket.on('teacher-guidance', (guidance) => {
      this.onTeacherGuidance?.(guidance)
    })

    // エラーハンドリング
    this.socket.on('error', (error) => {
      console.error('📡 Session error:', error)
    })
  }

  /**
   * 講師セッション開始
   */
  async createTeacherSession(teacherInfo) {
    return new Promise((resolve, reject) => {
      // タイムアウト設定（10秒）
      const timeout = setTimeout(() => {
        reject(new Error('セッション作成がタイムアウトしました。WebSocketサーバーに接続できているか確認してください。'))
      }, 10000)

      this.socket.emit('create-session', {
        role: 'teacher',
        teacherInfo,
        sessionConfig: {
          maxStudents: 4,
          allowScreenShare: true,
          allowVoiceChat: true,
          gameMode: 'cooperative'
        }
      })

      this.socket.once('session-created', (sessionData) => {
        clearTimeout(timeout)
        resolve({
          sessionId: sessionData.sessionId,
          inviteCode: sessionData.inviteCode,
          inviteLink: `${window.location.origin}/join-session/${sessionData.inviteCode}`
        })
      })

      this.socket.once('error', (error) => {
        clearTimeout(timeout)
        reject(error)
      })
    })
  }

  /**
   * 生徒セッション参加
   */
  async joinStudentSession(inviteCode, studentInfo) {
    return new Promise((resolve, reject) => {
      // タイムアウト設定（10秒）
      const timeout = setTimeout(() => {
        reject(new Error('セッション参加がタイムアウトしました。招待コードが正しいか、セッションが開始されているか確認してください。'))
      }, 10000)

      this.socket.emit('join-session', {
        inviteCode,
        role: 'student',
        studentInfo
      })

      this.socket.once('session-joined', (data) => {
        clearTimeout(timeout)
        resolve(data)
      })
      
      this.socket.once('error', (error) => {
        clearTimeout(timeout)
        reject(error)
      })
    })
  }

  /**
   * 画面共有開始（生徒→講師）
   */
  async startScreenShare() {
    try {
      if (this.sessionState.role !== 'student') {
        throw new Error('画面共有は生徒のみ利用可能です')
      }

      // 画面キャプチャストリーム取得
      this.localStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      })

      // WebRTC接続の設定
      await this.setupWebRTCConnection()
      
      console.log('🖥️ Screen sharing started')
      
    } catch (error) {
      console.error('Failed to start screen sharing:', error)
      throw error
    }
  }

  /**
   * WebRTC接続設定
   */
  async setupWebRTCConnection() {
    this.peerConnection = new RTCPeerConnection(this.config)
    
    // ローカルストリーム追加
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })
    }

    // データチャンネル設定（ゲーム操作用）
    this.dataChannel = this.peerConnection.createDataChannel('gameData', {
      ordered: true
    })
    
    this.dataChannel.onopen = () => {
      console.log('📊 Data channel opened')
    }
    
    this.dataChannel.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.onDataChannelMessage?.(data)
    }

    // ICE候補処理
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('webrtc-ice-candidate', {
          sessionId: this.sessionState.sessionId,
          candidate: event.candidate
        })
      }
    }

    // リモートストリーム受信
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0]
      this.onRemoteStreamReceived?.(this.remoteStream)
    }

    // オファー作成・送信
    if (this.sessionState.role === 'student') {
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)
      
      this.socket.emit('webrtc-offer', {
        sessionId: this.sessionState.sessionId,
        offer: offer
      })
    }
  }

  /**
   * WebRTCオファー処理（講師側）
   */
  async handleWebRTCOffer(data) {
    if (this.sessionState.role !== 'teacher') return

    this.peerConnection = new RTCPeerConnection(this.config)
    
    // ICE候補処理
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('webrtc-ice-candidate', {
          sessionId: this.sessionState.sessionId,
          candidate: event.candidate
        })
      }
    }

    // リモートストリーム受信（生徒の画面）
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0]
      this.onRemoteStreamReceived?.(this.remoteStream)
      console.log('📺 Student screen received')
    }

    // データチャンネル受信
    this.peerConnection.ondatachannel = (event) => {
      const channel = event.channel
      channel.onmessage = (event) => {
        const data = JSON.parse(event.data)
        this.onDataChannelMessage?.(data)
      }
    }

    await this.peerConnection.setRemoteDescription(data.offer)
    
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    
    this.socket.emit('webrtc-answer', {
      sessionId: this.sessionState.sessionId,
      answer: answer
    })
  }

  /**
   * WebRTCアンサー処理（生徒側）
   */
  async handleWebRTCAnswer(data) {
    if (this.sessionState.role !== 'student') return
    await this.peerConnection.setRemoteDescription(data.answer)
  }

  /**
   * ICE候補処理
   */
  async handleICECandidate(data) {
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(data.candidate)
    }
  }

  /**
   * ゲーム状態をリアルタイム同期
   */
  syncGameState(gameState) {
    if (this.sessionState.role === 'student') {
      this.socket.emit('game-state-sync', {
        sessionId: this.sessionState.sessionId,
        gameState: {
          currentGame: gameState.gameType,
          level: gameState.level,
          score: gameState.score,
          progress: gameState.progress,
          currentQuestion: gameState.currentQuestion,
          studentResponse: gameState.studentResponse,
          timestamp: Date.now()
        }
      })
    }
  }

  /**
   * 講師からの指導送信
   */
  sendTeacherGuidance(guidanceType, data) {
    if (this.sessionState.role === 'teacher') {
      this.socket.emit('teacher-guidance', {
        sessionId: this.sessionState.sessionId,
        type: guidanceType, // 'hint', 'correction', 'encouragement', 'annotation'
        data,
        timestamp: Date.now()
      })
    }
  }

  /**
   * 画面注釈（講師→生徒）
   */
  sendScreenAnnotation(annotation) {
    if (this.sessionState.role === 'teacher') {
      this.sendTeacherGuidance('annotation', {
        type: annotation.type, // 'highlight', 'arrow', 'circle', 'text'
        position: annotation.position,
        content: annotation.content,
        duration: annotation.duration || 5000
      })
    }
  }

  /**
   * セッション終了
   */
  endSession() {
    // ストリーム停止
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
    }
    
    // WebRTC接続クローズ
    if (this.peerConnection) {
      this.peerConnection.close()
    }
    
    // Socket接続切断
    if (this.socket) {
      this.socket.emit('leave-session', {
        sessionId: this.sessionState.sessionId
      })
      this.socket.disconnect()
    }
    
    // 状態リセット
    this.sessionState.isConnected = false
    this.sessionState.sessionId = null
    this.sessionState.participants = []
    
    console.log('👋 Session ended')
  }

  // コールバック関数（外部で設定）
  onRemoteStreamReceived = null
  onGameStateReceived = null
  onRealtimeAction = null
  onTeacherGuidance = null
  onDataChannelMessage = null
}

// グローバルインスタンス
export const collaborativeSession = new CollaborativeSession()