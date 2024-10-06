const jwt = require('jsonwebtoken');
const { secretKey } = require('./session.js');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login')
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized' });
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
