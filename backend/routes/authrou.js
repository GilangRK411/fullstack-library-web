const express = require('express');
const router = express.Router();
const authController   = require('../controllers/authcontrol.js');
const authMiddleware = require('../controllers/getuniqueid.js');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/register', authController.register);
router.post('/get_unique_id', authMiddleware.retrieveUniqueId);

module.exports = router;