const express = require('express');
const path = require('path');
const BodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authrouter = require('./routes/authrou.js');
const sessionMiddleware = require('./middleware/session.js');
const {isauthenticated} = require('./middleware/authmiddleware.js');
const app = express();

app.use(cors());
app.use(BodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use (express.static(path.join(__dirname, '../frontend')));
app.use(sessionMiddleware);

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});


// ROUTES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'landing.html'));
});

app.get('/catalog', isauthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'catalog.html'));
});

app.get('/forumthread', isauthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'forumthread.html'));
});

app.get('/uploadbook', isauthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'uploadbook.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'register.html'));
});


// API functions
app.use('/api/auth', authrouter);

app.get('/api/auth/check-session', (req, res) => {
    if (req.session.user) {
        res.status(200).send('User is logged in.');
    } else {
        res.status(401).send('User not logged in.');
    }
});


// API functions

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});