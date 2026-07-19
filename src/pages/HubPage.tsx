import { Link } from 'react-router-dom';
import { ShoppingBag, Headphones, Bike, Settings, Store, SlidersHorizontal, DollarSign, Clock, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';
import { useConfig } from '../lib/config';
import { useStore } from '../store';

const PORTALS = [
  { to: '/customer', icon: ShoppingBag, title: 'Cliente', desc: 'Solicita un mandado o compra en tu comercio favorito.', color: 'bg-bici-primary-600' },
  { to: '/operador', icon: Headphones, title: 'Operador', desc: 'Gestiona y confirma los pedidos entrantes.', color: 'bg-blue-600' },
  { to: '/driver', icon: Bike, title: 'Repartidor', desc: 'Visualiza tus asignaciones y actualiza el estado.', color: 'bg-amber-600' },
  { to: '/admin', icon: Settings, title: 'Administrador', desc: 'Panel de control y métricas del sistema.', color: 'bg-slate-700' },
  { to: '/businesses', icon: Store, title: 'Comercios', desc: 'Directorio de comercios aliados.', color: 'bg-purple-600' },
  { to: '/config', icon: SlidersHorizontal, title: 'Configuración', desc: 'Modifica empresa, cobertura, tarifas y horarios.', color: 'bg-teal-600' },
  { to: '/tariffs', icon: DollarSign, title: 'Gestión de Tarifas', desc: 'Reglas de cobro, tarifas por zona, promociones y simulador.', color: 'bg-emerald-600' },
  { to: '/schedule', icon: Clock, title: 'Horarios', desc: 'Horario semanal, días especiales y estado en vivo.', color: 'bg-cyan-600' },
];

export default function HubPage() {
  const { config } = useConfig();
  const { orders, businesses, drivers, customerCount } = useStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Logo size="md" to="/" name={config.name} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-slate-900">Centro de control</h1>
          <p className="mt-2 text-slate-500">Selecciona el módulo al que deseas acceder.</p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Pedidos activos', value: orders.filter((o) => !['entregado', 'cancelado'].includes(o.status)).length },
            { label: 'Comercios', value: businesses.length },
            { label: 'Repartidores', value: drivers.length },
            { label: 'Clientes', value: customerCount },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <div className="font-display text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="mt-1 text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PORTALS.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="group card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${p.color} text-white`}>
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">{p.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{p.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-bici-primary-700">
                Acceder
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
