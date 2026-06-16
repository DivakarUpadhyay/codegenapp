const express = require('express');
const cookieParser = require('cookie-parser'); 
const cors = require('cors');
const app = express();
app.use(cookieParser());
app.use(express.json());
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3005', 'http://192.168.0.249:3000'],
    credentials: true,
  };
app.use(cors(corsOptions));
const authRoutes = require('./routes/authRoutes');
const codeRoutes = require('./routes/codeRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/code', codeRoutes);
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}
module.exports = app;
