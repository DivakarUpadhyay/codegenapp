const jwt = require('jsonwebtoken');
require('dotenv').config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const generateTokens = (user) => {
    const accessToken = jwt.sign({ UserID: user.UserID, RoleID: user.RoleID,Username:user.UserName }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ UserID:user.UserID, RoleID: user.RoleID,Username:user.UserName}, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  };

  module.exports = { generateTokens };