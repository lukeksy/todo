import { useState, useEffect } from 'react';
import { api } from '../api';
import TaskCard from '../components/TaskCard';
import FilterBar from '../components/FilterBar';
const SORT_OPTS = [{value:'deadline',label:'Échéance'},{value:'projet',label:'Projet'},{value:'priorite',label:'Priorité'}];
export default function BayardView() {
  const [tasks,setTasks]=useState([]); const [search,setSearch]=useState(''); const [sortBy,setSortBy]=useState('deadline'); const [error,setError]=useState('');
  useEffect(()=>{api.getBayard().then(setTasks).catch(e=>setError(e.message));},[]);
  const filtered=tasks.filter(t=>t.title?.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>{
    if(sortBy==='projet') return (a.projet||'').localeCompare(b.projet||'');
    if(sortBy==='priorite') return (a.priorite||'').localeCompare(b.priorite||'');
    return (a.deadline||'9999')<(b.deadline||'9999')?-1:1;
  });
  return (<div>
    <div className="flex items-center gap-3 mb-6"><span className="w-3 h-3 rounded-full bg-bayard"/><h2 className="text-lg font-semibold">Bayard</h2><span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{filtered.length}</span></div>
    <FilterBar search={search} onSearch={setSearch} sortBy={sortBy} onSort={setSortBy} sortOptions={SORT_OPTS}/>
    {error&&<p className="text-red-400 text-sm mb-4">{error}</p>}
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {filtered.map(t=><TaskCard key={t.id} task={t} source="bayard" onUpdate={(id,data)=>api.updateBayard(id,data)}/>)}
      {!filtered.length&&!error&&<p className="text-gray-600 text-sm col-span-3">Aucune tâche — lance un refresh.</p>}
    </div>
  </div>);
}
