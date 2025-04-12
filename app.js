const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = new Set();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/sounds', express.static(path.join(__dirname, 'public/sounds')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('Користувач підключився');
  
  users.add(socket.id);
  io.emit('onlineUsers', users.size);
    
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  
  socket.on('disconnect', () => {
    console.log('Користувач відключився');
    users.delete(socket.id);
    io.emit('onlineUsers', users.size);
  });
});

server.listen(3000, () => {
  console.log('Сервер запущений на порту 3000');
});