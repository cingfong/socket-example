const net = require('net');
const crypto = require('crypto');

const rooms = {}; // 用于存储聊天室和客户端

// 创建服务器
const server = net.createServer((socket) => {
    socket.write('Enter the room password:\n');

    let currentRoom = null;

    socket.on('data', (data) => {
        const message = data.toString().trim();

        if (!currentRoom) {
            const roomPassword = message;
            const roomHash = crypto.createHash('sha256').update(roomPassword).digest('hex');

            if (!rooms[roomHash]) {
                rooms[roomHash] = [];
                socket.write('Room created. You can chat now.\n');
            } else {
                socket.write('Joined existing room. You can chat now.\n');
            }

            currentRoom = roomHash;
            rooms[roomHash].push(socket);

            // 为每个客户端设置消息处理程序
            setupChatRoom(socket, roomHash);

        } else {
            // 广播消息给房间里的其他客户端
            broadcast(message, socket, currentRoom);
        }
    });

    socket.on('end', () => {
        if (currentRoom) {
            rooms[currentRoom] = rooms[currentRoom].filter(client => client !== socket);
            if (rooms[currentRoom].length === 0) {
                delete rooms[currentRoom];
            }
        }
    });

    socket.on('error', (err) => {
        console.error(err);
    });
});

// 设置聊天室，处理两个客户端之间的消息传递
function setupChatRoom(socket, roomHash) {
    socket.write('Welcome to the chat room!\n');

    socket.on('data', (data) => {
        const message = data.toString().trim();
        broadcast(message, socket, roomHash);
    });

    socket.on('end', () => {
        if (rooms[roomHash]) {
            rooms[roomHash] = rooms[roomHash].filter(client => client !== socket);
            if (rooms[roomHash].length === 0) {
                delete rooms[roomHash];
            }
        }
    });

    socket.on('error', (err) => {
        console.error(err);
    });
}

// 广播消息给房间里的其他客户端
function broadcast(message, sender, roomHash) {
    rooms[roomHash].forEach(client => {
        if (client !== sender) {
            client.write(`Partner: ${message}\n`);
        }
    });
}

// 服务器监听端口
const PORT = 8124;
server.listen(PORT, () => {
    console.log(`Chat server running at port ${PORT}`);
});