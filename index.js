import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js'; // Databasanslutningen [cite: 9]

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 8080; // Krav enligt instruktion [cite: 101]

// --- MIDDLEWARE ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public')); // För CSS och bilder

// Sessionshantering för inloggade medlemmar [cite: 153]
app.use(session({
    secret: 'bookstore-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// --- HTML ROUTES ---

// Task 2.1: Main Page [cite: 98]
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Task 2.2: Register Page [cite: 110]
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// Task 2.2: Login Page [cite: 144]
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Task 2.4: View Cart Page [cite: 216]
app.get('/cart', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.sendFile(path.join(__dirname, 'views', 'cart.html'));
});

// --- API ROUTES (LOGIK) ---

// Task 2.2: Registrera medlem [cite: 122]
app.post('/api/register', async (req, res) => {
    const { fname, lname, address, city, zip, phone, email, password } = req.body;
    try {
        const sql = `INSERT INTO members (fname, lname, address, city, zip, phone, email, password) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await pool.query(sql, [fname, lname, address, city, zip, phone, email, password]);
        res.send('<h1>Account created successfully [cite: 143]</h1><a href="/login">Go to Login</a>');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') res.status(400).send('Email already exists [cite: 123]');
        else res.status(500).send('Error: ' + err.message);
    }
});

// Task 2.2: Login [cite: 145, 147]
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM members WHERE email = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            req.session.userId = rows[0].userid; // Spara userid [cite: 34]
            req.session.userName = rows[0].fname;
            res.redirect('/'); 
        } else {
            res.status(401).send('Invalid email or password');
        }
    } catch (err) {
        res.status(500).send('Login error');
    }
});

// Task 2.3: Sök böcker (Pagination & Filter) [cite: 152, 188]
app.get('/api/books', async (req, res) => {
    try {
        const { author, title, subject, page = 1 } = req.query;
        const limit = 5; // Krav: 5 böcker per sida [cite: 154]
        const offset = (Math.max(1, page) - 1) * limit;

        let sql = 'SELECT * FROM books WHERE 1=1';
        let params = [];

        if (subject) { sql += ' AND subject = ?'; params.push(subject); } // [cite: 30]
        if (author) { sql += ' AND author LIKE ?'; params.push(`${author}%`); } // [cite: 192]
        if (title) { sql += ' AND title LIKE ?'; params.push(`%${title}%`); } // [cite: 202]

        sql += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await pool.query(sql, params);
        res.json({ books: rows });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Task 2.3: Lägg till i kundvagn [cite: 209, 211]
app.post('/api/cart', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    const { isbn, qty } = req.body;
    const userid = req.session.userId;

    try {
        // Uppdatera om den finns, annars lägg till [cite: 212]
        const sql = `INSERT INTO cart (userid, isbn, qty) VALUES (?, ?, ?) 
                     ON DUPLICATE KEY UPDATE qty = qty + ?`;
        await pool.query(sql, [userid, isbn, qty, qty]);
        res.json({ message: 'Added to cart' });
    } catch (err) {
        res.status(500).json({ error: 'Cart error' });
    }
});

// Task 2.4: Hämta innehåll i kundvagn [cite: 217, 219]
app.get('/api/cart-content', async (req, res) => {
    if (!req.session.userId) return res.status(401).json([]);
    try {
        const sql = `SELECT c.isbn, b.title, b.price, c.qty 
                     FROM cart c JOIN books b ON c.isbn = b.isbn 
                     WHERE c.userid = ?`;
        const [rows] = await pool.query(sql, [req.session.userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Task 2.4: Checkout [cite: 222, 223]
app.post('/checkout', async (req, res) => {
    if (!req.session.userId) return res.status(401).send('Log in first');
    const userid = req.session.userId;

    try {
        const [user] = await pool.query('SELECT address, city, zip FROM members WHERE userid = ?', [userid]);
        
        // Spara order [cite: 226, 231]
        const [orderResult] = await pool.query(
            'INSERT INTO orders (userid, created, shipAddress, shipCity, shipZip) VALUES (?, CURDATE(), ?, ?, ?)',
            [userid, user[0].address, user[0].city, user[0].zip]
        );
        const ono = orderResult.insertId;

        // Spara orderdetaljer [cite: 233, 237]
        const [items] = await pool.query(
            'SELECT c.isbn, c.qty, b.price FROM cart c JOIN books b ON c.isbn = b.isbn WHERE c.userid = ?', [userid]);
        
        for (let item of items) {
            await pool.query('INSERT INTO odetails (ono, isbn, qty, amount) VALUES (?, ?, ?, ?)', 
            [ono, item.isbn, item.qty, (item.qty * item.price)]);
        }

        await pool.query('DELETE FROM cart WHERE userid = ?', [userid]); // Töm vagnen [cite: 46]
        res.send(`Order placed! No: ${ono}. Delivery in 1 week. [cite: 229]`);
    } catch (err) {
        res.status(500).send('Checkout failed');
    }
});

// Log ut [cite: 264]
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});