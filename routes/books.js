import express from 'express';
import pool from '../config/db.js';
const router = express.Router();

router.get('/api/books', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const author = req.query.author || '';
    const title = req.query.title || '';
    
    const limit = 15; 
    const offset = (page - 1) * limit;
    
    try {
        const searchAuthor = `${author}%`;
        const searchTitle = `%${title}%`;

        const [rows] = await pool.query(
            'SELECT * FROM books WHERE author LIKE ? AND title LIKE ? LIMIT ? OFFSET ?',
            [searchAuthor, searchTitle, limit, offset]
        );

        const [countRows] = await pool.query(
            'SELECT COUNT(*) as total FROM books WHERE author LIKE ? AND title LIKE ?',
            [searchAuthor, searchTitle]
        );

        const totalBooks = countRows[0].total;
        
        const totalPages = Math.ceil(totalBooks / limit);

        res.json({ 
            books: rows, 
            totalPages: totalPages || 1 
        });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: err.message }); 
    }
});
export default router;