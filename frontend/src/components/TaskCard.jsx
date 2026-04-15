import { useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
dayjs.locale('fr');
const PL = { 4: 'Urgent', 3: 'Haute', 2: 'Moyenne', 1: 'Normale' };
const PC = { 4: 'bg-red-900/60 text-red-300 border-red-800', 3: 'bg-orange-900/60 text-orange-300 border-orange-800', 2: 'bg-yellow-900/60 text-yellow-300 border-yellow-800', 1: 'bg-gray-800 text-gray-400 border-gray-700' };
export default function TaskCard({ task, source, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [local, setLocal] = useState(task);
  const due = local.due_date || local.due_datetime || local.deadline;
  const overdue = due && dayjs(due).isBefore(dayjs(), 'day');
  const sc = { todoist: 'bg-todoist/20 text-red-300 border-todoist/40', telemann: 'bg-telemann/20 text-violet-300 border-telemann/40', bayard: 'bg-bayard/20 text-blue-300 border-bayard/40' }[source];
  async function save(f, v) { setLocal(l => ({ ...l, [f]: v })); await onUpdate(local.id, { [f]: v }); }
  const title = local.content || local.title || '(sans titre)';
  const project = local.project_name || local.project || local.projet;
  const priority = local.priority || local.priorite;
  return (
    <div onClick={() => setExpanded(e => !e)}
      className={`bg-gray-900 border rounded-xl p-4 cursor-pointer transition-all hover:border-gray-600 ${overdue ? 'border-red-800/60' : 'border-gray-800'}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`font-medium text-sm leading-snug ${overdue ? 'text-red-300' : 'text-gray-100'}`}>{title}</p>
        <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${sc}`}>{source}</span>
          {project && <span className="text-xs px-2 py-0.5 rounded-full border border-gray-700 bg-gray-800 text-gray-400">{project}</span>}
          {priority && typeof priority === 'number' && <span className={`text-xs px-2 py-0.5 rounded-full border ${PC[priority]||PC[1]}`}>{PL[priority]||priority}</span>}
        </div>
      </div>
      {due && <p className={`text-xs mt-1.5 ${overdue ? 'text-red-400 font-medium' : 'text-gray-500'}`}>{overdue?'⚠ ':'📅 '}{dayjs(due).format('D MMM YYYY')}{overdue&&' — En retard'}</p>}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-800 space-y-3" onClick={e => e.stopPropagation()}>
          {local.description && <p className="text-xs text-gray-400 leading-relaxed">{local.description}</p>}
          {local.status && (
            <div className="flex items-center gap-2"><span className="text-xs text-gray-500">Statut :</span>
              <select value={local.status} onChange={e => save('status', e.target.value)} className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200">
                {['Pas commencé','En cours','Terminé'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2"><span className="text-xs text-gray-500">Échéance :</span>
            <input type="date" defaultValue={due ? dayjs(due).format('YYYY-MM-DD') : ''} onBlur={e => save('due_date', e.target.value||null)} className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200" />
          </div>
          {local.notion_url && <a href={local.notion_url} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:underline">Ouvrir dans Notion →</a>}
          {local.url && <a href={local.url} target="_blank" rel="noreferrer" className="text-xs text-red-400 hover:underline">Ouvrir dans Todoist →</a>}
        </div>
      )}
    </div>
  );
}
