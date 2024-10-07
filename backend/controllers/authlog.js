const db = require('../database/database.js'); 
const jwt = require('jsonwebtoken'); 
const { secretKey } = require('../middleware/session.js');

exports.checkSession = async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const query = 'SELECT * FROM user_sessions WHERE user_id = ?';
        const [rows] = await db.execute(query, [user_id]);

        if (rows.length > 0) {
            const sessionsStatus = [];

            for (const session of rows) {
                const jwt_token = session.jwt_token;
                const loginStatus = session.login_status;

                try {
                    const decoded = jwt.verify(jwt_token, secretKey);
                    sessionsStatus.push({
                        jwt_token,
                        login_status: loginStatus,
                        expired: false,
                    });
                } catch (error) {
                    sessionsStatus.push({
                        jwt_token,
                        login_status: loginStatus,
                        expired: true,
                    });
                }
            }

            const isLoggedIn = sessionsStatus.some(session => session.login_status === 'active');

            res.json({ user_id, isLoggedIn, sessions: sessionsStatus });
        } else {
            res.status(404).json({ message: 'User session not found' });
        }
    } catch (error) {
        console.error('Error fetching user session:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
