import { useState, useEffect, useMemo } from 'react';
import {
  DollarSign, MapPin, Clock, Bike, Gift, Calculator, Plus, Trash2,
  Check, Store, Layers, Tag, Percent,
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { useConfig } from '../lib/config';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';
import { calculateTariff } from '../lib/tariffEngine';
import {
  type ServiceTypeConfig, type Tariff, type TariffZoneRate,
  type TariffEstablishmentRate, type TariffTimeModifier,
  type TariffBusinessRate, type TariffPromotion,
  type TariffSimulatorInput, type TariffBreakdownItem,
  type TariffType, type TimeModifierType, type TimeAmountType,
  type PromoType, type PromoDiscountType,
  PROMO_TYPE_LABELS, MODIFIER_TYPE_LABELS, AMOUNT_TYPE_LABELS, TARIFF_TYPE_LABELS,
} from '../types';

// ──────────────────────────────────────────────
// Tab configuration
// ──────────────────────────────────────────────
type Tab =
  | 'serviceTypes'
  | 'tariffs'
  | 'zoneRates'
  | 'establishmentRates'
  | 'businessRates'
  | 'timeModifiers'
  | 'promotions'
  | 'simulator';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'serviceTypes', label: 'Tipos de Servicio', icon: Bike },
  { id: 'tariffs', label: 'Tarifas', icon: DollarSign },
  { id: 'zoneRates', label: 'Tarifas por Zona', icon: MapPin },
  { id: 'establishmentRates', label: 'Por Establecimientos', icon: Store },
  { id: 'businessRates', label: 'Para Negocios', icon: Layers },
  { id: 'timeModifiers', label: 'Modificadores de Horario', icon: Clock },
  { id: 'promotions', label: 'Promociones', icon: Gift },
  { id: 'simulator', label: 'Simulador', icon: Calculator },
];

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
type AnyRow = Record<string, unknown>;

/** Convert a camelCase TS field name to the snake_case DB column name. */
function toSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

/** Format a number as currency. */
function fmt(n: number): string {
  return `$${n.toFixed(2)}`;
}

/** Current time as HH:MM. */
function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ── Row mappers (handle both camelCase and snake_case keys) ──
function mapServiceType(r: unknown): ServiceTypeConfig {
  const row = r as AnyRow;
  return {
    id: row.id as string,
    companyId: (row.companyId ?? row.company_id) as string,
    name: row.name as string,
    description: (row.description ?? '') as string,
    basePrice: Number(row.basePrice ?? row.base_price ?? 0),
    isActive: (row.isActive ?? row.is_active ?? true) as boolean,
    isSystem: (row.isSystem ?? row.is_system ?? false) as boolean,
  };
}

function mapTariff(r: unknown): Tariff {
  const row = r as AnyRow;
  return {
    id: row.id as string,
    companyId: (row.companyId ?? row.company_id) as string,
    name: row.name as string,
    type: row.type as TariffType,
    amount: Number(row.amount ?? 0),
    isActive: (row.isActive ?? row.is_active ?? true) as boolean,
    description: (row.description ?? '') as string,
    serviceTypeConfigId: (row.serviceTypeConfigId ?? row.service_type_config_id ?? null) as string | null,
    priority: Number(row.priority ?? 0),
  };
}

function mapZoneRate(r: unknown): TariffZoneRate {
  const row = r as AnyRow;
  return {
    id: row.id as string,
    companyId: (row.companyId ?? row.company_id) as string,
    tariffId: (row.tariffId ?? row.tariff_id) as string,
    zoneId: (row.zoneId ?? row.zone_id) as string,
    price: Number(row.price ?? 0),
  };
}

function mapEstablishmentRate(r: unknown): TariffEstablishmentRate {
  const row = r as AnyRow;
  return {
    id: row.id as string,
    companyId: (row.companyId ?? row.company_id) as string,
    tariffId: (row.tariffId ?? row.tariff_id) as string,
    establishmentCount: Number(row.establishmentCount ?? row.establishment_count ?? 1),
    price: Number(row.price ?? 0),
  };
}

function mapTimeModifier(r: unknown): TariffTimeModifier {
  const row = r as AnyRow;
  return {
    id: row.id as string,
    companyId: (row.companyId ?? row.company_id) as string,
    name: row.name as string,
    modifierType: (row.modifierType ?? row.modifier_type ?? 'surcharge') as TimeModifierType,
    amountType: (row.amountType ?? row.amount_type ?? 'fixed') as TimeAmountType,
    amount: Number(row.amount ?? 0),
    startTime: (row.startTime ?? row.start_time ?? '00:00') as string,
    endTime: (row.endTime ?? row.end_time ?? '23:59') as string,
    isActive: (row.isActive ?? row.is_active ?? true) as boolean,
  };
}

