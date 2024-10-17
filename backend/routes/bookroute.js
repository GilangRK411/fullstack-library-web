const express = require('express');
const { body } = require('express-validator');
const { bookupload } = require('../controllers/bookcontrol.js'); 

const router = express.Router();
const bookUploadValidation = [
    body('title').notEmpty().withMessage('Title is required.'),
    body('description').notEmpty().withMessage('Description is required.'),
    body('author').isNumeric().withMessage('Author ID must be a number.'),
    body('category').isNumeric().withMessage('Category ID must be a number.'),
    body('year').isNumeric().withMessage('Year must be a number.'),
    body('page').isNumeric().withMessage('Page count must be a number.'),
    body('language').notEmpty().withMessage('Language is required.'),
    body('extension').notEmpty().withMessage('File extension is required.'),
    body('bookImage').notEmpty().withMessage('Book image is required.'),
    body('file').notEmpty().withMessage('PDF file is required.'),
];

router.post('/upload', bookUploadValidation, bookupload);

module.exports = router;
