import express from 'express';
import pool from '../config/db.js';
const router = express.Router();

router.get('/api/books', async (req, res) => {
    const { author, title, page = 1 } = req.query;
    const limit = 5;
    const offset = (page - 1) * limit;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM books WHERE author LIKE ? AND title LIKE ? LIMIT ? OFFSET ?',
            [`${author || ''}%`, `%${title || ''}%`, limit, offset]
        );
        res.json({ books: rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;