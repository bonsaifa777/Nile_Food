import jwt from 'jsonwebtoken';
import { JWT_SECRET, SOCKET_EVENTS } from '../shared/constants.js';

export const setupSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.user = decoded;
      } catch (err) {
        socket.user = null;
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    if (socket.user) {
      socket.join(`user_${socket.user.id}`);
    }

    socket.on(SOCKET_EVENTS.JOIN_ORDER, (orderId) => {
      socket.join(orderId);
      console.log(`Socket ${socket.id} joined order ${orderId}`);
    });

    socket.on(SOCKET_EVENTS.LEAVE_ORDER, (orderId) => {
      socket.leave(orderId);
    });

    socket.on(SOCKET_EVENTS.TYPING_START, ({ orderId, role }) => {
      socket.to(orderId).emit(SOCKET_EVENTS.TYPING_START, { role });
    });

    socket.on(SOCKET_EVENTS.TYPING_STOP, ({ orderId, role }) => {
      socket.to(orderId).emit(SOCKET_EVENTS.TYPING_STOP, { role });
    });

    socket.on('send_message', ({ orderId, message, sender }) => {
      io.to(orderId).emit(SOCKET_EVENTS.NEW_MESSAGE, { message, sender, timestamp: new Date() });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};