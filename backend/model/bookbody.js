const pool = require('../database/database.js');
const fs = require('fs');
const path = require('path');

exports.getBookBody = async (req, res) => {
    const book_id = parseInt(req.params.book_id, 10);
    const book_title = req.params.book_title; 

    try {
        const [rows] = await pool.query(`
            SELECT 
                books.book_title, 
                books.book_image, 
                books.book_description, 
                books.year_publish, 
                books.book_page,
                books.language,
                genres.genre_name, 
                authors.author_name
            FROM books
            JOIN genres ON books.genre_id = genres.genre_id
            JOIN authors ON books.author_id = authors.author_id
            WHERE books.book_id = ?`, 
        [book_id]);

        if (rows.length === 0) {
            return res.status(404).send('<h1>Book not found</h1>');
        }

        const bookTitle = rows[0].book_title.replace(/[^\w\s]/g, '').replace(/\s+/g, '+');
        if (bookTitle !== book_title) {
            return res.status(404).send('<h1>Book title mismatch</h1>');
        }

        const imageBuffer = rows[0].book_image;
        const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

        const templatePath = path.join(__dirname, '../../frontend/templates/bookbody.html');
        let htmlTemplate = '';
        try {
            htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
        } catch (readError) {
            console.error('Error reading the HTML template:', readError);
            return res.status(500).send('<h1>Template file not found</h1>');
        }

        const regex = new RegExp('{{title}}', 'g'); 
        htmlTemplate = htmlTemplate.replace(regex, rows[0].book_title)
            .replace('{{description}}', rows[0].book_description)
            .replace('{{image}}', base64Image)
            .replace('{{year_publish}}', rows[0].year_publish)
            .replace('{{book_page}}', rows[0].book_page)
            .replace('{{language}}', rows[0].language)
            .replace('{{genre_name}}', rows[0].genre_name)
            .replace('{{author_name}}', rows[0].author_name);

        res.setHeader('Content-Type', 'text/html');
        res.send(htmlTemplate);
    } catch (error) {
        console.error('Error fetching book details:', error);
        res.status(500).send('<h1>Error fetching book details</h1>');
    }
};
