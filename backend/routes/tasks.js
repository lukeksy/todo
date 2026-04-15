const express = require('express');
const db      = require('../db');
const router  = express.Router();

async function n8n(path, body) {
  const url = `${process.env.N8N_WEBHOOK_URL}/${path}`;
  const r = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`n8n ${r.status}`);
  return r.json().catch(() => ({}));
}

router.get('/todoist', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM todoist_tasks WHERE is_completed = FALSE ORDER BY
        CASE WHEN due_datetime IS NOT NULL THEN due_datetime
             WHEN due_date IS NOT NULL THEN due_date::timestamptz
             ELSE '9999-12-31'::timestamptz END ASC,
        priority DESC`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/todoist/:id', async (req, res) => {
  const { id } = req.params;
  const { priority, due_date, is_completed, content } = req.body;
  try {
    await db.query(
      `UPDATE todoist_tasks SET
        priority     = COALESCE($1, priority),
        due_date     = COALESCE($2, due_date),
        is_completed = COALESCE($3, is_completed),
        content      = COALESCE($4, content),
        updated_at   = NOW()
       WHERE id = $5`,
      [priority, due_date, is_completed, content, id]
    );
    await n8n('todoist-update', { id, priority, due_date, is_completed, content });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/telemann', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM telemann_tasks WHERE status != 'Termin\u00e9'
       ORDER BY deadline ASC NULLS LAST`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/telemann/:id', async (req, res) => {
  const { id } = req.params;
  const { status, priority, deadline, title } = req.body;
  try {
    await db.query(
      `UPDATE telemann_tasks SET
        status     = COALESCE($1, status),
        priority   = COALESCE($2, priority),
        deadline   = COALESCE($3, deadline),
        title      = COALESCE($4, title),
        updated_at = NOW()
       WHERE id = $5`,
      [status, priority, deadline, title, id]
    );
    await n8n('notion-update', { id, source: 'telemann', status, priority, deadline, title });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/bayard', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM bayard_tasks WHERE status != 'Termin\u00e9'
       ORDER BY deadline ASC NULLS LAST`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/bayard/:id', async (req, res) => {
  const { id } = req.params;
  const { status, priorite, deadline, title } = req.body;
  try {
    await db.query(
      `UPDATE bayard_tasks SET
        status     = COALESCE($1, status),
        priorite   = COALESCE($2, priorite),
        deadline   = COALESCE($3, deadline),
        title      = COALESCE($4, title),
        updated_at = NOW()
       WHERE id = $5`,
      [status, priorite, deadline, title, id]
    );
    await n8n('notion-update', { id, source: 'bayard', status, priorite, deadline, title });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/upsert', async (req, res) => {
  const { source, items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'items must be an array' });
  }
  try {
    if (source === 'todoist') {
      for (const t of items) {
        await db.query(
          `INSERT INTO todoist_tasks
             (id, content, description, due_date, due_datetime, priority,
              project_id, project_name, labels, is_completed, url, synced_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
           ON CONFLICT (id) DO UPDATE SET
             content=EXCLUDED.content, description=EXCLUDED.description,
             due_date=EXCLUDED.due_date, due_datetime=EXCLUDED.due_datetime,
             priority=EXCLUDED.priority, project_name=EXCLUDED.project_name,
             labels=EXCLUDED.labels, is_completed=EXCLUDED.is_completed,
             synced_at=NOW()`,
          [t.id, t.content, t.description, t.due_date, t.due_datetime,
           t.priority, t.project_id, t.project_name,
           JSON.stringify(t.labels || []),
           t.is_completed || false, t.url]
        );
      }
    } else if (source === 'telemann') {
      for (const t of items) {
        await db.query(
          `INSERT INTO telemann_tasks
             (id, title, status, deadline, project, priority, notion_url, synced_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
           ON CONFLICT (id) DO UPDATE SET
             title=EXCLUDED.title, status=EXCLUDED.status,
             deadline=EXCLUDED.deadline, project=EXCLUDED.project,
             priority=EXCLUDED.priority, synced_at=NOW()`,
          [t.id, t.title, t.status, t.deadline || null,
           t.project, t.priority, t.notion_url]
        );
      }
    } else if (source === 'bayard') {
      for (const t of items) {
        await db.query(
          `INSERT INTO bayard_tasks
             (id, title, status, deadline, projet, priorite, notion_url, synced_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
           ON CONFLICT (id) DO UPDATE SET
             title=EXCLUDED.title, status=EXCLUDED.status,
             deadline=EXCLUDED.deadline, projet=EXCLUDED.projet,
             priorite=EXCLUDED.priorite, synced_at=NOW()`,
          [t.id, t.title, t.status, t.deadline || null,
           t.projet, t.priorite, t.notion_url]
        );
      }
    } else if (source === 'emails') {
      for (const e of items) {
        await db.query(
          `INSERT INTO emails
             (id, thread_id, from_address, from_name, subject,
              snippet, received_at, is_read, labels, synced_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
           ON CONFLICT (id) DO UPDATE SET
             subject=EXCLUDED.subject, snippet=EXCLUDED.snippet,
             is_read=EXCLUDED.is_read, labels=EXCLUDED.labels,
             synced_at=NOW()`,
          [e.id, e.thread_id, e.from_address, e.from_name, e.subject,
           e.snippet, e.received_at, e.is_read || false,
           JSON.stringify(e.labels || [])]
        );
      }
    }
    res.json({ ok: true, upserted: items.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