function mapBusinessRate(r: unknown): TariffBusinessRate {
  const row = r as AnyRow;
  return {
    id: row.id as string,
    companyId: (row.companyId ?? row.company_id) as string,
    deliveryCount: Number(row.deliveryCount ?? row.delivery_count ?? 1),
    price: Number(row.price ?? 0),
    description: (row.description ?? '') as string,
    isActive: (row.isActive ?? row.is_active ?? true) as boolean,
  };
}

function mapPromotion(r: unknown): TariffPromotion {
  const row = r as AnyRow;
  return {
    id: row.id as string,
    companyId: (row.companyId ?? row.company_id) as string,
    name: row.name as string,
    description: (row.description ?? '') as string,
    promoType: (row.promoType ?? row.promo_type ?? 'discount') as PromoType,
    discountType: (row.discountType ?? row.discount_type ?? 'percentage') as PromoDiscountType,
    discountAmount: Number(row.discountAmount ?? row.discount_amount ?? 0),
    zoneId: (row.zoneId ?? row.zone_id ?? null) as string | null,
    startDate: (row.startDate ?? row.start_date ?? null) as string | null,
    endDate: (row.endDate ?? row.end_date ?? null) as string | null,
    maxUses: (row.maxUses ?? row.max_uses ?? null) as number | null,
    usesCount: Number(row.usesCount ?? row.uses_count ?? 0),
    isActive: (row.isActive ?? row.is_active ?? true) as boolean,
  };
}

// ── Breakdown visual styles ──
const BREAKDOWN_STYLE: Record<TariffBreakdownItem['type'], { dot: string; text: string; bg: string }> = {
  base: { dot: 'bg-slate-400', text: 'text-slate-700', bg: 'bg-slate-50' },
  zone: { dot: 'bg-blue-400', text: 'text-blue-700', bg: 'bg-blue-50' },
  establishment: { dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50' },
  time: { dot: 'bg-purple-400', text: 'text-purple-700', bg: 'bg-purple-50' },
  business: { dot: 'bg-bici-primary-500', text: 'text-bici-primary-700', bg: 'bg-bici-primary-50' },
  promotion: { dot: 'bg-pink-400', text: 'text-pink-700', bg: 'bg-pink-50' },
};

// ──────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────
export default function TariffsPage() {
  const [tab, setTab] = useState<Tab>('serviceTypes');

  return (
    <AppLayout
      title="Gestión de Tarifas"
      subtitle="Configura y simula el motor de precios de tu empresa de entregas."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-bici-primary-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'serviceTypes' && <ServiceTypesTab />}
      {tab === 'tariffs' && <TariffsTab />}
      {tab === 'zoneRates' && <ZoneRatesTab />}
      {tab === 'establishmentRates' && <EstablishmentRatesTab />}
      {tab === 'businessRates' && <BusinessRatesTab />}
      {tab === 'timeModifiers' && <TimeModifiersTab />}
      {tab === 'promotions' && <PromotionsTab />}
      {tab === 'simulator' && <SimulatorTab />}
    </AppLayout>
  );
}

