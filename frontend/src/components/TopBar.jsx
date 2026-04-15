import { useState } from 'react';
import { api } from '../api';
export default function TopBar({ onRefresh }) {
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState('');
  async function handleSync() {
    setSyncing(true); setMsg('');
    try { await api.sync(); setMsg('Sync en cours…'); setTimeout(() => { onRefresh(); setSyncing(false); setMsg(''); }, 3000); }
    catch { setMsg('Erreur de sync'); setSyncing(false); }
  }
  return (
    <header className="h-14 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6 shrink-0">
      <div className="text-sm text-gray-400">{msg}</div>
      <button onClick={handleSync} disabled={syncing}
        className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium text-white transition-colors disabled:opacity-50">
        <span className={syncing ? 'animate-spin' : ''}>↻</span>{syncing ? 'Synchronisation…' : 'Rafraîchir'}
      </button>
    </header>
  );
}
