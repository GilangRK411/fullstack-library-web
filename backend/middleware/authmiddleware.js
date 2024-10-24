const pool = require('../database/database.js');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../middleware/session.js');

const verifyTokenAndCheckSession = async (req, res, next) => {
    const token = req.cookies.token; // Get token from cookies

    if (!token) {
        return res.redirect('/alert?message=Unauthorized:Please_Login_First');
    }

    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            console.log('Token verification error:', err);
            if (err.name === 'TokenExpiredError') {
                return res.redirect('/alert?message=Unauthorized:Token_has_expired,_Please_Login_Again');
            } else {
                return res.redirect('/alert?message=Unauthorized:Invalid_token');
            }
        }

        const user_id = decoded.id; 
        try {
            const query = 'SELECT * FROM user_sessions WHERE user_id = ?';
            const [sessions] = await pool.execute(query, [user_id]);

            if (sessions.length > 0) {

                const promises = sessions.map(session => {
                    return new Promise((resolve) => {
                        const sessionToken = session.jwt_token;
                        
                        const isActive = session.login_status === 1;
                        
                        if (isActive) {
                            jwt.verify(sessionToken, secretKey, (verifyErr, verified) => {
                                if (verifyErr) {
                                    console.log(`Token verification failed for session ${session.id}:`, verifyErr.message);
                                    return resolve(false);
                                }
                                resolve(true); 
                            });
                        } else {
                            console.log('Session not active (login_status is not 1):', session.id);
                            resolve(false);
                        }
                    });
                });

                const results = await Promise.all(promises);
                const validSessionFound = results.includes(true);
                if (validSessionFound) {
                    next(); 
                } else {
                    console.log('No valid session found for user:', user_id);
                    return res.redirect('/alert?message=Unauthorized:Session_expired,_Please_Login_Again');
                }
            } else {
                console.log('No sessions found for user_id:', user_id);
                return res.status(404).json({ message: 'User session not found' });
            }
        } catch (error) {
            console.error('Error fetching user session:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });
};

module.exports = { verifyTokenAndCheckSession };
