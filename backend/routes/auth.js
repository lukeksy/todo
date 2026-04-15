const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const router  = express.Router();

const COOKIE_NAME = 'todo_token';
const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV !== 'development',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000,
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  if (email.toLowerCase() !== process.env.AUTH_EMAIL?.toLowerCase())
    return res.status(401).json({ error: 'Identifiants invalides' });
  const valid = await bcrypt.compare(password, process.env.AUTH_PASSWORD_HASH || '');
  if (!valid)
    return res.status(401).json({ error: 'Identifiants invalides' });
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ email: payload.email });
  } catch {
    res.clearCookie(COOKIE_NAME);
    res.status(401).json({ error: 'Session expirée' });
  }
});

module.exports = router;
