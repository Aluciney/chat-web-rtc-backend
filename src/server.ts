import express from 'express';
import cors from 'cors';
import http from 'http';
import socket from 'socket.io';

const PORT = process.env.PORT || 3001;

let ROOMS = [
	{ name: 'Sala 1', value: 'saadamkweg-weg-wvsdsdv-asdasfdhrjtm' },
	{ name: 'Sala 2', value: 'dqwdqwdqw-fsdfsdfsdfgsg-asdasdasdas' }
];

const app = express();
app.use(cors());
app.get('/rooms', (req, res) => {
	res.json(ROOMS);
	return;
});
const server = http.createServer(app);
const io = new socket.Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
	const { room } = socket.handshake.query;
	if (!room) {
		socket.disconnect();
		return;
	}
	const ROOM = ROOMS.find(room_ => room_.value === room);
	if(!ROOM){
		socket.disconnect();
		return;
	}
	socket.join(room);
	socket.on('offer', ({ room: room_, offer }) => {
		socket.to(room).emit('offer', offer);
	})

	socket.on('answer', ({ room: room_, answer }) => {
		socket.to(room).emit('answer', answer);
	});

	socket.on('candidate', ({ room: room_, candidate }) => {
		socket.to(room).emit('candidate', candidate);
	});

	socket.on('disconnect', (socket) => {

	});
});

server.listen(3001, () => console.log(`Starting server on port ${PORT}`));