import mysql from 'mysql2/promise'; // Vi använder /promise för smidigare kod
import dotenv from 'dotenv';

dotenv.config();

// Skapa en pool (bättre än enkel anslutning för appar)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10
});

export default pool;