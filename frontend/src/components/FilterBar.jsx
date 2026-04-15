export default function FilterBar({ search, onSearch, sortBy, onSort, sortOptions }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <input type="search" value={search} onChange={e => onSearch(e.target.value)} placeholder="Rechercher…"
        className="flex-1 max-w-xs text-sm bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600" />
      <select value={sortBy} onChange={e => onSort(e.target.value)}
        className="text-sm bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-400">
        {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
