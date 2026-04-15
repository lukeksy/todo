import { useState, useEffect } from 'react';
import { api } from '../api';
import TaskCard from '../components/TaskCard';
import FilterBar from '../components/FilterBar';
const SORT_OPTS = [{value:'due',label:'Échéance'},{value:'priority',label:'Priorité'}];
export default function TodoistView() {
  const [tasks,setTasks]=useState([]); const [search,setSearch]=useState(''); const [sortBy,setSortBy]=useState('due'); const [error,setError]=useState('');
  useEffect(()=>{api.getTodoist().then(setTasks).catch(e=>setError(e.message));},[]);
  const filtered=tasks.filter(t=>t.content?.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>{
    if(sortBy==='priority') return (b.priority||0)-(a.priority||0);
    return (a.due_date||a.due_datetime||'9999')<(b.due_date||b.due_datetime||'9999')?-1:1;
  });
  return (<div>
    <div className="flex items-center gap-3 mb-6"><span className="w-3 h-3 rounded-full bg-todoist"/><h2 className="text-lg font-semibold">Todoist</h2><span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{filtered.length}</span></div>
    <FilterBar search={search} onSearch={setSearch} sortBy={sortBy} onSort={setSortBy} sortOptions={SORT_OPTS}/>
    {error&&<p className="text-red-400 text-sm mb-4">{error}</p>}
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {filtered.map(t=><TaskCard key={t.id} task={t} source="todoist" onUpdate={(id,data)=>api.updateTodoist(id,data)}/>)}
      {!filtered.length&&!error&&<p className="text-gray-600 text-sm col-span-3">Aucune tâche — lance un refresh.</p>}
    </div>
  </div>);
}
