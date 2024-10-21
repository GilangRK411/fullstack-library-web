const pool = require('../database/database.js');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

const IMAGE_SIZE_LIMIT = process.env.IMAGE_SIZE_LIMIT || 20 * 1024 * 1024; // 20 MB
const PDF_SIZE_LIMIT = process.env.PDF_SIZE_LIMIT || 100 * 1024 * 1024; // 100 MB

exports.bookupload = async (req, res) => {
    const {
        title,
        description,
        author_name,
        genre_name,
        year,
        page,
        language,
        extension,
        bookImage,
        file
    } = req.body;

    const { user_id } = req.params; 
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        logger.warn('Validation errors: ', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    let connection;
    try {
        const bookImageBuffer = Buffer.from(bookImage.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        const fileBuffer = Buffer.from(file.replace(/^data:application\/pdf;base64,/, ""), 'base64');

        if (bookImageBuffer.length > IMAGE_SIZE_LIMIT) {
            logger.warn('Image file size exceeds the limit of 20MB.');
            return res.status(400).json({ error: 'Image file size exceeds the limit of 20MB.' });
        }

        if (fileBuffer.length > PDF_SIZE_LIMIT) {
            logger.warn('PDF file size exceeds the limit of 100MB.');
            return res.status(400).json({ error: 'PDF file size exceeds the limit of 100MB.' });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [existingBookResults] = await connection.query(
            'SELECT book_title FROM books WHERE book_title = ?',
            [title]
        );

        if (existingBookResults.length > 0) {
            logger.warn(`Book with the title "${title}" already exists.`);
            return res.status(400).json({ error: 'A book with this title already exists.' });
        }

        let author_id;
        const [authorResults] = await connection.query(
            'SELECT author_id FROM authors WHERE author_name = ?',
            [author_name]
        );

        if (authorResults.length > 0) {
            author_id = authorResults[0].author_id;
        } else {
            const [insertAuthorResult] = await connection.query(
                'INSERT INTO authors (author_name) VALUES (?)',
                [author_name]
            );
            author_id = insertAuthorResult.insertId;
            logger.info(`New author added: ${author_name} with ID ${author_id}`);
        }

        let genre_id;
        const [categoryResults] = await connection.query(
            'SELECT genre_id FROM genres WHERE genre_name = ?',
            [genre_name]
        );

        if (categoryResults.length > 0) {
            genre_id = categoryResults[0].genre_id;
        } else {
            const [insertCategoryResult] = await connection.query(
                'INSERT INTO genres (genre_name) VALUES (?)',
                [genre_name]
            );
            genre_id = insertCategoryResult.insertId;
            logger.info(`New category added: ${genre_name} with ID ${genre_id}`);
        }

        const sql = `
            INSERT INTO books (
                book_title,
                book_description,
                author_id,
                genre_id,
                year_publish,
                book_page,
                book_file_extension,
                language,
                book_image,
                book_file,
                user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [results] = await connection.query(sql, [
            title,
            description,
            author_id,
            genre_id,
            year,
            page,
            extension,
            language,
            bookImageBuffer,
            fileBuffer,
            user_id
        ]);

        await connection.commit();
        logger.info(`Book uploaded successfully: ID ${results.insertId}`);
        
        res.status(201).json({
            id: results.insertId,
            message: 'Book added successfully!',
            title,
            author_name,
            genre_name,
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
