import express from 'express';
import pool from '../config/db.js';
const router = express.Router();

router.post('/api/register', async (req, res) => {
    const { fname, lname, address, city, zip, phone, email, password } = req.body;
    try {
        await pool.query(`INSERT INTO members (fname, lname, address, city, zip, phone, email, password) VALUES (?,?,?,?,?,?,?,?)`, 
        [fname, lname, address, city, zip, phone, email, password]);
        res.send('<h1>Account created!</h1><a href="/login">Login</a>');
    } catch (err) { res.status(500).send(err.message); }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM members WHERE email = ? AND password = ?', [email, password]);
    if (rows.length > 0) {
        req.session.userId = rows[0].userid;
        req.session.userName = rows[0].fname;
        res.redirect('/');
    } else { res.status(401).send('Wrong email/password'); }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

export default router;