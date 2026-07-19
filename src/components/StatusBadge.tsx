import { STATUS_COLORS, STATUS_LABELS, type OrderStatus } from '../types';

export default function StatusBadge({ status, size = 'md' }: { status: OrderStatus; size?: 'sm' | 'md' }) {
  const c = STATUS_COLORS[status];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`badge ${c.bg} ${c.text} ring-1 ring-inset ${c.ring} ${sizeClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
