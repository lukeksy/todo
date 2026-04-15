const express = require('express');
const db = require('../db');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    await db.query(`INSERT INTO sync_log (status, message) VALUES ('running', 'Manuel')`);
    const r = await fetch(`${process.env.N8N_WEBHOOK_URL}/sync-todo`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ triggered_by: 'frontend' })
    });
    if (!r.ok) throw new Error(`n8n ${r.status}`);
    res.json({ ok: true });
  } catch (e) {
    await db.query(`INSERT INTO sync_log (status, message) VALUES ('error', $1)`, [e.message]);
    res.status(500).json({ error: e.message });
  }
});

router.get('/last', async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT * FROM sync_log ORDER BY triggered_at DESC LIMIT 1`);
    res.json(rows[0] || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
