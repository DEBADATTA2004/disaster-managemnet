# ResqNet API Documentation

## Overview

ResqNet uses **Socket.io** for real-time, bidirectional communication between clients and the server. This document details all available endpoints and events.

## REST API Endpoints

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "health": "ok",
  "message": "Server is running"
}
```

### Server Status

```
GET /api/status
```

**Response:**
```json
{
  "status": "active",
  "timestamp": "2026-04-13T10:30:45.123Z",
  "connectedDevices": 5,
  "uptime": 3600.5
}
```

---

## Socket.io Events

### Client → Server Events

#### `connection`
Automatically emitted when a client connects.

```javascript
socket.on('connect', () => {
  console.log('Connected to ResqNet');
});
```

#### `broadcast`
Send a message to all other connected devices.

**Data:**
```javascript
socket.emit('broadcast', {
  user: 'John Doe',           // Sender name (required)
  content: 'Emergency...',    // Message content (required)
  category: 'emergency',      // Category: emergency|warning|info|safe
  priority: 1,                // Priority level 1-5 (optional)
  location: { lat, lng }      // GPS coordinates (optional)
});
```

**Example:**
```javascript
socket.emit('broadcast', {
  user: 'Device Alpha',
  content: 'Water available near Hospital',
  category: 'safe'
});
```

#### `typing`
Indicate that user is typing a message.

**Data:**
```javascript
socket.emit('typing', {
  user: 'John Doe'
});
```

#### `ack`
Send acknowledgment for received message.

**Data:**
```javascript
socket.emit('ack', {
  messageId: 'msg_1681401600000'
});
```

#### `request-disconnect`
Gracefully disconnect from the mesh.

```javascript
socket.emit('request-disconnect');
```

#### `disconnect`
Automatically emitted when client disconnects (intentional or accidental).

```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // reason: 'client namespace disconnect', 'server namespace disconnect', etc.
});
```

---

### Server → Client Events

#### `status`
Sent upon successful connection.

**Data:**
```javascript
{
  type: 'connected',
  message: 'Successfully connected to ResqNet Mesh',
  deviceId: 'socket-id-here',
  timestamp: '2026-04-13T10:30:45.123Z'
}
```

**Handler:**
```javascript
socket.on('status', (data) => {
  console.log('Connected:', data.message);
  console.log('Device ID:', data.deviceId);
});
```

#### `mesh-msg`
Received message from another device.

**Data:**
```javascript
{
  user: 'John Doe',           // Sender name
  content: 'Emergency help needed',
  category: 'emergency',
  priority: 1,
  timestamp: '2026-04-13T10:30:45.123Z',
  deviceId: 'socket-id',
  clientIp: '192.168.1.100'
}
```

**Handler:**
```javascript
socket.on('mesh-msg', (msg) => {
  console.log(`Message from ${msg.user}:`, msg.content);
  displayMessageInUI(msg);
});
```

#### `message-sent`
Confirmation that message was relayed to other devices.

**Data:**
```javascript
{
  messageId: 'msg_1681401600000',
  timestamp: '2026-04-13T10:30:45.123Z',
  recipientCount: 4  // Number of devices that received it
}
```

**Handler:**
```javascript
socket.on('message-sent', (data) => {
  console.log(`Message sent to ${data.recipientCount} devices`);
});
```

#### `device-joined`
New device joined the mesh.

**Data:**
```javascript
{
  deviceCount: 5,
  timestamp: '2026-04-13T10:30:45.123Z'
}
```

**Handler:**
```javascript
socket.on('device-joined', (data) => {
  console.log(`Mesh now has ${data.deviceCount} devices`);
  updateDeviceCounter(data.deviceCount);
});
```

#### `device-left`
Device left the mesh.

**Data:**
```javascript
{
  deviceCount: 4,
  timestamp: '2026-04-13T10:30:45.123Z'
}
```

**Handler:**
```javascript
socket.on('device-left', (data) => {
  console.log(`Mesh now has ${data.deviceCount} devices`);
});
```

#### `user-typing`
Another user is typing.

**Data:**
```javascript
{
  user: 'John Doe',
  timestamp: '2026-04-13T10:30:45.123Z'
}
```

**Handler:**
```javascript
socket.on('user-typing', (data) => {
  console.log(`${data.user} is typing...`);
  showTypingIndicator(data.user);
});
```

#### `error`
Server-side error occurred.

**Data:**
```javascript
{
  message: 'Invalid message format'
}
```

**Handler:**
```javascript
socket.on('error', (error) => {
  console.error('Server error:', error.message);
});
```

---

## Complete Example

### Client Implementation

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
    <input type="text" id="msgInput" placeholder="Type message...">
    <button onclick="sendMessage()">Send</button>
    <div id="messages"></div>

    <script>
        // Connect to server
        const socket = io();

        // Connection established
        socket.on('connect', () => {
            console.log('Connected to ResqNet');
            document.getElementById('messages').innerHTML += '<p class="info">✓ Connected to mesh</p>';
        });

        // Handle incoming messages
        socket.on('mesh-msg', (msg) => {
            const elem = document.createElement('p');
            elem.textContent = `${msg.user}: ${msg.content}`;
            document.getElementById('messages').appendChild(elem);
        });

        // Handle connection status
        socket.on('status', (data) => {
            console.log('Status:', data);
        });

        // Handle device count updates
        socket.on('device-joined', (data) => {
            console.log(`Mesh has ${data.deviceCount} devices`);
        });

        // Send message
        function sendMessage() {
            const input = document.getElementById('msgInput');
            socket.emit('broadcast', {
                user: 'Me',
                content: input.value,
                category: 'emergency'
            });
            input.value = '';
        }

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            console.log('Disconnected:', reason);
            document.getElementById('messages').innerHTML += '<p class="error">✗ Disconnected</p>';
        });
    </script>
</body>
</html>
```

---

## Message Categories

| Category | Color | Use Case |
|----------|-------|----------|
| `emergency` | Red | Critical emergencies |
| `warning` | Orange | Warnings and alerts |
| `info` | Blue | General information |
| `safe` | Green | All clear messages |

---

## Priority Levels

| Level | Description |
|-------|-------------|
| 1 | Critical - Immediate action needed |
| 2 | High - Needs attention soon |
| 3 | Medium - Standard priority |
| 4 | Low - Can wait |
| 5 | Info - For reference only |

---

## Error Handling

The server emits `error` events for:
- Invalid message format
- Connection issues
- Processing failures

Always listen for errors:

```javascript
socket.on('error', (error) => {
    console.error('Error:', error.message);
    // Handle error appropriately
});
```

---

## Performance Considerations

- **Max Concurrent Connections**: 50-100 per server instance
- **Message Size Limit**: ~1MB per message
- **Latency**: < 100ms average
- **Reconnection Timeout**: 60 seconds
- **Ping Interval**: 25 seconds

---

## Rate Limiting (Future)

Planned rate limiting:
- 100 messages per minute per device
- 10MB/hour per device
- 5 simultaneous connections per IP

---

## Security Notes

- Messages are broadcast to all connected devices
- No end-to-end encryption (yet - planned feature)
- No authentication (yet - planned feature)
- Validate all inputs on client side
- Sanitize content before displaying

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-13 | Initial API release |

---

For more information, see [README.md](README.md) and [DEPLOYMENT.md](DEPLOYMENT.md)
