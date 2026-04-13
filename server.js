const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    pingInterval: 25000,
    pingTimeout: 60000,
});
const path = require('path');

// Configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Logging utility
const log = (level, message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data);
};

// Routes
app.get('/', (req, res) => {
    log('info', 'Client connecting to homepage');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/status', (req, res) => {
    res.json({
        status: 'active',
        timestamp: new Date().toISOString(),
        connectedDevices: io.engine.clientsCount,
        uptime: process.uptime()
    });
});

app.get('/api/health', (req, res) => {
    res.json({ health: 'ok', message: 'Server is running' });
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
    const clientIp = socket.handshake.address;
    const socketId = socket.id;
    
    log('info', 'Device connected to Mesh', {
        socketId: socketId,
        clientIp: clientIp,
        totalConnected: io.engine.clientsCount
    });

    // Send status to newly connected client
    socket.emit('status', {
        type: 'connected',
        message: 'Successfully connected to ResqNet Mesh',
        deviceId: socketId,
        timestamp: new Date().toISOString()
    });

    // Broadcast to all that a new device joined
    io.emit('device-joined', {
        deviceCount: io.engine.clientsCount,
        timestamp: new Date().toISOString()
    });

    // Handle incoming broadcast messages
    socket.on('broadcast', (msg) => {
        try {
            // Validate message
            if (!msg.user || !msg.content) {
                log('warn', 'Invalid message format', { socketId, msg });
                socket.emit('error', { message: 'Invalid message format' });
                return;
            }

            // Log the message
            log('info', 'Relaying message', {
                from: msg.user,
                category: msg.category || 'general',
                contentLength: msg.content.length,
                socketId: socketId
            });

            // Add metadata and relay to others
            const enrichedMsg = {
                ...msg,
                timestamp: new Date().toISOString(),
                deviceId: socketId,
                clientIp: clientIp
            };

            // Send to all EXCEPT sender
            socket.broadcast.emit('mesh-msg', enrichedMsg);

            // Confirmation to sender
            socket.emit('message-sent', {
                messageId: `msg_${Date.now()}`,
                timestamp: new Date().toISOString(),
                recipientCount: io.engine.clientsCount - 1
            });

        } catch (error) {
            log('error', 'Error processing broadcast', {
                error: error.message,
                socketId
            });
            socket.emit('error', { message: 'Error processing message' });
        }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
        socket.broadcast.emit('user-typing', {
            user: data.user,
            timestamp: new Date().toISOString()
        });
    });

    // Handle message acknowledgment
    socket.on('ack', (data) => {
        log('info', 'Message acknowledged', { socketId, messageId: data.messageId });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
        log('info', 'Device disconnected', {
            socketId,
            reason,
            totalConnected: io.engine.clientsCount
        });

        // Notify others of disconnection
        io.emit('device-left', {
            deviceCount: io.engine.clientsCount,
            timestamp: new Date().toISOString()
        });
    });

    // Handle connection errors
    socket.on('error', (error) => {
        log('error', 'Socket error', { socketId, error: error.message });
    });

    // Handle disconnect request
    socket.on('request-disconnect', () => {
        log('info', 'Disconnect requested', { socketId });
        socket.disconnect();
    });
});

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
    log('error', 'Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
    log('error', 'Uncaught Exception', { error: error.message });
});

// Start server
http.listen(PORT, '0.0.0.0', () => {
    log('info', `🚀 MESH HUB ACTIVE ON PORT ${PORT}`, {
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

module.exports = http;