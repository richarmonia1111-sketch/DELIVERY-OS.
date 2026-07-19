import type { Order, TimelineEntry } from '../types';
import { STATUS_COLORS, STATUS_LABELS } from '../types';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function OrderTimeline({ order }: { order: Order }) {
  const entries = order.timeline;
  const isCancelled = order.status === 'cancelado';

  return (
    <div className="flow-root">
      <ul className="space-y-0">
        {entries.map((entry: TimelineEntry, idx) => {
          const isLast = idx === entries.length - 1;
          const isCancelledEntry = entry.status === 'cancelado';
          return (
            <li key={idx} className="relative pb-5 last:pb-0">
              {!isLast && (
                <span
                  className={`absolute left-[11px] top-5 h-full w-0.5 ${isCancelledEntry ? 'bg-red-200' : 'bg-bici-primary-200'}`}
                  aria-hidden
                />
              )}
              <div className="flex items-start gap-3">
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isCancelledEntry ? 'bg-red-100' : 'bg-bici-primary-100'}`}>
                  {isCancelledEntry ? (
                    <XCircle className="h-3.5 w-3.5 text-red-600" />
                  ) : isLast && !isCancelled ? (
                    <Clock className="h-3.5 w-3.5 text-bici-primary-600" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-bici-primary-600" />
                  )}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium text-slate-900">{entry.label}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(entry.timestamp).toLocaleString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {entry.note && entry.note !== entry.label && (
                    <p className="mt-0.5 text-xs text-slate-500">{entry.note}</p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {isCancelled && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          <XCircle className="h-4 w-4" />
          Este pedido fue cancelado
        </div>
      )}
    </div>
  );
}

export function StatusFlowIndicator({ currentStatus }: { currentStatus: Order['status'] }) {
  const flow: Order['status'][] = ['solicitado', 'confirmado', 'en_compra', 'listo', 'en_camino', 'entregado'];
  const currentIdx = flow.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-1">
      {flow.map((s, idx) => {
        const done = idx <= currentIdx && currentStatus !== 'cancelado';
        const isCurrent = idx === currentIdx && currentStatus !== 'cancelado';
        const c = STATUS_COLORS[s];
        return (
          <div key={s} className="flex items-center gap-1">
            {idx > 0 && <div className={`h-0.5 w-3 ${done && idx <= currentIdx ? 'bg-bici-primary-400' : 'bg-slate-200'}`} />}
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${
                isCurrent ? `${c.bg} ${c.text} ${c.ring}` : done ? 'bg-bici-primary-50 text-bici-primary-700 ring-bici-primary-200' : 'bg-slate-50 text-slate-400 ring-slate-200'
              }`}
            >
              {done && <CheckCircle2 className="h-2.5 w-2.5" />}
              {STATUS_LABELS[s]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
