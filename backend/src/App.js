const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

app.use(cookieParser());
app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3005',
  'https://codegenapp.vercel.app',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));

const authRoutes = require('./routes/authRoutes');
const codeRoutes = require('./routes/codeRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/code', codeRoutes);

module.exports = app;
