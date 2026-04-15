import { useState, useEffect } from 'react';
import { api } from '../api';
import EmailCard from '../components/EmailCard';
export default function GmailView() {
  const [emails,setEmails]=useState([]); const [search,setSearch]=useState(''); const [error,setError]=useState('');
  useEffect(()=>{api.getEmails().then(setEmails).catch(e=>setError(e.message));},[]);
  function handleUpdate(id,data){setEmails(prev=>prev.map(e=>e.id===id?{...e,...data}:e));}
  const filtered=emails.filter(e=>!e.is_archived&&(e.subject?.toLowerCase().includes(search.toLowerCase())||e.from_name?.toLowerCase().includes(search.toLowerCase())));
  const unread=filtered.filter(e=>!e.is_read).length;
  return (<div>
    <div className="flex items-center gap-3 mb-6"><span className="w-3 h-3 rounded-full bg-gmail"/><h2 className="text-lg font-semibold">Gmail</h2>{unread>0&&<span className="text-xs font-medium text-white bg-gmail px-2 py-0.5 rounded-full">{unread} non lus</span>}</div>
    <input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher…" className="mb-5 max-w-xs w-full text-sm bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"/>
    {error&&<p className="text-red-400 text-sm mb-4">{error}</p>}
    <div className="flex flex-col gap-3 max-w-2xl">
      {filtered.map(e=><EmailCard key={e.id} email={e} onUpdate={handleUpdate}/>)}
      {!filtered.length&&!error&&<p className="text-gray-600 text-sm">Aucun email — lance un refresh.</p>}
    </div>
  </div>);
}
