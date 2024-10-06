const bcrypt = require('bcryptjs');
const pool = require('../database/database.js');
const jwt = require('jsonwebtoken');
const path = require('path');  
const dotenv = require('dotenv');
const { secretKey } = require('../middleware/session.js');
const currentDir = __dirname;
const envPath = path.join(currentDir, '..', 'project.env');

dotenv.config({ path: envPath });
const nodeenv = process.env.NODE_ENV;

exports.login = async (req, res) => {
    const { usernameOrEmail, password } = req.body; 
    if (!usernameOrEmail || !password) {
        return res.status(400).send({ message: 'Username/email and password are required' });
    }

    try {
        const [results] = await pool.query(
            'SELECT * FROM users WHERE username = ? OR email = ?', 
            [usernameOrEmail, usernameOrEmail]
        );
        if (results.length === 0) {
            return res.status(404).send({ message: 'Username/email not found' }); 
        }

        const user = results[0];
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).send({ message: 'Incorrect password' }); 
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role },
            secretKey,
            { expiresIn: '1d' } 
        );

        res.cookie('token', token, { 
            httpOnly: true,
            secure: nodeenv === 'production',
            maxAge: 24 * 60 * 60 * 1000 
        });

        return res.status(200).send({ message: 'Login successful' });
        
    } catch (error) {
        console.error('Database Query Error:', error); 
        return res.status(500).send({ message: 'An error occurred on the server' });
    }
};

// Logout function
exports.logout = (req, res) => {
    res.clearCookie('token'); 
    return res.status(200).send({ message: 'Logout successful' });
};



exports.register = async (req, res) => {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
        return res.status(400).send({ message: 'Username, password, and email are required' });
    }

    try {
        const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(409).send({ message: 'Username already exists' });
        }

        const [existingEmail] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.status(409).send({ message: 'Email already exists' });
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const role = 'user';

        await pool.query('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)', [username, hashedPassword, email, role]);
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
