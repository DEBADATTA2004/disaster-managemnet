const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('>>> A device connected to the Mesh');

    socket.on('broadcast', (msg) => {
        console.log('Relaying message from:', msg.user);
        // This sends the message to EVERYONE ELSE connected
        socket.broadcast.emit('mesh-msg', msg);
    });

    socket.on('disconnect', () => {
        console.log('Device disconnected');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`MESH HUB ACTIVE ON PORT ${PORT}`);
});