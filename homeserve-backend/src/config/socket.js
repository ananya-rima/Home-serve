const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/tokenUtils');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || '*', credentials: true },
  });

  
  io.use((socket, next) => {
    try {
      const decoded = verifyAccessToken(socket.handshake.auth?.token);
      socket.userId = String(decoded.id);
      next();
    } catch (err) {
      next(new Error('Unauthorized'));
    }
  });

  
  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
  });

  return io;
};


const emitToUser = (userId, event, payload) => {
  if (io) io.to(`user:${userId}`).emit(event, payload);
};

module.exports = { initSocket, emitToUser };