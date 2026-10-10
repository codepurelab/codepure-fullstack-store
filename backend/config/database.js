const mysql = require('mysql2');

// FIX: Read credentials from environment variables
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'ecommerce',
  port: parseInt(process.env.DB_PORT || '3306', 10),
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = connection;
