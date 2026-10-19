import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password || username.length < 3 || password.length < 6) {
    return res.status(400).json({ error: 'Username (3+ chars) and password (6+ chars) are required' });
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  db.run(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)',
    [username, passwordHash],
    function (err) {
      if (err) {
        if (String(err.message).includes('UNIQUE')) {
          return res.status(409).json({ error: 'Username already taken' });
        }
        return res.status(500).json({ error: 'Registration failed' });
      }
      const user = { id: this.lastID, username };
      res.status(201).json({ token: signToken(user), user });
    }
  );
});

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) return res.status(500).json({ error: 'Login failed' });
    if (!row || !bcrypt.compareSync(password, row.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = { id: row.id, username: row.username };
    res.json({ token: signToken(user), user });
  });
});

export default router;