// ──────────────────────────────────────────────
// Tab 1 — Tipos de Servicio
// ──────────────────────────────────────────────
function ServiceTypesTab() {
  const { config } = useConfig();
  const { serviceTypes } = useStore();
  const [items, setItems] = useState<ServiceTypeConfig[]>([]);
  const [form, setForm] = useState({ name: '', description: '', basePrice: 0 });

  useEffect(() => setItems(serviceTypes.map(mapServiceType)), [serviceTypes]);

  const add = async () => {
    if (!form.name.trim()) return;
    try {
      const { data, error } = await supabase
        .from('service_types_config')
        .insert({
          company_id: config.id,
          name: form.name.trim(),
          description: form.description,
          base_price: form.basePrice,
          is_active: true,
          is_system: false,
        })
        .select()
        .single();
      if (error) throw error;
      setItems((prev) => [...prev, mapServiceType(data)]);
      setForm({ name: '', description: '', basePrice: 0 });
    } catch { /* ignore */ }
  };

  const update = async (id: string, field: string, value: string | number | boolean) => {
    try {
      await supabase.from('service_types_config').update({ [toSnake(field)]: value }).eq('id', id);
      setItems((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    } catch { /* ignore */ }
  };

  const toggle = async (id: string, isActive: boolean) => {
    try {
      await supabase.from('service_types_config').update({ is_active: !isActive }).eq('id', id);
      setItems((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !isActive } : s)));
    } catch { /* ignore */ }
  };

  const remove = async (id: string) => {
    try {
      await supabase.from('service_types_config').delete().eq('id', id);
      setItems((prev) => prev.filter((s) => s.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className="label-field">Nombre</label>
            <input
              className="input-field"
              placeholder="Ej. Compras express"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Descripción</label>
            <input
              className="input-field"
              placeholder="Breve descripción"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Precio base ($)</label>
            <input
              type="number"
              className="input-field"
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-end">
            <button onClick={add} className="btn-primary w-full">
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((s) => (
          <div key={s.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bici-primary-100 text-bici-primary-700">
                  <Bike className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{s.name}</p>
                  <p className="text-sm text-slate-500">{s.description}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <span className={`badge ${s.isActive ? 'bg-bici-primary-100 text-bici-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                  {s.isActive ? 'Activo' : 'Inactivo'}
                </span>
                {s.isSystem && (
                  <span className="badge bg-blue-100 text-blue-700">Sistema</span>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-end gap-3">
              <div className="flex-1">
                <label className="label-field">Precio base ($)</label>
                <input
                  type="number"
                  className="input-field"
                  value={s.basePrice}
                  onChange={(e) => update(s.id, 'basePrice', Number(e.target.value))}
                />
              </div>
              <button
                onClick={() => toggle(s.id, s.isActive)}
                className={`btn-ghost shrink-0 text-xs ${s.isActive ? 'text-bici-primary-700' : 'text-slate-400'}`}
              >
                {s.isActive ? 'Desactivar' : 'Activar'}
              </button>
              {!s.isSystem && (
                <button
                  onClick={() => remove(s.id)}
                  className="btn-ghost shrink-0 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="card p-8 text-center text-slate-400">
          <Bike className="mx-auto mb-2 h-8 w-8" />
          <p>No hay tipos de servicio configurados</p>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Tab 2 — Tarifas (Main Tariffs)
// ──────────────────────────────────────────────
function TariffsTab() {
  const { config } = useConfig();
  const { tariffs } = useStore();
  const [items, setItems] = useState<Tariff[]>([]);
  const [form, setForm] = useState({ name: '', description: '', type: 'simple' as TariffType, amount: 0 });

  useEffect(() => setItems(tariffs.map(mapTariff)), [tariffs]);

  const add = async () => {
    if (!form.name.trim()) return;
    try {
      const { data, error } = await supabase
        .from('tariffs')
        .insert({
          company_id: config.id,
          name: form.name.trim(),
          description: form.description,
          type: form.type,
          amount: form.amount,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      setItems((prev) => [...prev, mapTariff(data)]);
      setForm({ name: '', description: '', type: 'simple', amount: 0 });
    } catch { /* ignore */ }
  };

  const update = async (id: string, field: string, value: string | number | boolean) => {
    try {
      await supabase.from('tariffs').update({ [toSnake(field)]: value }).eq('id', id);
      setItems((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
    } catch { /* ignore */ }
  };

  const toggle = async (id: string, isActive: boolean) => {
    try {
      await supabase.from('tariffs').update({ is_active: !isActive }).eq('id', id);
      setItems((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: !isActive } : t)));
    } catch { /* ignore */ }
  };

  const remove = async (id: string) => {
    try {
      await supabase.from('tariffs').delete().eq('id', id);
      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-5">
          <div>
            <label className="label-field">Nombre</label>
            <input
              className="input-field"
              placeholder="Ej. Entrega estándar"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Descripción</label>
            <input
              className="input-field"
              placeholder="Opcional"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Tipo</label>
            <select
              className="input-field"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as TariffType })}
            >
              {Object.entries(TARIFF_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Monto ($)</label>
            <input
              type="number"
              className="input-field"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-end">
            <button onClick={add} className="btn-primary w-full">
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.map((t) => (
          <div key={t.id} className="card p-4">
            <div className="grid gap-3 sm:grid-cols-5">
              <div>
                <label className="label-field">Nombre</label>
                <input
                  className="input-field"
                  value={t.name}
                  onChange={(e) => update(t.id, 'name', e.target.value)}
                />
              </div>
              <div>
                <label className="label-field">Descripción</label>
                <input
                  className="input-field"
                  value={t.description ?? ''}
                  onChange={(e) => update(t.id, 'description', e.target.value)}
                />
              </div>
              <div>
                <label className="label-field">Tipo</label>
                <select
                  className="input-field"
                  value={t.type}
                  onChange={(e) => update(t.id, 'type', e.target.value)}
                >
                  {Object.entries(TARIFF_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">Monto ($)</label>
                <input
                  type="number"
                  className="input-field"
                  value={t.amount}
                  onChange={(e) => update(t.id, 'amount', Number(e.target.value))}
                />
              </div>
              <div className="flex items-end gap-2">
                <span className={`badge ${t.isActive ? 'bg-bici-primary-100 text-bici-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                  {t.isActive ? 'Activa' : 'Inactiva'}
                </span>
                <button
                  onClick={() => toggle(t.id, t.isActive)}
                  className={`btn-ghost text-xs ${t.isActive ? 'text-bici-primary-700' : 'text-slate-400'}`}
                >
                  {t.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => remove(t.id)}
                  className="btn-ghost text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="card p-8 text-center text-slate-400">
          <DollarSign className="mx-auto mb-2 h-8 w-8" />
          <p>No hay tarifas configuradas</p>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Tab 3 — Tarifas por Zona
// ──────────────────────────────────────────────
function ZoneRatesTab() {
  const { config } = useConfig();
  const { zoneRates, coverageZones, tariffs } = useStore();
  const [items, setItems] = useState<TariffZoneRate[]>([]);
  const [form, setForm] = useState({ tariffId: '', zoneId: '', price: 0 });

  useEffect(() => setItems(zoneRates.map(mapZoneRate)), [zoneRates]);

  const zoneName = (zoneId: string) => coverageZones.find((z) => z.id === zoneId)?.name ?? '—';
  const tariffName = (tariffId: string) => tariffs.find((t) => t.id === tariffId)?.name ?? '—';

  const add = async () => {
    if (!form.tariffId || !form.zoneId) return;
    try {
      const { data, error } = await supabase
        .from('tariff_zone_rates')
        .insert({
          company_id: config.id,
          tariff_id: form.tariffId,
          zone_id: form.zoneId,
          price: form.price,
        })
        .select()
        .single();
      if (error) throw error;
      setItems((prev) => [...prev, mapZoneRate(data)]);
      setForm({ tariffId: '', zoneId: '', price: 0 });
    } catch { /* ignore */ }
  };

  const remove = async (id: string) => {
    try {
      await supabase.from('tariff_zone_rates').delete().eq('id', id);
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className="label-field">Zona</label>
            <select
              className="input-field"
              value={form.zoneId}
              onChange={(e) => setForm({ ...form, zoneId: e.target.value })}
            >
              <option value="">Selecciona una zona</option>
              {coverageZones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Tarifa</label>
            <select
              className="input-field"
              value={form.tariffId}
              onChange={(e) => setForm({ ...form, tariffId: e.target.value })}
            >
              <option value="">Selecciona una tarifa</option>
              {tariffs.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Precio ($)</label>
            <input
              type="number"
              className="input-field"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-end">
            <button onClick={add} className="btn-primary w-full">
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-3 font-medium">Zona</th>
              <th className="px-4 py-3 font-medium">Tarifa</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-800">{zoneName(r.zoneId)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{tariffName(r.tariffId)}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-bici-primary-700">{fmt(r.price)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => remove(r.id)}
                    className="btn-ghost text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="card p-8 text-center text-slate-400">
          <MapPin className="mx-auto mb-2 h-8 w-8" />
          <p>No hay tarifas por zona configuradas</p>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Tab 4 — Tarifas por Establecimientos
// ──────────────────────────────────────────────
function EstablishmentRatesTab() {
  const { config } = useConfig();
  const { establishmentRates, tariffs } = useStore();
  const [items, setItems] = useState<TariffEstablishmentRate[]>([]);
  const [form, setForm] = useState({ tariffId: '', establishmentCount: 1, price: 0 });

  useEffect(() => setItems(establishmentRates.map(mapEstablishmentRate)), [establishmentRates]);

  const tariffName = (tariffId: string) => tariffs.find((t) => t.id === tariffId)?.name ?? '—';

  const add = async () => {
    if (!form.tariffId) return;
    try {
      const { data, error } = await supabase
        .from('tariff_establishment_rates')
        .insert({
          company_id: config.id,
          tariff_id: form.tariffId,
          establishment_count: form.establishmentCount,
          price: form.price,
        })
        .select()
        .single();
      if (error) throw error;
      setItems((prev) => [...prev, mapEstablishmentRate(data)]);
      setForm({ tariffId: '', establishmentCount: 1, price: 0 });
    } catch { /* ignore */ }
  };

  const remove = async (id: string) => {
    try {
      await supabase.from('tariff_establishment_rates').delete().eq('id', id);
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className="label-field">Tarifa</label>
            <select
              className="input-field"
              value={form.tariffId}
              onChange={(e) => setForm({ ...form, tariffId: e.target.value })}
            >
              <option value="">Selecciona una tarifa</option>
              {tariffs.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">N° de establecimientos (1-10)</label>
            <input
              type="number"
              min={1}
              max={10}
              className="input-field"
              value={form.establishmentCount}
              onChange={(e) => setForm({ ...form, establishmentCount: Math.max(1, Math.min(10, Number(e.target.value))) })}
            />
          </div>
          <div>
            <label className="label-field">Precio ($)</label>
            <input
              type="number"
              className="input-field"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-end">
            <button onClick={add} className="btn-primary w-full">
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-3 font-medium">Tarifa</th>
              <th className="px-4 py-3 font-medium">Establecimientos</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-800">{tariffName(r.tariffId)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="badge bg-amber-100 text-amber-700">{r.establishmentCount}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-bici-primary-700">{fmt(r.price)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => remove(r.id)}
                    className="btn-ghost text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="card p-8 text-center text-slate-400">
          <Store className="mx-auto mb-2 h-8 w-8" />
          <p>No hay tarifas por establecimientos configuradas</p>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Tab 5 — Tarifas para Negocios
// ──────────────────────────────────────────────
function BusinessRatesTab() {
  const { config } = useConfig();
  const { businessRates } = useStore();
  const [items, setItems] = useState<TariffBusinessRate[]>([]);
  const [form, setForm] = useState({ deliveryCount: 1, price: 0, description: '' });

  useEffect(() => setItems(businessRates.map(mapBusinessRate)), [businessRates]);

  const add = async () => {
    if (form.deliveryCount < 1) return;
    try {
      const { data, error } = await supabase
        .from('tariff_business_rates')
        .insert({
          company_id: config.id,
          delivery_count: form.deliveryCount,
          price: form.price,
          description: form.description,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      setItems((prev) => [...prev, mapBusinessRate(data)]);
      setForm({ deliveryCount: 1, price: 0, description: '' });
    } catch { /* ignore */ }
  };

  const toggle = async (id: string, isActive: boolean) => {
    try {
      await supabase.from('tariff_business_rates').update({ is_active: !isActive }).eq('id', id);
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !isActive } : r)));
    } catch { /* ignore */ }
  };

  const remove = async (id: string) => {
    try {
      await supabase.from('tariff_business_rates').delete().eq('id', id);
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className="label-field">N° de entregas</label>
            <input
              type="number"
              min={1}
              className="input-field"
              value={form.deliveryCount}
              onChange={(e) => setForm({ ...form, deliveryCount: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label-field">Precio ($)</label>
            <input
              type="number"
              className="input-field"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label-field">Descripción</label>
            <input
              className="input-field"
              placeholder="Ej. Paquete semanal"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <button onClick={add} className="btn-primary w-full">
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => (
          <div
            key={r.id}
            className={`card p-5 transition-opacity ${r.isActive ? '' : 'opacity-60'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bici-primary-100">
                <span className="text-2xl font-bold text-bici-primary-700">{r.deliveryCount}</span>
              </div>
              <div className="flex gap-1.5">
                <span className={`badge ${r.isActive ? 'bg-bici-primary-100 text-bici-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                  {r.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{fmt(r.price)}</p>
            <p className="mt-1 text-sm text-slate-500">{r.description || `${r.deliveryCount} entrega(s) por viaje`}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => toggle(r.id, r.isActive)}
                className={`btn-ghost text-xs ${r.isActive ? 'text-bici-primary-700' : 'text-slate-400'}`}
              >
                {r.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button
                onClick={() => remove(r.id)}
                className="btn-ghost text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="card p-8 text-center text-slate-400">
          <Layers className="mx-auto mb-2 h-8 w-8" />
          <p>No hay tarifas para negocios configuradas</p>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Tab 6 — Modificadores de Horario
// ──────────────────────────────────────────────
function TimeModifiersTab() {
  const { config } = useConfig();
  const { timeModifiers } = useStore();
  const [items, setItems] = useState<TariffTimeModifier[]>([]);
  const [form, setForm] = useState({
    name: '',
    modifierType: 'surcharge' as TimeModifierType,
    amountType: 'fixed' as TimeAmountType,
    amount: 0,
    startTime: '00:00',
    endTime: '23:59',
  });

  useEffect(() => setItems(timeModifiers.map(mapTimeModifier)), [timeModifiers]);

  const add = async () => {
    if (!form.name.trim()) return;
    try {
      const { data, error } = await supabase
        .from('tariff_time_modifiers')
        .insert({
          company_id: config.id,
          name: form.name.trim(),
          modifier_type: form.modifierType,
          amount_type: form.amountType,
          amount: form.amount,
          start_time: form.startTime,
          end_time: form.endTime,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      setItems((prev) => [...prev, mapTimeModifier(data)]);
      setForm({ name: '', modifierType: 'surcharge', amountType: 'fixed', amount: 0, startTime: '00:00', endTime: '23:59' });
    } catch { /* ignore */ }
  };

  const toggle = async (id: string, isActive: boolean) => {
    try {
      await supabase.from('tariff_time_modifiers').update({ is_active: !isActive }).eq('id', id);
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, isActive: !isActive } : m)));
    } catch { /* ignore */ }
  };

  const remove = async (id: string) => {
    try {
      await supabase.from('tariff_time_modifiers').delete().eq('id', id);
      setItems((prev) => prev.filter((m) => m.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <div>
            <label className="label-field">Nombre</label>
            <input
              className="input-field"
              placeholder="Ej. Horario nocturno"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Tipo de modificador</label>
            <select
              className="input-field"
              value={form.modifierType}
              onChange={(e) => setForm({ ...form, modifierType: e.target.value as TimeModifierType })}
            >
              {Object.entries(MODIFIER_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Tipo de monto</label>
            <select
              className="input-field"
              value={form.amountType}
              onChange={(e) => setForm({ ...form, amountType: e.target.value as TimeAmountType })}
            >
              {Object.entries(AMOUNT_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Monto</label>
            <input
              type="number"
              className="input-field"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label-field">Hora inicio</label>
            <input
              type="time"
              className="input-field"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Hora fin</label>
            <input
              type="time"
              className="input-field"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
          <div className="flex items-end sm:col-span-1 lg:col-span-2">
            <button onClick={add} className="btn-primary w-full">
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.map((m) => (
          <div key={m.id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{m.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className={`badge ${m.modifierType === 'surcharge' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {MODIFIER_TYPE_LABELS[m.modifierType]}
                    </span>
                    <span className="badge bg-slate-100 text-slate-600">
                      {AMOUNT_TYPE_LABELS[m.amountType]}
                    </span>
                    <span className="badge bg-slate-100 text-slate-600">
                      {m.amountType === 'percentage' ? `${m.amount}%` : fmt(m.amount)}
                    </span>
                    <span className="badge bg-blue-50 text-blue-600">
                      {m.startTime} – {m.endTime}
                    </span>
                    <span className={`badge ${m.isActive ? 'bg-bici-primary-100 text-bici-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                      {m.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggle(m.id, m.isActive)}
                  className={`btn-ghost text-xs ${m.isActive ? 'text-bici-primary-700' : 'text-slate-400'}`}
                >
                  {m.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => remove(m.id)}
                  className="btn-ghost text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="card p-8 text-center text-slate-400">
          <Clock className="mx-auto mb-2 h-8 w-8" />
          <p>No hay modificadores de horario configurados</p>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Tab 7 — Promociones
// ──────────────────────────────────────────────
function PromotionsTab() {
  const { config } = useConfig();
  const { promotions, coverageZones } = useStore();
  const [items, setItems] = useState<TariffPromotion[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    promoType: 'discount' as PromoType,
    discountType: 'percentage' as PromoDiscountType,
    discountAmount: 0,
    zoneId: '',
    startDate: '',
    endDate: '',
    maxUses: '',
  });

  useEffect(() => setItems(promotions.map(mapPromotion)), [promotions]);

  const zoneName = (zoneId: string | null) =>
    zoneId ? coverageZones.find((z) => z.id === zoneId)?.name ?? '—' : null;

  const add = async () => {
    if (!form.name.trim()) return;
    try {
      const { data, error } = await supabase
        .from('tariff_promotions')
        .insert({
          company_id: config.id,
          name: form.name.trim(),
          description: form.description,
          promo_type: form.promoType,
          discount_type: form.discountType,
          discount_amount: form.discountAmount,
          zone_id: form.promoType === 'zone_discount' && form.zoneId ? form.zoneId : null,
          start_date: form.startDate || null,
          end_date: form.endDate || null,
          max_uses: form.maxUses ? Number(form.maxUses) : null,
          uses_count: 0,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      setItems((prev) => [...prev, mapPromotion(data)]);
      setForm({
        name: '', description: '', promoType: 'discount', discountType: 'percentage',
        discountAmount: 0, zoneId: '', startDate: '', endDate: '', maxUses: '',
      });
    } catch { /* ignore */ }
  };

  const toggle = async (id: string, isActive: boolean) => {
    try {
      await supabase.from('tariff_promotions').update({ is_active: !isActive }).eq('id', id);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !isActive } : p)));
    } catch { /* ignore */ }
  };

  const remove = async (id: string) => {
    try {
      await supabase.from('tariff_promotions').delete().eq('id', id);
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <div>
            <label className="label-field">Nombre</label>
            <input
              className="input-field"
              placeholder="Ej. 2x1 Martes"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Descripción</label>
            <input
              className="input-field"
              placeholder="Opcional"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Tipo de promoción</label>
            <select
              className="input-field"
              value={form.promoType}
              onChange={(e) => setForm({ ...form, promoType: e.target.value as PromoType })}
            >
              {Object.entries(PROMO_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Tipo de descuento</label>
            <select
              className="input-field"
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value as PromoDiscountType })}
            >
              <option value="percentage">Porcentaje</option>
              <option value="fixed">Monto fijo</option>
            </select>
          </div>
          <div>
            <label className="label-field">
              {form.discountType === 'percentage' ? 'Descuento (%)' : 'Descuento ($)'}
            </label>
            <input
              type="number"
              className="input-field"
              value={form.discountAmount}
              onChange={(e) => setForm({ ...form, discountAmount: Number(e.target.value) })}
            />
          </div>
          {form.promoType === 'zone_discount' && (
            <div>
              <label className="label-field">Zona</label>
              <select
                className="input-field"
                value={form.zoneId}
                onChange={(e) => setForm({ ...form, zoneId: e.target.value })}
              >
                <option value="">Selecciona una zona</option>
                {coverageZones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label-field">Fecha inicio</label>
            <input
              type="date"
              className="input-field"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Fecha fin</label>
            <input
              type="date"
              className="input-field"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Usos máximos (vacío = ilimitado)</label>
            <input
              type="number"
              className="input-field"
              placeholder="Ilimitado"
              value={form.maxUses}
              onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <button onClick={add} className="btn-primary w-full">
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((p) => (
          <div
            key={p.id}
            className={`card p-4 transition-opacity ${p.isActive ? '' : 'opacity-60'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{p.name}</p>
                  {p.description && <p className="text-sm text-slate-500">{p.description}</p>}
                </div>
              </div>
              <span className={`badge shrink-0 ${p.isActive ? 'bg-bici-primary-100 text-bici-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                {p.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="badge bg-pink-100 text-pink-700">
                <Tag className="h-3 w-3" />
                {PROMO_TYPE_LABELS[p.promoType]}
              </span>
              <span className="badge bg-slate-100 text-slate-600">
                <Percent className="h-3 w-3" />
                {p.discountType === 'percentage' ? `${p.discountAmount}%` : fmt(p.discountAmount)}
              </span>
              {zoneName(p.zoneId) && (
                <span className="badge bg-blue-50 text-blue-600">
                  <MapPin className="h-3 w-3" />
                  {zoneName(p.zoneId)}
                </span>
              )}
              {p.startDate && (
                <span className="badge bg-slate-100 text-slate-600">
                  {p.startDate}{p.endDate ? ` → ${p.endDate}` : ''}
                </span>
              )}
              <span className="badge bg-slate-100 text-slate-600">
                {p.usesCount}{p.maxUses !== null ? ` / ${p.maxUses}` : ' usos'}
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => toggle(p.id, p.isActive)}
                className={`btn-ghost text-xs ${p.isActive ? 'text-bici-primary-700' : 'text-slate-400'}`}
              >
                {p.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button
                onClick={() => remove(p.id)}
                className="btn-ghost text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="card p-8 text-center text-slate-400">
          <Gift className="mx-auto mb-2 h-8 w-8" />
          <p>No hay promociones configuradas</p>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Tab 8 — Simulador
// ──────────────────────────────────────────────
function SimulatorTab() {
  const {
    tariffs, coverageZones, serviceTypes, zoneRates,
    establishmentRates, timeModifiers, businessRates, promotions,
  } = useStore();

  const [input, setInput] = useState<TariffSimulatorInput>({
    zoneId: coverageZones[0]?.id ?? null,
    serviceTypeConfigId: serviceTypes[0]?.id ?? null,
    establishmentCount: 1,
    timeOfDay: nowHHMM(),
    isBusinessClient: false,
    businessDeliveryCount: 1,
    isFirstOrder: false,
  });
  const [calcKey, setCalcKey] = useState(0);

  // Build the TariffData object from mapped store values
  const data = useMemo(
    () => ({
      tariffs: tariffs.map(mapTariff),
      serviceTypes: serviceTypes.map(mapServiceType),
      zoneRates: zoneRates.map(mapZoneRate),
      establishmentRates: establishmentRates.map(mapEstablishmentRate),
      timeModifiers: timeModifiers.map(mapTimeModifier),
      businessRates: businessRates.map(mapBusinessRate),
      promotions: promotions.map(mapPromotion),
    }),
    [tariffs, serviceTypes, zoneRates, establishmentRates, timeModifiers, businessRates, promotions],
  );

  // Auto-recalculate whenever inputs or data change
  const breakdown = useMemo(() => calculateTariff(input, data), [input, data]);

  const updateInput = (patch: Partial<TariffSimulatorInput>) =>
    setInput((prev) => ({ ...prev, ...patch }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input controls */}
      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-bici-primary-600" />
          <h3 className="font-display text-lg font-bold text-slate-900">Parámetros de cálculo</h3>
        </div>

        <div className="space-y-4">
          {/* Zone */}
          <div>
            <label className="label-field">Zona de entrega</label>
            <select
              className="input-field"
              value={input.zoneId ?? ''}
              onChange={(e) => updateInput({ zoneId: e.target.value || null })}
            >
              <option value="">Sin zona específica</option>
              {coverageZones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          {/* Service type */}
          <div>
            <label className="label-field">Tipo de servicio</label>
            <select
              className="input-field"
              value={input.serviceTypeConfigId ?? ''}
              onChange={(e) => updateInput({ serviceTypeConfigId: e.target.value || null })}
            >
              <option value="">Servicio por defecto</option>
              {serviceTypes.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Establishment count */}
          <div>
            <label className="label-field">N° de establecimientos</label>
            <input
              type="number"
              min={1}
              max={10}
              className="input-field"
              value={input.establishmentCount}
              onChange={(e) => updateInput({ establishmentCount: Math.max(1, Number(e.target.value)) })}
            />
          </div>

          {/* Time of day */}
          <div>
            <label className="label-field">Hora del día</label>
            <input
              type="time"
              className="input-field"
              value={input.timeOfDay}
              onChange={(e) => updateInput({ timeOfDay: e.target.value })}
            />
          </div>

          {/* Business client */}
          <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <input
              type="checkbox"
              className="h-5 w-5 rounded text-bici-primary-600 focus:ring-bici-primary-500"
              checked={input.isBusinessClient}
              onChange={(e) => updateInput({ isBusinessClient: e.target.checked })}
            />
            <div>
              <span className="text-sm font-medium text-slate-700">Cliente de negocio afiliado</span>
              <p className="text-xs text-slate-400">Aplica tarifa especial por volumen</p>
            </div>
          </label>

          {/* Business delivery count (conditional) */}
          {input.isBusinessClient && (
            <div>
              <label className="label-field">N° de entregas del negocio</label>
              <input
                type="number"
                min={1}
                className="input-field"
                value={input.businessDeliveryCount}
                onChange={(e) => updateInput({ businessDeliveryCount: Math.max(1, Number(e.target.value)) })}
              />
            </div>
          )}

          {/* First order */}
          <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <input
              type="checkbox"
              className="h-5 w-5 rounded text-bici-primary-600 focus:ring-bici-primary-500"
              checked={input.isFirstOrder}
              onChange={(e) => updateInput({ isFirstOrder: e.target.checked })}
            />
            <div>
              <span className="text-sm font-medium text-slate-700">Primer pedido del cliente</span>
              <p className="text-xs text-slate-400">Aplica promoción de primer envío gratis</p>
            </div>
          </label>

          {/* Calculate button */}
          <button
            onClick={() => setCalcKey((k) => k + 1)}
            className="btn-primary w-full"
          >
            <Calculator className="h-4 w-4" />
            Calcular tarifa
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Total card */}
        <div
          key={calcKey}
          className="card overflow-hidden bg-gradient-to-br from-bici-primary-600 to-bici-primary-700 p-6 text-white animate-in"
        >
          <p className="text-sm font-medium text-bici-primary-100">Total estimado</p>
          <p className="mt-1 text-5xl font-bold tracking-tight">{fmt(breakdown.total)}</p>
          <div className="mt-3 flex items-center gap-2 text-sm text-bici-primary-100">
            <Check className="h-4 w-4" />
            <span>{breakdown.items.length} concepto(s) aplicado(s)</span>
          </div>
        </div>

        {/* Breakdown items */}
        <div className="card p-6">
          <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-slate-500">
            Desglose
          </h4>
          {breakdown.items.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No hay conceptos para mostrar. Configura tarifas para ver el desglose.
            </p>
          ) : (
            <div className="space-y-2">
              {breakdown.items.map((item, idx) => {
                const style = BREAKDOWN_STYLE[item.type];
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 ${style.bg}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                      <span className={`text-sm font-medium ${style.text}`}>{item.label}</span>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        item.amount < 0 ? 'text-red-600' : 'text-slate-800'
                      }`}
                    >
                      {item.amount < 0 ? '−' : '+'}
                      {fmt(Math.abs(item.amount))}
                    </span>
                  </div>
                );
              })}

              {/* Subtotal separator */}
              <div className="!mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="font-display text-base font-bold text-slate-900">Total</span>
                <span className="font-display text-xl font-bold text-bici-primary-700">
                  {fmt(breakdown.total)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
