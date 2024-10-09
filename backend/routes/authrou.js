const express = require('express');
const router = express.Router();
const authController   = require('../controllers/authcontrol.js');
const authlog = require('../controllers/authlog.js');
// const authlog = require('../controllers/authlog.js');


router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/register', authController.register);
router.get('/check-session', authlog.checkSession);

module.exports = router;