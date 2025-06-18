/**
 * 協力学習WebSocketサーバー
 * Socket.IO + WebRTCシグナリングサーバー
 */

const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')

const app = express()
const server = http.createServer(app)

// CORS設定
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
  credentials: true
}))

app.use(express.json())

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
    methods: ["GET", "POST"],
    credentials: true
  }
})

// === セッション管理 ===
const activeSessions = new Map()
const userSockets = new Map()

class CollaborativeSessionServer {
  constructor(sessionId, teacherInfo) {
    this.sessionId = sessionId
    this.inviteCode = this.generateInviteCode()
    this.createdAt = new Date()
    this.teacher = {
      ...teacherInfo,
      socketId: null,
      connected: false
    }
    this.students = new Map()
    this.gameState = null
    this.maxStudents = teacherInfo.sessionConfig?.maxStudents || 4
    this.isActive = true
  }

  generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  addStudent(studentInfo, socketId) {
    if (this.students.size >= this.maxStudents) {
      throw new Error('セッションの最大人数に達しています')
    }

    const studentId = `student-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`
    this.students.set(studentId, {
      id: studentId,
      ...studentInfo,
      socketId,
      joinedAt: new Date(),
      connected: true
    })

    return studentId
  }

  removeStudent(studentId) {
    return this.students.delete(studentId)
  }

  setTeacherSocket(socketId) {
    this.teacher.socketId = socketId
    this.teacher.connected = true
  }

  disconnectTeacher() {
    this.teacher.connected = false
    this.teacher.socketId = null
  }

  disconnectStudent(studentId) {
    const student = this.students.get(studentId)
    if (student) {
      student.connected = false
    }
  }

  getParticipants() {
    return {
      teacher: this.teacher,
      students: Array.from(this.students.values())
    }
  }

  updateGameState(gameState) {
    this.gameState = {
      ...gameState,
      updatedAt: new Date()
    }
  }
}

