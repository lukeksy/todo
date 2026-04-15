import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
dayjs.locale('fr');

const PRIORITY_LABEL = { 4: 'Urgent', 3: 'Haute', 2: 'Moyenne', 1: 'Normale' };
const PRIORITY_COLOR = {
  4: 'bg-red-900/60 text-red-300 border-red-800',
  3: 'bg-orange-900/60 text-orange-300 border-orange-800',
  2: 'bg-yellow-900/60 text-yellow-300 border-yellow-800',
  1: 'bg-gray-800 text-gray-400 border-gray-700',
};
const SOURCE_COLOR = {
  todoist:  'bg-todoist/20 text-red-300 border-todoist/40',
  telemann: 'bg-telemann/20 text-violet-300 border-telemann/40',
  bayard:   'bg-bayard/20 text-blue-300 border-bayard/40',
};

function EditableTitle({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function handleKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = draft.trim();
      if (trimmed && trimmed !== value) onSave(trimmed);
      setEditing(false);
    }
    if (e.key === 'Escape') {
      setDraft(value);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => { setDraft(value); setEditing(false); }}
        className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-sm
                   text-gray-100 focus:outline-none focus:border-gray-400"
        onClick={e => e.stopPropagation()}
      />
    );
  }

  return (
    <p
      className="font-medium text-sm leading-snug text-gray-100 cursor-text hover:text-white
                 hover:underline decoration-dashed underline-offset-2"
      onClick={e => { e.stopPropagation(); setEditing(true); }}
      title="Cliquer pour modifier"
    >
      {value}
    </p>
  );
}

export default function TaskCard({ task, source, onUpdate }) {
  const [expanded,  setExpanded]  = useState(false);
  const [localTask, setLocalTask] = useState(task);
  const [saving,    setSaving]    = useState('');

  const due     = localTask.due_date || localTask.due_datetime || localTask.deadline;
  const overdue = due && dayjs(due).isBefore(dayjs(), 'day');

  const labels = (() => {
    const raw = localTask.labels;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return []; }
  })();

  const project  = localTask.project_name || localTask.project || localTask.projet;
  const priority = localTask.priority;
  const status   = localTask.status;
  const title    = localTask.content || localTask.title || '(sans titre)';

  async function save(field, value) {
    setSaving(field);
    setLocalTask(l => ({ ...l, [field]: value }));
    try { await onUpdate(localTask.id, { [field]: value }); }
    finally { setSaving(''); }
  }

  async function saveTitle(newTitle) {
    const field = source === 'todoist' ? 'content' : 'title';
    setSaving('title');
    setLocalTask(l => ({ ...l, [field]: newTitle }));
    try { await onUpdate(localTask.id, { [field]: newTitle }); }
    finally { setSaving(''); }
  }

  return (
    <div
      className={`bg-gray-900 border rounded-xl p-4 transition-all
        ${overdue ? 'border-red-800/60' : 'border-gray-800'}
        ${expanded ? '' : 'hover:border-gray-700 cursor-pointer'}`}
      onClick={() => !expanded && setExpanded(true)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <EditableTitle value={title} onSave={saveTitle} />
          {saving === 'title' && (
            <span className="text-xs text-gray-500 mt-0.5 block">Enregistrement…</span>
          )}
        </div>
        <div className="flex gap-1.5 shrink-0 flex-wrap justify-end items-start">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${SOURCE_COLOR[source]}`}>{source}</span>
          {project && <span className="text-xs px-2 py-0.5 rounded-full border border-gray-700 bg-gray-800 text-gray-400">{project}</span>}
          {priority && typeof priority === 'number' && priority > 1 && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_COLOR[priority] || PRIORITY_COLOR[1]}`}>
              {PRIORITY_LABEL[priority] || priority}
            </span>
          )}
          {labels.map(label => (
            <span key={label} className="text-xs px-2 py-0.5 rounded-full border border-gray-700 bg-gray-800/50 text-gray-400">
              {label}
            </span>
          ))}
        </div>
      </div>

      {due && (
        <p className={`text-xs mt-1.5 ${overdue ? 'text-red-400 font-medium' : 'text-gray-500'}`}>
          {overdue ? '⚠ ' : '📅 '}{dayjs(due).format('D MMM YYYY')}{overdue && ' — En retard'}
        </p>
      )}

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-800 space-y-3" onClick={e => e.stopPropagation()}>
          {localTask.description && <p className="text-xs text-gray-400 leading-relaxed">{localTask.description}</p>}

          {status !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-16 shrink-0">Statut</span>
              <select value={status || ''} onChange={e => save('status', e.target.value)} disabled={saving === 'status'}
                className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200 disabled:opacity-50">
                {source === 'todoist'
                  ? ['En cours', 'Terminé'].map(s => <option key={s}>{s}</option>)
                  : ['Pas commencé', 'En cours', 'Terminé'].map(s => <option key={s}>{s}</option>)
                }
              </select>
              {saving === 'status' && <span className="text-xs text-gray-500">…</span>}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16 shrink-0">Échéance</span>
            <input type="date" defaultValue={due ? dayjs(due).format('YYYY-MM-DD') : ''}
              onBlur={e => save(source === 'todoist' ? 'due_date' : 'deadline', e.target.value || null)}
              className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200" />
          </div>

          <div className="flex gap-3">
            {localTask.notion_url && <a href={localTask.notion_url} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:underline">Ouvrir dans Notion →</a>}
            {localTask.url && <a href={localTask.url} target="_blank" rel="noreferrer" className="text-xs text-red-400 hover:underline">Ouvrir dans Todoist →</a>}
          </div>

          <button onClick={() => setExpanded(false)} className="text-xs text-gray-600 hover:text-gray-400">↑ Réduire</button>
        </div>
      )}
    </div>
  );
}
