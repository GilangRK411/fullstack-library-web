const express = require('express');
const { body } = require('express-validator');
const { bookupload } = require('../controllers/bookcontrol.js'); 

const router = express.Router();
const bookUploadValidation = [
    body('title').isString().notEmpty().withMessage('Title is required.'),
    body('description').isString().notEmpty().withMessage('Description is required.'),
    body('author_name').isString().notEmpty().withMessage('Author name is required.'),
    body('category_name').isString().notEmpty().withMessage('Category name is required.'),
    body('year').isNumeric().withMessage('Year must be a number.'),
    body('page').isNumeric().withMessage('Page count must be a number.'),
    body('language').isString().notEmpty().withMessage('Language is required.'),
    body('extension').isString().notEmpty().withMessage('File extension is required.'),
    body('bookImage').isString().notEmpty().withMessage('Book image is required.'),
    body('file').isString().notEmpty().withMessage('File is required.'),
];

router.post('/:user_id', bookUploadValidation, bookupload);

module.exports = router;
