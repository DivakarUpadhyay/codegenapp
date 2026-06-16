const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { validateLogin } = require("../utils/validation");
const { generateTokens } = require("../utils/tokenUtils");

const login = async (req, res) => {
  const { username, password } = req.body;
  const isEmail = username.includes("@");
  if (isEmail) {
    const validationResult = validateLogin(username, password);
    if (!validationResult.isValid) {
      return res.status(400).json({ message: validationResult.message });
    }
  }
  try {
    const result = await pool.query(
      `SELECT user_id AS "UserID", role_id AS "RoleID", username AS "UserName",
              email_id AS "EmailID", password_hash AS "PasswordHash", is_active AS "IsActive"
       FROM users
       WHERE is_active = true AND (email_id = $1 OR username = $1)`,
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(204).json({ message: "User does not exists in system" });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const { accessToken, refreshToken } = generateTokens(user);
    await pool.query("UPDATE users SET last_login = NOW() WHERE user_id = $1", [user.UserID]);
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
    });
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
    });
    res.json({ message: "Login successful" });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Login failed due to error", error: error.message || error });
  }
};

const validateSession = async (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ authenticated: false });
  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.json({ authenticated: true, user });
  } catch {
    res.status(401).json({ authenticated: false });
  }
};

const logout = async (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
  });
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
  });
  res.json({ status: 200, message: "Logged out" });
};

module.exports = { login, validateSession, logout };
