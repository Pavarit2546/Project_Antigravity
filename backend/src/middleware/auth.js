import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';

export function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
