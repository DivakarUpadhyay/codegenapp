const express = require('express');
const { login, logout, validateSession } = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/validate', validateSession);
module.exports = router;
