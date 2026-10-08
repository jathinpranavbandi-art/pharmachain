const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cfg = require('../config');
const users = require('../config/users');
const { httpError } = require('../utils/validate');

exports.login = async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password)
    throw httpError(400, 'Username and password are required');
  const u = users.find((x) => x.username === username.trim().toLowerCase());
  if (!u || !bcrypt.compareSync(password, u.passwordHash)) throw httpError(401, 'Invalid username or password');
  const user = { username: u.username, role: u.role, org: u.org, name: u.name };
  const token = jwt.sign(user, cfg.jwtSecret, { expiresIn: cfg.jwtExpires });
  res.json({ token, user });
};
