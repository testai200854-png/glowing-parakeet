const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'all-code')));
app.use(express.static(path.join(__dirname, 'ai-assistant')));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'all-code', 'index.html'));
});

app.listen(5000, '0.0.0.0', () => {
    console.log('SERVER_ONLINE_5000');
});
