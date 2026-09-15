const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  const user = await db('users').where('username', username).orWhere('email', username).first();

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    message: 'Login successful.',
    token,
    user: { id: user.id, username: user.username, email: user.email }
  });
};

const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};

const me = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { login, logout, me };
