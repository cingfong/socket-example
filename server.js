// nodemon 熱加載使用
const express = require('express');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const port = 8080;

// 提供靜態文件
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

// 创建一个 WebSocket 服务器并附加到 HTTP 服务器
const wss = new WebSocket.Server({ server });

const RoomList = {}
const gameList = {}
const calculateWin = (boxState, room) => {
  const winList = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < winList.length; i++) {
    const site = winList[i];
    if (site.every(index => room[index] === boxState)) return true
  }
}
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
        setTimeout(()=>{
          if (calculateWin(classBox, gameList[roomNumber])) {
            RoomList[roomNumber].forEach(client => {
              client.send(JSON.stringify({ event: 'gameOver', value: classBox === 'crosses' ? 'crosses win' : 'noughts win' }));
            });
            return
          }
        },100)
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
        if (gameList[roomNumber]) {
          gameList[roomNumber] = null
        }
        return true
      }
    })
  });
});