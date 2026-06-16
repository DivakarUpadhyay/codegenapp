// Route definitions for code management features
const express = require('express');
const { verifyAccessToken } = require('../middleware/authMiddleware');
const {
  registerUser,
  resetCredentials,
  checkEmailExistence,
  getUser,
  toggleUserStatus,
  toggleCodeStatus,
  generateCode,
  getUserCodes,
  addRemark,
  getAllCodes,
  getRoles
} = require('../controllers/codeController');
const router = express.Router();

// User management
router.get('/getRoles', verifyAccessToken, getRoles);
router.get('/getUser', verifyAccessToken, getUser);
router.post('/registerUser', verifyAccessToken, registerUser);
router.put('/toggleUserStatus', verifyAccessToken, toggleUserStatus);

// Code list — admin only
router.get('/getAllCodes', verifyAccessToken, getAllCodes);
router.put('/toggleCodeStatus', verifyAccessToken, toggleCodeStatus);

// Code generation — per user
router.get('/getCodes', verifyAccessToken, getUserCodes);
router.post('/generateCode', verifyAccessToken, generateCode);

// Remarks
router.post('/addRemark', verifyAccessToken, addRemark);

// Password reset — no auth required
router.get('/checkEmailExistence', checkEmailExistence);
router.post('/resetCredentials', resetCredentials);

// Note: toggleCodeStatus is used in both GenerateCode and AllCodeList views
module.exports = router;
