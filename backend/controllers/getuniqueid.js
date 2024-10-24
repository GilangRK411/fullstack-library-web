const pool = require('../database/database.js');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../middleware/session.js');

exports.retrieveUniqueId = async (req, res) => {
    const token = req.cookies.token; 

    if (!token) {
        return res.status(401).json({ message: 'Token is required' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        const user_id = decoded.id;

        const query = 'SELECT unique_id FROM users WHERE id = ?';
        const [rows] = await pool.execute(query, [user_id]);

        if (rows.length > 0) {
            return res.json({ unique_id: rows[0].unique_id });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving unique_id:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};