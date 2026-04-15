import { useState } from 'react';
import dayjs from 'dayjs';
import { api } from '../api';
export default function EmailCard({ email, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [aiDraft, setAiDraft] = useState('');
  const [loading, setLoading] = useState('');
  const [local, setLocal] = useState(email);
  async function act(action) {
    setLoading(action);
    try {
      if (action==='read') { await api.markRead(local.id); setLocal(e=>({...e,is_read:true})); onUpdate?.(local.id,{is_read:true}); }
      else if (action==='archive') { await api.archiveEmail(local.id); onUpdate?.(local.id,{is_archived:true}); }
      else if (action==='reply') { await api.replyEmail(local.id,replyText); setReplyText(''); setExpanded(false); }
      else if (action==='ai') { const r=await api.aiReplyEmail(local.id); setAiDraft(r.draft||'Brouillon créé dans Gmail.'); }
    } catch(e){console.error(e);} finally{setLoading('');}
  }
  if (local.is_archived) return null;
  return (
    <div className={`bg-gray-900 border rounded-xl p-4 transition-all ${local.is_read?'border-gray-800':'border-gmail/40'}`}>
      <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={()=>setExpanded(e=>!e)}>
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate ${local.is_read?'text-gray-300':'text-white'}`}>{local.subject||'(sans objet)'}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{local.from_name||local.from_address}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!local.is_read&&<span className="w-2 h-2 rounded-full bg-gmail shrink-0"/>}
          <span className="text-xs text-gray-600">{dayjs(local.received_at).format('D MMM')}</span>
        </div>
      </div>
      {!expanded&&local.snippet&&<p className="text-xs text-gray-600 mt-1.5 truncate">{local.snippet}</p>}
      {expanded&&(
        <div className="mt-3 pt-3 border-t border-gray-800 space-y-3" onClick={e=>e.stopPropagation()}>
          {local.snippet&&<p className="text-xs text-gray-400 leading-relaxed">{local.snippet}</p>}
          <div className="flex gap-2 flex-wrap">
            {!local.is_read&&<button onClick={()=>act('read')} disabled={!!loading} className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300">✓ Marquer lu</button>}
            <button onClick={()=>act('archive')} disabled={!!loading} className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300">📦 Archiver</button>
            <button onClick={()=>act('ai')} disabled={!!loading} className="text-xs px-3 py-1.5 rounded-lg bg-violet-900/50 hover:bg-violet-900/80 text-violet-300 border border-violet-800/50">{loading==='ai'?'…':'✨ Répondre avec IA'}</button>
          </div>
          {aiDraft&&<div className="bg-violet-950/40 border border-violet-800/40 rounded-lg p-3"><p className="text-xs text-violet-300 font-medium mb-1">Brouillon IA</p><p className="text-xs text-gray-400 whitespace-pre-wrap">{aiDraft}</p></div>}
          <div className="space-y-2">
            <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Votre réponse…" rows={3}
              className="w-full text-xs bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-gray-500"/>
            <button onClick={()=>act('reply')} disabled={!replyText.trim()||!!loading} className="text-xs px-4 py-1.5 rounded-lg bg-gmail/80 hover:bg-gmail text-white disabled:opacity-40">{loading==='reply'?'Envoi…':'Envoyer'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
