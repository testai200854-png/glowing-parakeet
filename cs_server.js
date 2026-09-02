const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3100;

app.use(express.json({ limit: '10mb' }));

// 支援所有前端靜態檔案目錄
const staticPaths = ['.', 'all-code', 'public'];
staticPaths.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
        app.use(express.static(fullPath));
    }
});

// API 健康檢查端點
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', code: 200 });
});

// 通用路由，防止 SPA 頁面刷新出現 404/502
app.get('*', (req, res) => {
    const mainHtml = path.join(__dirname, 'all-code', 'index.html');
    if (fs.existsSync(mainHtml)) {
        res.sendFile(mainHtml);
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully listening on http://0.0.0.0:${PORT}`);
});
