const pool = require('../database/database.js');

exports.getBooks = async (req, res) => {
    try {
        const [results] = await pool.query('SELECT book_id FROM books');

        if (results.length === 0) {
            console.log('No books found in the database.');
            return res.status(404).json({ message: 'No books found.' });
        }

        res.json(results);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Error fetching books');
    }
};

exports.showBook = async (req, res) => {
    const book_id = parseInt(req.params.book_id, 10);

    try {
        const [rows] = await pool.query('SELECT book_title, book_image FROM books WHERE book_id = ?', [book_id]);
    
        if (rows.length === 0) {
            return res.status(404).send('Book not found');
        }

        const bookTitle = rows[0].book_title;
        const imageBuffer = rows[0].book_image; 

        res.json({
            title: bookTitle,
            image: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
        });
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).send('Error fetching book');
    }
};



