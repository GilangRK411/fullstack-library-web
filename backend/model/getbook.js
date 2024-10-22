const pool = require('../database/database.js');

// Function to get all books
exports.getBooks = async (req, res) => {
    try {
        // Select book_id and book_title from the books table
        const [results] = await pool.query('SELECT book_id FROM books');

        if (results.length === 0) {
            console.log('No books found in the database.');
            return res.status(404).json({ message: 'No books found.' });
        }

        // Respond with the results containing only book_id and book_title
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

        const bookTitle = rows[0].book_title; // Get book title
        const imageBuffer = rows[0].book_image; // Get image buffer

        res.json({
            title: bookTitle,
            image: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
        });
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).send('Error fetching book');
    }
};



