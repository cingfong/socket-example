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

wss.on('connection', (ws) => {
  // 监听 WebSocket 客户端消息
  ws.on('message', (index) => {
    const _index = index.toString();
    ws.send(JSON.stringify({ event: 'action', value: _index }));
    // wss.clients.forEach(client => {
    //   if (client.readyState === WebSocket.OPEN) {
    //     client.send(`${message}`);
    //   }
    // });
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// 启动服务器
server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});