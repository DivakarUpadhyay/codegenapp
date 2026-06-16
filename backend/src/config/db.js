const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.log('Error connecting to the database:', err));

module.exports = pool;
