// nodemon 熱加載使用
const http = require('http');
const WebSocket = require('ws');

// 创建一个 HTTP 服务器
const server = http.createServer((req, res) => {
  res.writeHead(404);
  res.end();
});

// 创建一个 WebSocket 服务器并附加到 HTTP 服务器
const wss = new WebSocket.Server({ server });

const RoomList = {}
const gameList = {}
wss.on('connection', (ws) => {
  // 监听 WebSocket 客户端消息
  ws.on('message', (message) => {
    const { event, value, roomNumber, classBox } = JSON.parse(message);
    switch (event) {
      case 'createRoom':
        if (RoomList[value]) {
          // TODO: 待修改
          ws.send(JSON.stringify({ event: 'error', value: '房間已經存在' }));
        } else {
          RoomList[value] = new Set([ws])
          RoomList[value].add(ws)
          ws.send(JSON.stringify({ event: 'createdRoom', value }));
        }
        break;
      case 'joinRoom':
        if (RoomList[value] && RoomList[value].size < 2) {
          RoomList[value].add(ws)
          const randomUser = Math.floor(Math.random() * 2);
          [...RoomList[value]].forEach((client, index) => {
            client.send(JSON.stringify({ event: 'start', value: index === randomUser ? 'crosses' : 'noughts' }));
          })
          gameList[value] = Array.from(9).map(() => null)
          // TODO: 待修改
          ws.send(JSON.stringify({ event: 'joinedRoom', value }));
        } else {
          ws.send(JSON.stringify({ event: 'error', value: '房間已滿' }));
        }
        break;
      case 'action':
        if (gameList[roomNumber][value]) return;
        gameList[roomNumber][value] = classBox
        RoomList[roomNumber].forEach(client => {
          client.send(JSON.stringify({ event: 'action', value: gameList[roomNumber], ctl: client !== ws }));
        });
        break;
      default:
        break;
    }
  });

  ws.on('close', () => {
    // 清除多餘使用者
    const roomList = Object.keys(RoomList);
    roomList.some(roomNumber => {
      if (RoomList[roomNumber]?.has(ws)) {
        RoomList[roomNumber].delete(ws)
        return true
      }
    })
  });
});

// 启动服务器
server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});