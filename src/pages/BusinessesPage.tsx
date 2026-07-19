import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ArrowRight } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { useStore } from '../store';
import type { BusinessTag } from '../types';

const TAG_CONFIG: Record<BusinessTag, { label: string; cls: string }> = {
  recomendado: { label: 'Recomendado', cls: 'bg-amber-100 text-amber-700' },
  pedido_rapido: { label: 'Pedido rápido', cls: 'bg-blue-100 text-blue-700' },
  promocion: { label: 'Promoción', cls: 'bg-pink-100 text-pink-700' },
  abierto: { label: 'Abierto', cls: 'bg-bici-primary-100 text-bici-primary-700' },
};

export default function BusinessesPage() {
  const { businesses } = useStore();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(businesses.map((b) => b.category)))];
  const filtered = businesses.filter((b) => {
    const matchesQuery = b.name.toLowerCase().includes(query.toLowerCase()) || b.category.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'all' || b.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <AppLayout title="Comercios aliados" subtitle="Directorio de comercios disponibles para pedidos.">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar comercio..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field sm:w-48">
          {categories.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'Todas las categorías' : c}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b) => (
          <div key={b.id} className="card overflow-hidden">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img src={b.photo} alt={b.name} className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                {b.tags.map((t) => (
                  <span key={t} className={`badge ${TAG_CONFIG[t].cls}`}>{TAG_CONFIG[t].label}</span>
                ))}
              </div>
            </div>
            <div className="p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-bici-primary-600">{b.category}</span>
              <h3 className="mt-1 font-display text-base font-semibold text-slate-900">{b.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{b.address}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3" /> {b.hours}
              </p>
              <Link
                to={`/customer?business=${b.id}`}
                className="group mt-3 inline-flex items-center gap-1 text-sm font-semibold text-bici-primary-700"
              >
                Solicitar compra
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center text-slate-400">
          <p>No se encontraron comercios</p>
        </div>
      )}
    </AppLayout>
  );
}
