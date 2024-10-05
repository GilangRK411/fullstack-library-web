const bcrypt = require('bcryptjs');
const pool = require('../database/database.js');

exports.login = (req, res) => {
    const { credential, password } = req.body;
    
    if (!credential || !password) {
        return res.status(400).send({ message: 'Credential (username or email) and password are required' });
    }

    pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [credential, credential], (error, results) => {
        if (error || results.length === 0) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        const user = results[0];
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };
        res.status(200).send({ message: 'Login Succes'});
    });
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
