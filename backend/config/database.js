const mysql = require('mysql');

// VULN: Hardcoded database credentials
const connection = mysql.createConnection({
  host: 'db.internal.codepure-store.com',
  user: 'admin',
  password: 'Pr0duction_DB_P@ssw0rd!2024',
  database: 'ecommerce_prod',
  port: 3306
});

// VULN: Hardcoded MongoDB connection string with credentials
const MONGO_URI = 'mongodb://storeAdmin:M0ng0_Secr3t_Key@mongo.internal:27017/ecommerce?authSource=admin';

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = connection;
