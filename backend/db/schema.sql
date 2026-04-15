-- todo_app schema
CREATE DATABASE todo_app;
\c todo_app;

CREATE TABLE IF NOT EXISTS todoist_tasks (
  id TEXT PRIMARY KEY, content TEXT NOT NULL, description TEXT,
  due_date DATE, due_datetime TIMESTAMPTZ, priority INTEGER DEFAULT 1,
  project_id TEXT, project_name TEXT, labels JSONB DEFAULT '[]',
  is_completed BOOLEAN DEFAULT FALSE, url TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telemann_tasks (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, status TEXT,
  deadline DATE, project TEXT, priority TEXT, notion_url TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bayard_tasks (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, status TEXT,
  deadline DATE, projet TEXT, priorite TEXT, notion_url TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY, thread_id TEXT, from_address TEXT, from_name TEXT,
  subject TEXT, snippet TEXT, received_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT FALSE, is_archived BOOLEAN DEFAULT FALSE,
  labels JSONB DEFAULT '[]', synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sync_log (
  id SERIAL PRIMARY KEY, triggered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT, message TEXT
);
