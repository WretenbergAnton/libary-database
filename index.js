import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

// Importera routers
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import cartRoutes from './routes/cart.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

// Koppla ihop alla routes
app.use(authRoutes);
app.use(bookRoutes);
app.use(cartRoutes);

// Statiska sidor
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'views', 'register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/cart', (req, res) => res.sendFile(path.join(__dirname, 'views', 'cart.html')));

app.get('/api/user-status', (req, res) => {
    res.json(req.session.userId ? { loggedIn: true, name: req.session.userName } : { loggedIn: false });
});

app.listen(8080, () => console.log('Server running on http://localhost:8080'));