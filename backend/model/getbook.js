const pool = require('../database/database.js');

// Fungsi untuk menampilkan isi tabel 'books' sebagai route handler
exports.getBooks = async (req, res) => {
    try {
        // Query untuk mengambil semua data dari tabel 'books'
        const [results] = await pool.query('SELECT * FROM books');

        // Cek jika hasilnya kosong
        if (results.length === 0) {
            console.log('No books found in the database.');
            return res.status(404).json({ message: 'No books found.' });
        }

        // Tampilkan hasil query dalam format JSON
        res.json(results);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Error fetching books');
    }
};