// === Socket.IO イベントハンドリング ===
io.on('connection', (socket) => {
  console.log(`📡 Client connected: ${socket.id}`)

  // セッション作成（講師）
  socket.on('create-session', (data) => {
    try {
      console.log('📝 Creating session for teacher:', data.teacherInfo)

      const sessionId = `session-${Date.now()}`
      const session = new CollaborativeSessionServer(sessionId, data.teacherInfo)
      session.setTeacherSocket(socket.id)

      activeSessions.set(sessionId, session)
      userSockets.set(socket.id, { sessionId, role: 'teacher' })

      // 講師をルームに参加
      socket.join(sessionId)

      console.log(`👨‍🏫 Session created: ${sessionId}, invite code: ${session.inviteCode}`)

      socket.emit('session-created', {
        sessionId,
        inviteCode: session.inviteCode,
        role: 'teacher',
        participants: session.getParticipants()
      })

    } catch (error) {
      console.error('❌ Error creating session:', error)
      socket.emit('error', { message: 'セッションの作成に失敗しました', error: error.message })
    }
  })

  // セッション参加（生徒）
  socket.on('join-session', (data) => {
    try {
      console.log('🎓 Student joining session:', data)

      const session = Array.from(activeSessions.values())
        .find(s => s.inviteCode === data.inviteCode)

      if (!session) {
        throw new Error('セッションが見つかりません')
      }

      if (!session.isActive) {
        throw new Error('セッションは終了しています')
      }

      const studentId = session.addStudent(data.studentInfo, socket.id)
      userSockets.set(socket.id, { sessionId: session.sessionId, role: 'student', studentId })

      // 生徒をルームに参加
      socket.join(session.sessionId)

      console.log(`👋 Student joined: ${studentId} to session ${session.sessionId}`)

      // 生徒に参加成功を通知
      socket.emit('session-joined', {
        sessionId: session.sessionId,
        studentId,
        role: 'student',
        participants: session.getParticipants()
      })

      // 講師と他の生徒に新しい参加者を通知
      socket.to(session.sessionId).emit('participant-joined', {
        id: studentId,
        name: data.studentInfo.name,
        role: 'student',
        joinedAt: new Date()
      })

    } catch (error) {
      console.error('❌ Error joining session:', error)
      socket.emit('error', { message: 'セッションへの参加に失敗しました', error: error.message })
    }
  })

  // WebRTCシグナリング: オファー
  socket.on('webrtc-offer', (data) => {
    try {
      console.log('🔄 WebRTC offer received from:', socket.id)
      const session = activeSessions.get(data.sessionId)
      if (!session) {
        throw new Error('セッションが見つかりません')
      }

      // 講師にオファーを転送
      if (session.teacher.socketId && session.teacher.socketId !== socket.id) {
        io.to(session.teacher.socketId).emit('webrtc-offer', {
          offer: data.offer,
          from: socket.id
        })
      }

    } catch (error) {
      console.error('❌ Error handling WebRTC offer:', error)
      socket.emit('error', { message: 'WebRTCオファーの処理に失敗しました' })
    }
  })

  // WebRTCシグナリング: アンサー
  socket.on('webrtc-answer', (data) => {
    try {
      console.log('🔄 WebRTC answer received from:', socket.id)
      const session = activeSessions.get(data.sessionId)
      if (!session) {
        throw new Error('セッションが見つかりません')
      }

      // 生徒にアンサーを転送
      socket.to(data.sessionId).emit('webrtc-answer', {
        answer: data.answer,
        from: socket.id
      })

    } catch (error) {
      console.error('❌ Error handling WebRTC answer:', error)
      socket.emit('error', { message: 'WebRTCアンサーの処理に失敗しました' })
    }
  })

  // WebRTCシグナリング: ICE候補
  socket.on('webrtc-ice-candidate', (data) => {
    try {
      const session = activeSessions.get(data.sessionId)
      if (!session) {
        throw new Error('セッションが見つかりません')
      }

      // 他の参加者にICE候補を転送
      socket.to(data.sessionId).emit('webrtc-ice-candidate', {
        candidate: data.candidate,
        from: socket.id
      })

    } catch (error) {
      console.error('❌ Error handling ICE candidate:', error)
    }
  })

  // ゲーム状態同期
  socket.on('game-state-sync', (data) => {
    try {
      const session = activeSessions.get(data.sessionId)
      if (!session) {
        throw new Error('セッションが見つかりません')
      }

      session.updateGameState(data.gameState)

      // 講師にゲーム状態を送信
      if (session.teacher.socketId && session.teacher.socketId !== socket.id) {
        io.to(session.teacher.socketId).emit('game-state-sync', {
          gameState: data.gameState,
          from: socket.id
        })
      }

      console.log('🎮 Game state synced for session:', data.sessionId)

    } catch (error) {
      console.error('❌ Error syncing game state:', error)
    }
  })

  // 講師からの指導
  socket.on('teacher-guidance', (data) => {
    try {
      const session = activeSessions.get(data.sessionId)
      if (!session) {
        throw new Error('セッションが見つかりません')
      }

      // 生徒たちに指導を送信
      socket.to(data.sessionId).emit('teacher-guidance', {
        type: data.type,
        data: data.data,
        timestamp: data.timestamp,
        from: 'teacher'
      })

      console.log('🎓 Teacher guidance sent:', { type: data.type, sessionId: data.sessionId })

    } catch (error) {
      console.error('❌ Error sending teacher guidance:', error)
    }
  })

  // リアルタイム操作
  socket.on('real-time-action', (data) => {
    try {
      const userInfo = userSockets.get(socket.id)
      if (!userInfo) return

      const session = activeSessions.get(userInfo.sessionId)
      if (!session) return

      // 他の参加者に操作を転送
      socket.to(userInfo.sessionId).emit('real-time-action', {
        action: data.action,
        data: data.data,
        from: userInfo.role,
        timestamp: Date.now()
      })

    } catch (error) {
      console.error('❌ Error handling real-time action:', error)
    }
  })

  // セッション退出
  socket.on('leave-session', (data) => {
    try {
      const session = activeSessions.get(data.sessionId)
      if (!session) return

      const userInfo = userSockets.get(socket.id)
      if (!userInfo) return

      if (userInfo.role === 'teacher') {
        // 講師が退出した場合、セッションを終了
        session.isActive = false
        socket.to(data.sessionId).emit('session-ended', {
          reason: 'teacher-left',
          message: '講師がセッションを終了しました'
        })
        console.log(`👨‍🏫 Teacher left session: ${data.sessionId}`)
      } else if (userInfo.role === 'student') {
        // 生徒が退出
        session.removeStudent(userInfo.studentId)
        socket.to(data.sessionId).emit('participant-left', {
          id: userInfo.studentId,
          role: 'student'
        })
        console.log(`🎓 Student left session: ${userInfo.studentId}`)
      }

      socket.leave(data.sessionId)
      userSockets.delete(socket.id)

    } catch (error) {
      console.error('❌ Error leaving session:', error)
    }
  })

  // 接続切断時の処理
  socket.on('disconnect', () => {
    console.log(`📡 Client disconnected: ${socket.id}`)

    try {
      const userInfo = userSockets.get(socket.id)
      if (!userInfo) return

      const session = activeSessions.get(userInfo.sessionId)
      if (!session) return

      if (userInfo.role === 'teacher') {
        session.disconnectTeacher()
        // 講師の一時的な切断を生徒に通知
        socket.to(userInfo.sessionId).emit('teacher-disconnected', {
          message: '講師が一時的に切断されました'
        })
      } else if (userInfo.role === 'student') {
        session.disconnectStudent(userInfo.studentId)
        socket.to(userInfo.sessionId).emit('student-disconnected', {
          studentId: userInfo.studentId,
          message: '生徒が切断されました'
        })
      }

      userSockets.delete(socket.id)

    } catch (error) {
      console.error('❌ Error handling disconnect:', error)
    }
  })
})

