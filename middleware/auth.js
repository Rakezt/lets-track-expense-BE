const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async function auth(req, res, next) {
  const header = req.header('Authorization') || '';
  const token = header.replace('Bearer', '').trim();
  if (!token) return res.status(401).json({ error: 'No Token Provided' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token verification failed' });
  }
};
