const isauthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

const isadmin = (req, res, next) => {
    if(req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).send({ message: 'Forbidden' });
};

module.exports = {isauthenticated, isadmin};