// === セッション管理API ===
app.get('/api/sessions', (req, res) => {
  try {
    const sessionsList = Array.from(activeSessions.values()).map(session => ({
      sessionId: session.sessionId,
      inviteCode: session.inviteCode,
      teacherName: session.teacher.name,
      studentCount: session.students.size,
      maxStudents: session.maxStudents,
      isActive: session.isActive,
      createdAt: session.createdAt
    }))

    res.json({ sessions: sessionsList })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/sessions/:sessionId', (req, res) => {
  try {
    const session = activeSessions.get(req.params.sessionId)
    if (!session) {
      return res.status(404).json({ error: 'セッションが見つかりません' })
    }

    res.json({
      sessionId: session.sessionId,
      inviteCode: session.inviteCode,
      participants: session.getParticipants(),
      gameState: session.gameState,
      isActive: session.isActive,
      createdAt: session.createdAt
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// === 定期的なクリーンアップ ===
setInterval(() => {
  const now = new Date()
  const expiredSessions = []

  for (const [sessionId, session] of activeSessions) {
    // 24時間以上古いセッションまたは非アクティブなセッションを削除
    const isExpired = (now - session.createdAt) > (24 * 60 * 60 * 1000)
    const hasNoParticipants = !session.teacher.connected && session.students.size === 0

    if (isExpired || hasNoParticipants) {
      expiredSessions.push(sessionId)
    }
  }

  expiredSessions.forEach(sessionId => {
    activeSessions.delete(sessionId)
    console.log(`🧹 Cleaned up expired session: ${sessionId}`)
  })

  if (expiredSessions.length > 0) {
    console.log(`🧹 Cleaned up ${expiredSessions.length} expired sessions`)
  }
}, 60 * 60 * 1000) // 1時間ごとにクリーンアップ

// === サーバー起動 ===
const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log('')
  console.log('🚀 ======================================')
  console.log('🚀 協力学習WebSocketサーバー起動完了')
  console.log('🚀 ======================================')
  console.log(`📡 Server running on port ${PORT}`)
  console.log(`🌐 WebSocket URL: ws://localhost:${PORT}`)
  console.log(`🔗 API URL: http://localhost:${PORT}/api`)
  console.log('🚀 ======================================')
  console.log('')
})

// === エラーハンドリング ===
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
})

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error)
})

module.exports = { app, server, io }