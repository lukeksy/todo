import { useState, useEffect, useCallback } from 'react';
import Sidebar      from './components/Sidebar';
import TopBar       from './components/TopBar';
import LoginPage    from './pages/LoginPage';
import TodoistView  from './pages/TodoistView';
import TelemannView from './pages/TelemannView';
import BayardView   from './pages/BayardView';
import GmailView    from './pages/GmailView';

export default function App() {
  const [auth,       setAuth]       = useState(null);
  const [view,       setView]       = useState('todoist');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => setAuth(r.ok))
      .catch(() => setAuth(false));
  }, []);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setAuth(false);
  }

  if (auth === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!auth) return <LoginPage onLogin={() => setAuth(true)} />;

  const views = {
    todoist:  <TodoistView />,
    telemann: <TelemannView />,
    bayard:   <BayardView />,
    gmail:    <GmailView />,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar active={view} onChange={setView} onLogout={handleLogout} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar onRefresh={refresh} />
        <main key={refreshKey} className="flex-1 overflow-y-auto p-6">{views[view]}</main>
      </div>
    </div>
  );
}
