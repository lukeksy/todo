const express = require('express');
const db      = require('../db');
const router  = express.Router();

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
