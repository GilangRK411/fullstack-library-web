const express = require('express');
const path = require('path');
const BodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authrouter = require('./routes/authrou.js');
const { verifyToken } = require('./middleware/authmiddleware.js');


const app = express();

app.use(cors());
app.use(BodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/alertpage'));

app.use (express.static(path.join(__dirname, '../frontend')));

// ROUTES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'landing.html'));
});

app.get('/catalog', verifyToken, (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../frontend/web', 'catalog.html'));
});

app.get('/alert', (req, res) => {
    const message = req.query.message || 'Something went wrong';
    res.render('alertauth.ejs', { message });
});

app.get('/forumthread', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'forumthread.html'));
});

app.get('/uploadbook', verifyToken, (req, res) => {
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
// API functions

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});