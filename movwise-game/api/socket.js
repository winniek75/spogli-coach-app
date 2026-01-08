import { Server } from 'socket.io';

export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server(res.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? [process.env.VERCEL_URL, process.env.PRODUCTION_DOMAIN]
          : ["http://localhost:3000", "http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Spectator mode handlers
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join-spectator-room', (gameId) => {
        socket.join(`spectator-${gameId}`);
        console.log(`Socket ${socket.id} joined spectator room for game ${gameId}`);
      });

      socket.on('leave-spectator-room', (gameId) => {
        socket.leave(`spectator-${gameId}`);
        console.log(`Socket ${socket.id} left spectator room for game ${gameId}`);
      });

      socket.on('game-state-update', (data) => {
        socket.to(`spectator-${data.gameId}`).emit('game-state-changed', data);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}