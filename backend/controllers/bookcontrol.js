const pool = require('../database/database.js');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger.js');

const IMAGE_SIZE_LIMIT = 20 * 1024 * 1024; // 20 MB
const PDF_SIZE_LIMIT = 100 * 1024 * 1024; // 100 MB

exports.bookupload = async (req, res) => {
    const {
        title,
        description,
        author,
        category,
        year,
        page,
        language,
        extension,
        bookImage,
        file
    } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const bookImageBuffer = Buffer.from(bookImage.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        const fileBuffer = Buffer.from(file.replace(/^data:application\/pdf;base64,/, ""), 'base64');

        if (bookImageBuffer.length > IMAGE_SIZE_LIMIT) {
            return res.status(400).json({ error: 'Image file size exceeds the limit of 5MB.' });
        }

        if (fileBuffer.length > PDF_SIZE_LIMIT) {
            return res.status(400).json({ error: 'PDF file size exceeds the limit of 10MB.' });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        const sql = `
            INSERT INTO books (
                book_title,
                book_description,
                author_id,
                book_image,
                category_id,
                year_publish,
                book_page,
                book_file_extension,
                language,
                book_file
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [results] = await connection.query(sql, [
            title,
            description,
            author,
            bookImageBuffer,
            category,
            year,
            page,
            extension,
            language,
            fileBuffer
        ]);

        await connection.commit();

        logger.info(`Book uploaded successfully: ID ${results.insertId}`);

        res.status(201).json({
            id: results.insertId,
            message: 'Book added successfully!',
            title,
            author,
            category,
            year,
            page,
            language,
        });

    } catch (err) {
        if (connection) {
            await connection.rollback();
        }
        logger.error(`Error uploading book: ${err.message}`);
        res.status(500).json({ error: 'An error occurred while uploading the book. Please try again.' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
