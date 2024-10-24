const pool = require('../database/database.js');

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
            return res.status(404).send('Book not found');
        }

        const bookTitle = rows[0].book_title.replace(/[^\w\s]/g, '').replace(/\s+/g, '+');
        if (bookTitle !== book_title) {
            return res.status(404).send('Book title mismatch');
        }

        const imageBuffer = rows[0].book_image;

        res.render('bookbody', {
            title: rows[0].book_title,
            description: rows[0].book_description,
            image: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
            year_publish: rows[0].year_publish,
            book_page: rows[0].book_page,
            language: rows[0].language,
            genre_name: rows[0].genre_name,
            author_name: rows[0].author_name
        });
    } catch (error) {
        console.error('Error fetching book details:', error);
        res.status(500).send('Error fetching book details');
    }
};
