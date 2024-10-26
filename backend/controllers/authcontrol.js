const bcrypt = require('bcryptjs');
const pool = require('../database/database.js');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../config/secretkeyconfig.js');
const crypto = require('crypto');

function hashUniqueId(uniqueId) {
    return crypto.createHash('sha256').update(uniqueId).digest('hex');
}

function generateUniqueId(length = 6) {
    const characters = '0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function isUniqueIdExists(uniqueId) {
    const [rows] = await pool.query('SELECT * FROM users WHERE unique_id = ?', [uniqueId]);
    return rows.length > 0; 
}

exports.login = async (req, res) => {
    const { usernameOrEmail, password } = req.body; 
    if (!usernameOrEmail || !password) {
        return res.status(400).json({ message: 'Username/email and password are required' });
    }

    try {
        const [results] = await pool.query(
            'SELECT * FROM users WHERE username = ? OR email = ?', 
            [usernameOrEmail, usernameOrEmail]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'Username/email not found' }); 
        }

        const user = results[0];
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: 'Incorrect password' }); 
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                email: user.email, 
                role: user.role 
            },
            secretKey,
            { expiresIn: '1d' } 
        );

        await pool.query(`
            REPLACE INTO user_sessions (user_id, jwt_token, issued_at, expires_at, login_status) 
            VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), TRUE)
        `, [user.id, token]);

        const uniqueId = hashUniqueId(user.unique_id.toString()); 
        const hundredYears = 100 * 365 * 24 * 60 * 60 * 1000;
        res.cookie('unique_id', JSON.stringify({ unique_id: uniqueId }), { 
            httpOnly: true,  
            maxAge: hundredYears,
            secure: true,  
            path: '/'
        });

        res.cookie('token', token, { 
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000 
        });

        return res.status(200).json({ 
            message: 'Login successful',
            unique_id: uniqueId 
        });
        
    } catch (error) {
        console.error('Database Query Error:', error); 
        return res.status(500).json({ message: 'An error occurred on the server' });
    }
};

exports.logout = async (req, res) => {
    const token = req.cookies.token; 

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.id; 
        const query = 'DELETE FROM user_sessions WHERE user_id = ?';
        const [results] = await pool.query(query, [userId]);

        res.clearCookie('token'); 
        res.clearCookie('unique_id');

        if (results.affectedRows > 0) {
            return res.status(200).json({ message: 'Logout successful' });
        } else {
            return res.status(404).json({ message: 'No active session found for this user.' });
        }
    } catch (err) {
        console.error('Error during logout:', err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        return res.status(500).json({ message: 'Failed to log out, please try again.' });
    }
};



exports.register = async (req, res) => {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Username, password, and email are required' });
    }

    try {
        const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        const [existingEmail] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const role = 'user';

        let uniqueId;
        do {
            uniqueId = generateUniqueId(Math.floor(Math.random() * (8 - 6 + 1)) + 6);
        } while (await isUniqueIdExists(uniqueId)); 

        await pool.query('INSERT INTO users (unique_id, username, password, email, role) VALUES (?, ?, ?, ?, ?)', [uniqueId, username, hashedPassword, email, role]);
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
