const express = require('express');
const path = require('path');
const BodyParser = require('body-parser');
const cors = require('cors');
const authrouter = require('./routes/authrou.js');
const app = express();

app.use(cors());
app.use(BodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use (express.static(path.join(__dirname, '../frontend')));
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});


// ROUTES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'landing.html'));
});

app.get('/catalog', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'catalog.html'));
});

app.get('/forumthread', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'forumthread.html'));
});

app.get('/uploadbook', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'uploadbook.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'register.html'));
});


// Login form and Register form

app.use('/api/auth', authrouter);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});