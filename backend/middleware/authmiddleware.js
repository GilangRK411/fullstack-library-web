const jwt = require('jsonwebtoken');
const { secretKey } = require('./session.js');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/alert?message=Unauthorized:Please_Login_First');
    }
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.redirect('/alert?message=Unauthorized:Token_has_expired,Please_Login_Again');
            } else {
                return res.redirect('/alert?message=Unauthorized:Invalid_token');
            }
        }
        req.user = decoded; 
        next();
    });
};

const isadmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ message: 'Forbidden. Admins only.' });
};

module.exports = { verifyToken, isadmin };
