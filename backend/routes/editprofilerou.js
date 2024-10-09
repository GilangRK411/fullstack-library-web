const express = require('express');
const router = express.Router();
const editprof   = require('../controllers/editprofilepic.js');
// const authlog = require('../controllers/authlog.js');

router.post('/:unique_id', editprof.editProfilePic);

module.exports = router;