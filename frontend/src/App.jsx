import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import TodoistView from './pages/TodoistView';
import TelemannView from './pages/TelemannView';
import BayardView from './pages/BayardView';
import GmailView from './pages/GmailView';

export default function App() {
  const [view, setView] = useState('todoist');
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);
  const views = { todoist: <TodoistView />, telemann: <TelemannView />, bayard: <BayardView />, gmail: <GmailView /> };
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar active={view} onChange={setView} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar onRefresh={refresh} />
        <main key={refreshKey} className="flex-1 overflow-y-auto p-6">{views[view]}</main>
      </div>
    </div>
  );
}
