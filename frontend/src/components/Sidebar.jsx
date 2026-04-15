const NAV = [
  { id: 'todoist', label: 'Todoist', color: 'bg-todoist', icon: '✔︎' },
  { id: 'telemann', label: 'Telemann', color: 'bg-telemann', icon: '🎵' },
  { id: 'bayard', label: 'Bayard', color: 'bg-bayard', icon: '📚' },
  { id: 'gmail', label: 'Gmail', color: 'bg-gmail', icon: '✉' },
];
export default function Sidebar({ active, onChange }) {
  return (
    <aside className="w-52 bg-gray-900 border-r border-gray-800 flex flex-col py-6 px-3 gap-1 shrink-0">
      <div className="px-3 mb-6"><h1 className="text-lg font-bold tracking-tight text-white">Todo</h1><p className="text-xs text-gray-500">delaale.fr</p></div>
      {NAV.map(({ id, label, color, icon }) => (
        <button key={id} onClick={() => onChange(id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active === id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>
          <span className={`w-2 h-2 rounded-full ${color} shrink-0`} />{icon} {label}
        </button>
      ))}
    </aside>
  );
}
