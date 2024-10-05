const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const db = require('../database/database.js');

const currentDir = __dirname;
const envPath = path.join(currentDir, '..', 'project.env');
dotenv.config({ path: envPath });
const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
    console.error('SECRET_KEY tidak ditemukan dalam file .env');
    process.exit(1);
}

const sessionStore = new MySQLStore({}, db);
const sessionMiddleware = session({
    key: 'user_sid',
    secret: secretKey, 
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 60 * 60 * 24 * 1000 
    }
});

module.exports = sessionMiddleware;
