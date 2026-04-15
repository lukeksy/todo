const express = require('express');
const db = require('../db');
const router = express.Router();

async function n8n(path, body) {
  const r = await fetch(`${process.env.N8N_WEBHOOK_URL}/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`n8n ${r.status}`);
  return r.json().catch(() => ({}));
}

router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT * FROM emails WHERE is_archived = FALSE ORDER BY received_at DESC LIMIT 50`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/read', async (req, res) => {
  try {
    await db.query(`UPDATE emails SET is_read = TRUE WHERE id = $1`, [req.params.id]);
    await n8n('gmail-read', { id: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/archive', async (req, res) => {
  try {
    await db.query(`UPDATE emails SET is_archived = TRUE WHERE id = $1`, [req.params.id]);
    await n8n('gmail-archive', { id: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/reply', async (req, res) => {
  try {
    await n8n('gmail-reply', { id: req.params.id, body: req.body.body });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/ai-reply', async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT * FROM emails WHERE id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    const e = rows[0];
    const result = await n8n('gmail-ai-reply', { id: e.id, thread_id: e.thread_id, from: e.from_address, subject: e.subject, snippet: e.snippet });
    res.json({ ok: true, draft: result.draft || null });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
