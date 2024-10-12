const express = require('express');
const router = express.Router();
const editprof = require('../controllers/editprofilepic.js');
const upload = require('../middleware/editprofilemid.js');

router.post('/:unique_id', upload.single('new_profile_picture'), editprof.editProfilePic);

module.exports = router;