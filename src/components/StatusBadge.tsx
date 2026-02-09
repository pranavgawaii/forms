import type { FormStatus } from '../types/forms';

const statusStyles: Record<FormStatus, string> = {
  draft: 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm',
  live: 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm',
  closed: 'bg-ink-100 text-ink-700 border border-ink-200',
};

const StatusBadge = ({ status }: { status: FormStatus }) => {
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${statusStyles[status]}`}>
      {status === 'live' && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
      {status}
    </span>
  );
};

export default StatusBadge;
