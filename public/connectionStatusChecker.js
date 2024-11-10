// connectionStatusChecker.js

const INTERVAL = 1 * 1000; // 心跳間隔秒數

console.log('ddd')

// 向主線程發送心跳檢查
function checkConnection() {
    self.postMessage({ type: 'checkConnection' });
}

// 定期執行心跳檢查
setInterval(checkConnection, INTERVAL);