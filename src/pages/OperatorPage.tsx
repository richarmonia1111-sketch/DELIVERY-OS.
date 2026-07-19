import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, X, Bike, Store, Clock, Phone, MapPin, TriangleAlert as AlertTriangle, ChevronRight } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { useStore, useAutoplay } from '../store';
import { STATUS_FLOW, STATUS_LABELS, STATUS_COLORS, nextStatus, type Order } from '../types';

function OrderCard({ order, onAdvance, onCancel, onAssign }: {
  order: Order;
  onAdvance: (id: string) => void;
  onCancel: (id: string) => void;
  onAssign: (orderId: string, driverId: string) => void;
}) {
  const { drivers } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const driver = drivers.find((d) => d.id === order.driverId);
  const nxt = nextStatus(order.status);
  const isCancelled = order.status === 'cancelado';
  const isDone = order.status === 'entregado';

  return (
    <div className={`card overflow-hidden ${isCancelled ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-slate-900">{order.code}</span>
              <span className={`badge ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
            </div>
            <p className="text-xs text-slate-500">{order.customerName} · {order.customerPhone}</p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100">
          <ChevronRight className={`h-5 w-5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-4">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-400">Dirección</p>
                <p className="text-slate-700">{order.address}</p>
                {order.reference && <p className="text-xs text-slate-400">Ref: {order.reference}</p>}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-400">Teléfono</p>
                <p className="text-slate-700">{order.customerPhone}</p>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium text-slate-400">Notas</p>
            <p className="mt-0.5 text-sm text-slate-700">{order.notes}</p>
          </div>
          {order.establishments.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-slate-400">Establecimientos</p>
              <p className="mt-0.5 text-sm text-slate-700">{order.establishments.join(', ')}</p>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">Costo del servicio</span>
            <span className="font-display text-sm font-bold text-bici-primary-700">${order.cost}</span>
          </div>

          {driver && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <Bike className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-700">Repartidor: <strong>{driver.name}</strong></span>
            </div>
          )}

          {order.incident && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-sm">{order.incident}</span>
            </div>
          )}

          {/* Timeline */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-slate-400">Línea de tiempo</p>
            <div className="space-y-2">
              {order.timeline.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full ${STATUS_COLORS[t.status]}`}>
                    {i + 1}
                  </div>
                  <span className="text-slate-600">{t.label}</span>
                  <span className="ml-auto text-slate-400">{new Date(t.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {!isCancelled && !isDone && (
            <div className="mt-4 flex flex-wrap gap-2">
              {nxt && (
                <button onClick={() => onAdvance(order.id)} className="btn-primary !py-2 text-xs">
                  <Check className="h-4 w-4" />
                  Avanzar a {STATUS_LABELS[nxt]}
                </button>
              )}
              {!order.driverId && (
                <button onClick={() => setShowAssign(!showAssign)} className="btn-secondary !py-2 text-xs">
                  <Bike className="h-4 w-4" />
                  Asignar repartidor
                </button>
              )}
              {(order.status === 'solicitado' || order.status === 'confirmado') && (
                <button onClick={() => onCancel(order.id)} className="btn-ghost !py-2 text-xs text-red-600 hover:bg-red-50">
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
              )}
            </div>
          )}

          {showAssign && (
            <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">Selecciona un repartidor:</p>
              {drivers.filter((d) => d.status === 'disponible').map((d) => (
                <button
                  key={d.id}
                  onClick={() => { onAssign(order.id, d.id); setShowAssign(false); }}
                  className="flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm transition-colors hover:bg-bici-primary-50"
                >
                  <Bike className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700">{d.name}</span>
                  <span className="ml-auto text-xs text-slate-400">{d.zone}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OperatorPage() {
  const { orders, transitionOrder, cancelOrder, assignDriver } = useStore();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [filter, setFilter] = useState<string>('all');

  useAutoplay(true, 15000);

  useEffect(() => {
    if (highlightId) {
      const el = document.getElementById(`order-${highlightId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightId]);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const activeCount = orders.filter((o) => !['entregado', 'cancelado'].includes(o.status)).length;

  return (
    <AppLayout title="Panel del operador" subtitle={`${activeCount} pedidos activos`}>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${filter === 'all' ? 'bg-bici-primary-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
        >
          Todos ({orders.length})
        </button>
        {STATUS_FLOW.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${filter === s ? 'bg-bici-primary-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
            >
              {STATUS_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center text-slate-400">
            <Clock className="mx-auto mb-3 h-10 w-10" />
            <p>No hay pedidos en esta categoría</p>
          </div>
        ) : (
          filtered.map((order) => (
            <div key={order.id} id={`order-${order.id}`} className={highlightId === order.id ? 'ring-2 ring-bici-primary-400 rounded-2xl' : ''}>
              <OrderCard
                order={order}
                onAdvance={(id) => transitionOrder(id, nextStatus(orders.find((o) => o.id === id)!.status)!)}
                onCancel={cancelOrder}
                onAssign={assignDriver}
              />
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
