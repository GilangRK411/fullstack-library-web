const express = require('express');
const path = require('path');
const BodyParser = require('body-parser');
const cors = require('cors');
const authrouter = require('./routes/authrou.js');
const bookrouter = require('./routes/bookroute.js');
const app = express();
const PORT = process.env.PORT || 5000;


app.use (express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/page1.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});