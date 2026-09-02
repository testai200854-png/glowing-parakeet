const express = require('express');
const path = require('path');
const app = express();
const PORT = 3100;

app.use(express.json());

// Serve static files from root, all-code, or public
['.', 'all-code', 'public'].forEach(dir => {
    app.use(express.static(path.join(__dirname, dir)));
});

app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'all-code', 'index.html');
    res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fallback server active on port ${PORT}`);
});
