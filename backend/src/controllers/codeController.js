const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const registerUser = async (req, res) => {
  try {
    const { RoleID, FirstName, LastName, EmailID } = req.body;
    if (!RoleID) return res.status(422).json({ message: 'Please Select Role' });
    if (!FirstName) return res.status(422).json({ message: 'Please Enter First Name' });
    if (!LastName) return res.status(422).json({ message: 'Please Enter Last Name' });
    if (!EmailID) return res.status(422).json({ message: 'Email Id is required' });

    const existing = await pool.query('SELECT 1 FROM users WHERE email_id = $1', [EmailID]);
    if (existing.rows.length > 0) return res.status(409).json({ message: 'User already exists' });

    const NewPassword = () => {
      const count = Math.min(LastName.length, 5);
      const numberPart = Array.from({ length: count }, (_, i) => i + 1).join('');
      return `${FirstName}@${numberPart}`;
    };
    const password = NewPassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const suffix = Math.floor(Math.random() * 1000);
    const username = `${FirstName.slice(0, 2)}${LastName.slice(0, 2)}${suffix}`;

    await pool.query(
      `INSERT INTO users (role_id, first_name, last_name, username, password_hash, email_id, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW())`,
      [RoleID, FirstName, LastName, username, hashedPassword, EmailID]
    );
    return res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const resetCredentials = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(422).json({ message: 'Email Id is required' });
    if (!password) return res.status(422).json({ message: 'New Password is required' });

    const existing = await pool.query('SELECT 1 FROM users WHERE email_id = $1', [email]);
    if (existing.rows.length === 0) return res.status(404).json({ status: false, message: 'User does not exist' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await pool.query('UPDATE users SET password_hash = $1 WHERE email_id = $2', [hashedPassword, email]);
    return res.status(200).json({ status: true, message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ status: false, message: 'Internal server error: ' + error.message });
  }
};

const checkEmailExistence = async (req, res) => {
  try {
    const { EmailID } = req.query;
    if (!EmailID) return res.status(400).json({ message: 'Email Id is required' });

    const result = await pool.query(
      `SELECT user_id AS "UserID", username AS "Username", email_id AS "EmailID"
       FROM users WHERE email_id = $1`,
      [EmailID]
    );
    if (result.rows.length === 0) return res.status(404).json({ status: false, message: 'Email ID does not exist' });
    return res.status(200).json({ status: true, userdata: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id AS "UserID", u.first_name AS "FirstName", u.last_name AS "LastName",
              u.username AS "Username", u.email_id AS "EmailID", r.role_name AS "RoleName",
              TO_CHAR(u.created_at, 'DD/MM/YYYY HH24:MI:SS') AS "CreatedDate",
              TO_CHAR(u.last_login, 'DD/MM/YYYY HH24:MI:SS') AS "LastLoginDateAndTime",
              CASE WHEN u.is_active THEN 'Active' ELSE 'Inactive' END AS "UserStatus",
              u.is_active AS "IsActive"
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       ORDER BY u.user_id DESC`
    );
    return res.status(200).json({ success: true, user: result.rows });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { userId, isActive } = req.body;
    const result = await pool.query(
      `UPDATE users SET is_active = $1 WHERE user_id = $2
       RETURNING user_id AS "UserID", first_name AS "FirstName", username AS "Username",
                 email_id AS "EmailID", is_active AS "IsActive"`,
      [isActive, userId]
    );
    if (result.rows.length > 0) {
      const { Username, IsActive: ActiveStatus } = result.rows[0];
      return res.status(200).json({
        success: true,
        message: ActiveStatus ? 'User activated successfully' : 'User deactivated successfully',
        Username
      });
    }
    return res.status(500).json({ success: false, message: isActive ? 'User activation failed' : 'User deactivation failed' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
};

const toggleCodeStatus = async (req, res) => {
  try {
    const { codeId, IsUsed } = req.body;
    const result = await pool.query(
      `UPDATE code_storage SET is_used = $1 WHERE code_id = $2
       RETURNING code_id AS "CodeId", code AS "Code", created_date AS "CreatedDate", is_used AS "isUsed"`,
      [IsUsed, codeId]
    );
    if (result.rows.length > 0) {
      const { isUsed } = result.rows[0];
      return res.status(200).json({ success: true, message: isUsed ? 'Code marked as used' : 'Code marked as unused' });
    }
    return res.status(500).json({ success: false, message: 'Failed to update code status' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
  }
};

const addRemark = async (req, res) => {
  try {
    const { id, UserId, remarks } = req.body;
    if (!remarks) return res.status(400).json({ message: 'Please fill remarks' });
    if (!id) return res.status(400).json({ message: 'CodeId is required' });

    const roleResult = await pool.query('SELECT role_id FROM users WHERE user_id = $1', [UserId]);
    const roleId = roleResult.rows[0]?.role_id;

    await pool.query(
      `UPDATE code_storage
       SET admin_remarks = CASE WHEN $1 = 1 THEN $2 ELSE admin_remarks END,
           user_remarks  = CASE WHEN $1 != 1 THEN $2 ELSE user_remarks END
       WHERE code_id = $3`,
      [roleId, remarks, id]
    );
    return res.status(200).json({ success: true, message: 'Remark added successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const generateCode = async (req, res) => {
  try {
    const { userid } = req.body;
    if (!userid) return res.status(400).json({ message: 'UserId is required' });
    const code = await generateUniqueCode();
    await pool.query(
      `INSERT INTO code_storage (user_id, code, created_date, is_used, user_remarks, admin_remarks)
       VALUES ($1, $2, NOW(), false, NULL, NULL)`,
      [userid, code]
    );
    return res.status(201).json({ success: true, code });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

const getUserCodes = async (req, res) => {
  try {
    const { userid } = req.query;
    if (!userid) return res.status(400).json({ message: 'UserId is required' });
    const result = await pool.query(
      `SELECT cs.code_id AS "CodeId", cs.user_id AS "UserId", u.first_name AS "FirstName", u.last_name AS "LastName",
              CASE WHEN u.role_id = 1 THEN 'Admin' ELSE 'User' END AS "Role",
              u.role_id AS "RoleID",
              CONCAT(u.first_name, '  ', u.last_name) AS "UserFullName",
              u.username AS "Username", u.email_id AS "EmailID", cs.code AS "Code",
              CASE WHEN cs.is_used THEN 'Code Used' ELSE 'Code Unused' END AS "CodeStatus",
              TO_CHAR(cs.created_date, 'DD/MM/YYYY HH24:MI:SS') AS "CreatedDate",
              cs.is_used AS "IsUsed", cs.user_remarks AS "UserRemarks", cs.admin_remarks AS "AdminRemarks"
       FROM code_storage cs
       JOIN users u ON cs.user_id = u.user_id
       WHERE cs.user_id = $1
       ORDER BY cs.code_id DESC`,
      [userid]
    );
    return res.status(200).json({ success: true, codes: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

const getAllCodes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cs.code_id AS "CodeId", u.role_id AS "RoleID", cs.user_id AS "UserId", cs.code AS "Code",
              TO_CHAR(cs.created_date, 'DD/MM/YYYY HH24:MI:SS') AS "CreatedDate",
              cs.is_used AS "IsUsed", cs.user_remarks AS "UserRemarks", cs.admin_remarks AS "AdminRemarks",
              u.username AS "Username", u.first_name AS "FirstName", u.last_name AS "LastName",
              CONCAT(u.first_name, '  ', u.last_name) AS "UserFullName",
              u.email_id AS "EmailID",
              CASE WHEN cs.is_used THEN 'Code Used' ELSE 'Code Unused' END AS "CodeStatus"
       FROM code_storage cs
       JOIN users u ON cs.user_id = u.user_id
       ORDER BY cs.code_id DESC`
    );
    return res.status(200).json({ success: true, codes: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

// generates a 5-digit code with all unique digits, then checks DB for duplicates
const generateUniqueCode = async () => {
  let code;
  let isUnique = false;
  const hasRepeatedDigits = (num) => {
    const numStr = num.toString();
    return new Set(numStr).size !== numStr.length;
  };
  while (!isUnique) {
    code = Math.floor(10000 + Math.random() * 90000);
    if (hasRepeatedDigits(code)) continue;
    const result = await pool.query('SELECT 1 FROM code_storage WHERE code = $1', [code]);
    if (result.rows.length === 0) isUnique = true;
  }
  return code;
};

const getRoles = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 0 AS id, 'Select Role' AS name
       UNION ALL
       SELECT role_id AS id, role_name AS name FROM roles`
    );
    return res.status(200).json({ success: true, roleslist: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

module.exports = { registerUser, resetCredentials, checkEmailExistence, getUser, toggleUserStatus, toggleCodeStatus, generateCode, getUserCodes, addRemark, getAllCodes, getRoles };
