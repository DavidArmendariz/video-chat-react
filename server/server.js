const express = require('express');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');

const app = express();

app.set('view engine', 'ejs');

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use('/peerjs', peerServer);
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
    socket.on('message', (message) => {
      io.to(roomId).emit('createMessage', message, userName);
    });
  });
});

const server = http.Server(app);

server.listen(process.env.PORT || 3030);
