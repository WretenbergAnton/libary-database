import express from 'express';
import pool from '../config/db.js';
const router = express.Router();

router.post('/api/cart', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Log in first' });
    const { isbn, qty } = req.body;
    await pool.query(`INSERT INTO cart (userid, isbn, qty) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE qty = qty + ?`, 
    [req.session.userId, isbn, qty, qty]);
    res.json({ message: 'Added' });
});

router.get('/api/cart-content', async (req, res) => {
    const [rows] = await pool.query(`SELECT c.isbn, b.title, b.price, c.qty FROM cart c JOIN books b ON c.isbn = b.isbn WHERE c.userid = ?`, [req.session.userId]);
    res.json(rows);
});

router.post('/checkout', async (req, res) => {
    const userid = req.session.userId;
    const [u] = await pool.query('SELECT address, city, zip FROM members WHERE userid = ?', [userid]);
    const [o] = await pool.query('INSERT INTO orders (userid, created, shipAddress, shipCity, shipZip) VALUES (?, CURDATE(), ?, ?, ?)', [userid, u[0].address, u[0].city, u[0].zip]);
    
    const [items] = await pool.query('SELECT c.isbn, c.qty, b.price FROM cart c JOIN books b ON c.isbn = b.isbn WHERE c.userid = ?', [userid]);
    for (let i of items) {
        await pool.query('INSERT INTO odetails (ono, isbn, qty, amount) VALUES (?, ?, ?, ?)', [o.insertId, i.isbn, i.qty, i.qty * i.price]);
    }
    await pool.query('DELETE FROM cart WHERE userid = ?', [userid]);
    res.send(`Order ${o.insertId} placed!`);
});

export default router;