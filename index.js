import pool from './db.js';

async function getBooks() {
  try {
    // Här kör vi samma fråga som du testade i VS Code
    const [rows] = await pool.query('SELECT * FROM books');
    
    console.log(`Hittade ${rows.length} böcker i databasen!`);
    console.log(rows[0]); // Visar den första boken
  } catch (error) {
    console.error('Kunde inte hämta data:', error);
  }
}

getBooks();