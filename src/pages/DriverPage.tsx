import { useState } from 'react';
import { Bike, Star, Phone, MapPin, Clock, Check, Package } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { useStore } from '../store';
import { STATUS_LABELS, STATUS_COLORS, nextStatus, type Order } from '../types';

function DriverOrderCard({ order, onAdvance }: { order: Order; onAdvance: (id: string) => void }) {
  const nxt = nextStatus(order.status);
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-display text-sm font-bold text-slate-900">{order.code}</span>
          <span className={`badge ml-2 ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
        </div>
        <span className="font-display text-sm font-bold text-bici-primary-700">${order.cost}</span>
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span className="text-slate-700">{order.address}</span>
        </div>
        <div className="flex items-start gap-2">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span className="text-slate-700">{order.customerPhone}</span>
        </div>
        {order.notes && (
          <div className="flex items-start gap-2">
            <Package className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span className="text-slate-700">{order.notes}</span>
          </div>
        )}
      </div>
      {nxt && (
        <button onClick={() => onAdvance(order.id)} className="btn-primary mt-4 w-full !py-2.5">
          <Check className="h-4 w-4" />
          Avanzar a {STATUS_LABELS[nxt]}
        </button>
      )}
    </div>
  );
}

export default function DriverPage() {
  const { orders, drivers, transitionOrder } = useStore();
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id ?? '');
  const driver = drivers.find((d) => d.id === selectedDriverId);
  const myOrders = orders.filter((o) => o.driverId === selectedDriverId && !['entregado', 'cancelado'].includes(o.status));

  return (
    <AppLayout title="Panel del repartidor" subtitle="Visualiza tus asignaciones y actualiza el estado.">
      <div className="mb-6 card p-5">
        <label className="label-field">Selecciona tu perfil</label>
        <select
          value={selectedDriverId}
          onChange={(e) => setSelectedDriverId(e.target.value)}
          className="input-field"
        >
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>{d.name} — {d.zone}</option>
          ))}
        </select>
        {driver && (
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-center"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /></div>
              <div className="mt-1 font-display text-lg font-bold text-slate-900">{driver.rating}</div>
              <div className="text-xs text-slate-400">Calificación</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-center"><Bike className="h-4 w-4 text-slate-500" /></div>
              <div className="mt-1 font-display text-lg font-bold text-slate-900">{driver.totalDeliveries}</div>
              <div className="text-xs text-slate-400">Entregas</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-center"><Clock className="h-4 w-4 text-slate-500" /></div>
              <div className="mt-1 font-display text-lg font-bold text-slate-900 capitalize">{driver.status}</div>
              <div className="text-xs text-slate-400">Estado</div>
            </div>
          </div>
        )}
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold text-slate-900">Mis pedidos activos ({myOrders.length})</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {myOrders.length === 0 ? (
          <div className="card col-span-full p-12 text-center text-slate-400">
            <Bike className="mx-auto mb-3 h-10 w-10" />
            <p>No tienes pedidos asignados</p>
          </div>
        ) : (
          myOrders.map((order) => (
            <DriverOrderCard key={order.id} order={order} onAdvance={(id) => transitionOrder(id, nextStatus(orders.find((o) => o.id === id)!.status)!)} />
          ))
        )}
      </div>
    </AppLayout>
  );
}
