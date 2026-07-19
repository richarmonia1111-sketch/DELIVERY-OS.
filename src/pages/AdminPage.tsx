import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Package, Store, Bike, Users, Clock,
  CheckCircle2, XCircle, SlidersHorizontal, ArrowRight,
  Trophy, ShoppingBag, MapPin,
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { useStore } from '../store';
import { useConfig } from '../lib/config';
import { STATUS_LABELS, STATUS_COLORS, STATUS_FLOW, type OrderStatus } from '../types';

export default function AdminPage() {
  const { orders, businesses, drivers, customerCount, resetData } = useStore();
  const { config } = useConfig();

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 6 * 86400000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const todayOrders = orders.filter((o) => new Date(o.createdAt).getTime() >= todayStart);
    const weekOrders = orders.filter((o) => new Date(o.createdAt).getTime() >= weekStart);
    const monthOrders = orders.filter((o) => new Date(o.createdAt).getTime() >= monthStart);
    const completedOrders = orders.filter((o) => o.status === 'entregado');
    const cancelledOrders = orders.filter((o) => o.status === 'cancelado');
    const activeOrders = orders.filter((o) => !['entregado', 'cancelado'].includes(o.status));
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.cost, 0);

    const avgDeliveryMs = completedOrders.reduce((sum, o) => {
      const start = new Date(o.createdAt).getTime();
      const end = new Date(o.updatedAt).getTime();
      return sum + (end - start);
    }, 0);
    const avgDeliveryMin = completedOrders.length > 0 ? Math.round(avgDeliveryMs / completedOrders.length / 60000) : 0;

    const customerCounts: Record<string, number> = {};
    orders.forEach((o) => { customerCounts[o.customerName] = (customerCounts[o.customerName] ?? 0) + 1; });
    const topCustomers = Object.entries(customerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const businessCounts: Record<string, number> = {};
    orders.forEach((o) => o.establishments.forEach((e) => { businessCounts[e] = (businessCounts[e] ?? 0) + 1; }));
    const topBusinesses = Object.entries(businessCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const topDrivers = [...drivers].sort((a, b) => b.totalDeliveries - a.totalDeliveries).slice(0, 5);

    return {
      todayOrders: todayOrders.length,
      weekOrders: weekOrders.length,
      monthOrders: monthOrders.length,
      completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length,
      activeOrders: activeOrders.length,
      totalRevenue,
      avgDeliveryMin,
      topCustomers,
      topBusinesses,
      topDrivers,
    };
  }, [orders, drivers]);

  const statusCounts = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      solicitado: 0, confirmado: 0, en_compra: 0, en_camino: 0, entregado: 0, cancelado: 0,
    };
    orders.forEach((o) => { counts[o.status]++; });
    return counts;
  }, [orders]);

  const last7Days = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    const now = new Date();
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 86400000;
      const count = orders.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;
      days.push({ label: dayNames[d.getDay()], count });
    }
    return days;
  }, [orders]);

  const maxDayCount = Math.max(...last7Days.map((d) => d.count), 1);

  const statCards = [
    { label: 'Pedidos hoy', value: stats.todayOrders, icon: Package, color: 'bg-blue-100 text-blue-600' },
    { label: 'Pedidos semana', value: stats.weekOrders, icon: TrendingUp, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Pedidos mes', value: stats.monthOrders, icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
    { label: 'Ingresos', value: `$${stats.totalRevenue}`, icon: TrendingUp, color: 'bg-bici-primary-100 text-bici-primary-700' },
    { label: 'Completados', value: stats.completedOrders, icon: CheckCircle2, color: 'bg-bici-primary-100 text-bici-primary-600' },
    { label: 'Cancelados', value: stats.cancelledOrders, icon: XCircle, color: 'bg-red-100 text-red-600' },
    { label: 'Tiempo prom.', value: `${stats.avgDeliveryMin} min`, icon: Clock, color: 'bg-amber-100 text-amber-600' },
    { label: 'Clientes', value: customerCount, icon: Users, color: 'bg-slate-100 text-slate-600' },
  ];

  return (
    <AppLayout
      title={`${config.name} — Dashboard`}
      subtitle="Métricas y estado del sistema en tiempo real."
      actions={
        <div className="flex gap-2">
          <Link to="/config" className="btn-ghost text-xs">
            <SlidersHorizontal className="h-4 w-4" />
            Configuración
          </Link>
        </div>
      }
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {statCards.map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="mt-3 font-display text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="mt-0.5 text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Orders by status */}
        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold text-slate-900">Pedidos por estado</h2>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {STATUS_FLOW.map((s) => (
              <div key={s} className="rounded-xl bg-slate-50 p-3 text-center">
                <span className={`badge ${STATUS_COLORS[s]}`}>{STATUS_LABELS[s]}</span>
                <div className="mt-2 font-display text-xl font-bold text-slate-900">{statusCounts[s]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-day chart */}
        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold text-slate-900">Pedidos últimos 7 días</h2>
          <div className="mt-4 flex items-end justify-between gap-2" style={{ height: '160px' }}>
            {last7Days.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-bici-primary-500 transition-all hover:bg-bici-primary-600"
                    style={{ height: `${(d.count / maxDayCount) * 100}%`, minHeight: d.count > 0 ? '8px' : '2px' }}
                    title={`${d.count} pedidos`}
                  />
                </div>
                <span className="text-xs text-slate-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Top customers */}
        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-slate-900">
            <Users className="h-4 w-4 text-slate-400" />
            Clientes frecuentes
          </h3>
          <div className="mt-3 space-y-2">
            {stats.topCustomers.map(([name, count], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-sm text-slate-700">{name}</span>
                <span className="text-sm font-semibold text-slate-900">{count}</span>
              </div>
            ))}
            {stats.topCustomers.length === 0 && <p className="text-sm text-slate-400">Sin datos</p>}
          </div>
        </div>

        {/* Top businesses */}
        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-slate-900">
            <Store className="h-4 w-4 text-slate-400" />
            Negocios con más pedidos
          </h3>
          <div className="mt-3 space-y-2">
            {stats.topBusinesses.map(([name, count], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-sm text-slate-700">{name}</span>
                <span className="text-sm font-semibold text-slate-900">{count}</span>
              </div>
            ))}
            {stats.topBusinesses.length === 0 && <p className="text-sm text-slate-400">Sin datos</p>}
          </div>
        </div>

        {/* Top drivers */}
        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-slate-900">
            <Trophy className="h-4 w-4 text-slate-400" />
            Repartidores con más entregas
          </h3>
          <div className="mt-3 space-y-2">
            {stats.topDrivers.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-sm text-slate-700">{d.name}</span>
                <span className="text-sm font-semibold text-slate-900">{d.totalDeliveries}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="mt-8">
        <h2 className="mb-4 font-display text-lg font-semibold text-slate-900">Pedidos recientes</h2>
        <div className="card overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Servicio</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Costo</th>
                <th className="px-4 py-3 font-medium">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.slice(0, 10).map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{o.code}</td>
                  <td className="px-4 py-3 text-slate-600">{o.customerName}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{o.serviceType.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3"><span className={`badge ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span></td>
                  <td className="px-4 py-3 font-medium text-slate-900">${o.cost}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(o.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No hay pedidos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={resetData} className="btn-ghost text-xs text-slate-400">
          Restablecer datos locales
        </button>
      </div>
    </AppLayout>
  );
}
