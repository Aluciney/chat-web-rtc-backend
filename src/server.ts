import express from 'express';
import cors from 'cors';
import http from 'http';
import socket from 'socket.io';

const PORT = process.env.PORT || 3001;


const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new socket.Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
	socket.on('join-room', (roomId) => {
		socket.join(roomId);

		socket.to(roomId).emit('user-connected', { id: socket.id });

		socket.on('users', () => {
			const users = Array.from(io.sockets.adapter.rooms.get(roomId) || []).filter(id => id !== socket.id).map(id => ({ id }));
			socket.emit('existing-users', users);
		});

		socket.on('offer', ({ userId, offer }) => {
			socket.to(userId).emit('offer', { userId: socket.id, offer });
		});

		socket.on('answer', ({ userId, answer }) => {
			socket.to(userId).emit('answer', { userId: socket.id, answer });
		});

		socket.on('candidate', ({ userId, candidate }) => {
			socket.to(userId).emit('candidate', { userId: socket.id, candidate });
		});

		socket.on('disconnect', () => {
			socket.to(roomId).emit('user-disconnected', { id: socket.id });
		});

		socket.on('leave-room', () => {
			socket.leave(roomId);
			socket.to(roomId).emit('user-disconnected', { id: socket.id });
		});
	})
});

server.listen(3001, () => console.log(`Starting server on port ${PORT}`));