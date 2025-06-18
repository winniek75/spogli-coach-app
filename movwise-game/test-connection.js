/**
 * WebSocket接続テスト
 */

const io = require('socket.io-client');

async function testConnection() {
  console.log('🧪 WebSocket接続テストを開始します...\n');

  const socket = io('ws://localhost:3001', {
    transports: ['websocket'],
    timeout: 5000
  });

  socket.on('connect', () => {
    console.log('✅ WebSocketサーバーに正常に接続しました');
    console.log(`🔗 Socket ID: ${socket.id}`);
    
    // テスト用の講師セッション作成
    console.log('📋 テスト用セッションを作成中...');
    socket.emit('create-session', {
      role: 'teacher',
      teacherInfo: {
        name: 'Test Teacher',
        title: 'テスト講師',
        avatar: '👨‍🏫',
        id: 'test_teacher_001'
      },
      sessionConfig: {
        maxStudents: 4,
        allowScreenShare: true
      }
    });
  });

  socket.on('session-created', (sessionData) => {
    console.log('🎉 テストセッションが作成されました!');
    console.log(`📋 セッションID: ${sessionData.sessionId}`);
    console.log(`🔑 招待コード: ${sessionData.inviteCode}`);
    console.log(`\n✨ 次のステップ:`);
    console.log(`1. 生徒用画面で招待コード「${sessionData.inviteCode}」を入力してください`);
    console.log(`2. または http://localhost:3000/join-session/${sessionData.inviteCode} にアクセス`);
    console.log(`\n⏰ 30秒後に自動終了します...`);
    
    setTimeout(() => {
      console.log('🏁 テスト終了');
      socket.disconnect();
      process.exit(0);
    }, 30000);
  });

  socket.on('participant-joined', (participant) => {
    console.log(`👋 新しい参加者が参加しました: ${participant.name}`);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ 接続エラー:', error);
    console.log('💡 WebSocketサーバーが起動していることを確認してください');
    process.exit(1);
  });

  socket.on('error', (error) => {
    console.error('❌ Socket.IOエラー:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('📡 接続が切断されました:', reason);
  });
}

// タイムアウト設定
setTimeout(() => {
  console.error('⏰ 接続テストがタイムアウトしました');
  process.exit(1);
}, 10000);

testConnection();