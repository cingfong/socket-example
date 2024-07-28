const net = require('net');
const readline = require('readline');

// 设置命令行输入输出接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 创建客户端 socket
const client = new net.Socket();
const PORT = 8124;
const HOST = 'localhost';

// 连接到服务器
client.connect(PORT, HOST, () => {
    console.log('Connected to chat server');
    rl.addListener('line', (line) => {
        client.write(line);
    });
});

// 处理从服务器接收到的数据
client.on('data', (data) => {
    console.log(data.toString());
});

// 处理错误
client.on('error', (err) => {
    console.error(err);
});

// 处理连接结束
client.on('end', () => {
    console.log('Disconnected from chat server');
    rl.close();
});