export const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  approve: 'bg-emerald-100 text-emerald-800',
  reject: 'bg-orange-100 text-orange-800',
  status_change: 'bg-yellow-100 text-yellow-800',
  lock: 'bg-gray-100 text-gray-800',
  unlock: 'bg-teal-100 text-teal-800',
  assign: 'bg-purple-100 text-purple-800',
  dispatch: 'bg-indigo-100 text-indigo-800',
  login: 'bg-sky-100 text-sky-800',
  register: 'bg-lime-100 text-lime-800',
  logout: 'bg-slate-100 text-slate-800',
};

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
