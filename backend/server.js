const express = require('express');
const path = require('path');
const BodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authrouter = require('./routes/authrou.js');
const editprofilerou = require('./routes/editprofilerou.js');
const pool = require('../backend/database/database.js');
const { verifyToken } = require('./middleware/authmiddleware.js');
const { validationResult } = require('express-validator');
const logger = require('./utils/logger.js');
const bookRoutes = require('./routes/bookroute.js');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/alertpage'));

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(BodyParser.json({ limit: '50mb' }));
app.use(BodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use (express.static(path.join(__dirname, '../frontend')));

app.use((err, req, res, next) => {
    logger.error(`Internal Server Error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Global validation error handler
app.use((req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
});

// ROUTES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'landing.html'));
});

app.get('/catalog', verifyToken, (req, res) => {
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

app.get('/user/edit', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'editprofile.html'), (err) => {
        if (err) {
            console.error('Error sending file:', err);
            return res.status(500).send({ message: 'Error loading profile edit page.' });
        }
    });
});

// LOGIN AND REGISTER
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/web', 'register.html'));
});

// API functions
app.use('/auth', authrouter);

app.use('/user/edit', editprofilerou);

app.use('/book', bookRoutes); // Prefix routes with /api

app.get('/user/profile_picture/:unique_id', verifyToken, async (req, res) => {
    const uniqueId = req.params.unique_id; 
    console.log(`Received request for unique_id: ${uniqueId}`);

    try {
        const connection = await pool.getConnection();

        try {
            const [results] = await connection.query('SELECT profile_picture, image_type FROM users WHERE unique_id = ?', [uniqueId]);
            
            console.log('Query executed successfully');
            console.log('Query results:', results);

            if (results.length === 0) {
                console.log('User not found'); 
                return res.status(404).json({ error: 'User not found' });
            }

            const profilePicture = results[0].profile_picture;
            const imageType = results[0].image_type; 

            if (profilePicture === null || profilePicture.length === 0) {
                console.log('Profile picture in users is empty');
                return res.json({ profile_picture: null });
            }
            const base64ProfilePicture = Buffer.from(profilePicture).toString('base64');
            const imageSrc = `data:${imageType};base64,${base64ProfilePicture}`;

            console.log('Returning profile picture'); 
            return res.json({ profile_picture: imageSrc });

        } finally {
            connection.release();
        }

    } catch (err) {
        console.error('Database error:', err); 
        return res.status(500).json({ error: 'Database error' });
    }
});

app.get('/unique-id', verifyToken, async (req, res) => {
    const userId = req.userId; 
    
    try {
        const [rows] = await pool.query('SELECT unique_id FROM users WHERE id = ?', [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const uniqueId = rows[0].unique_id; 
        res.json({ unique_id: uniqueId }); 
    } catch (error) {
        console.error('Database Query Error:', error);
        return res.status(500).json({ message: 'An error occurred on the server' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});