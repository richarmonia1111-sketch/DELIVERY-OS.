import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, MapPin, DollarSign, Clock, Bike,
  Plus, Trash2, Check, Save, AlertCircle, ArrowRight,
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { useConfig } from '../lib/config';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';
import { DAYS_OF_WEEK, TARIFF_TYPE_LABELS, type TariffType } from '../types';

type Tab = 'company' | 'coverage' | 'tariffs' | 'schedule' | 'vehicles';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'company', label: 'Empresa', icon: Building2 },
  { id: 'coverage', label: 'Cobertura', icon: MapPin },
  { id: 'tariffs', label: 'Tarifas', icon: DollarSign },
  { id: 'schedule', label: 'Horarios', icon: Clock },
  { id: 'vehicles', label: 'Repartidores', icon: Bike },
];

export default function ConfigPage() {
  const [tab, setTab] = useState<Tab>('company');

  return (
    <AppLayout title="Configuración general" subtitle="Administra la configuración de tu empresa sin tocar código.">
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

      {tab === 'company' && <CompanyTab />}
      {tab === 'coverage' && <CoverageTab />}
      {tab === 'tariffs' && <TariffsTab />}
      {tab === 'schedule' && <ScheduleTab />}
      {tab === 'vehicles' && <VehiclesTab />}
    </AppLayout>
  );
}

function CompanyTab() {
  const { config, setConfig } = useConfig();
  const [form, setForm] = useState(config);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: form.name, description: form.description,
          logo_url: form.logoUrl, icon_url: form.iconUrl,
          primary_color: form.primaryColor, secondary_color: form.secondaryColor,
          accent_color: form.accentColor, slogan: form.slogan,
          whatsapp: form.whatsapp, phone: form.phone, email: form.email,
          website: form.website, facebook: form.facebook,
          instagram: form.instagram, tiktok: form.tiktok,
          updated_at: new Date().toISOString(),
        })
        .eq('id', form.id);
      if (error) throw error;
      setConfig(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Error — keep form editable
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: keyof typeof form; label: string; placeholder?: string }[] = [
    { key: 'name', label: 'Nombre de la empresa', placeholder: 'Bici Express' },
    { key: 'description', label: 'Descripción' },
    { key: 'slogan', label: 'Eslogan' },
    { key: 'logoUrl', label: 'URL del logotipo' },
    { key: 'iconUrl', label: 'URL del icono' },
    { key: 'primaryColor', label: 'Color primario (hex sin #)' },
    { key: 'secondaryColor', label: 'Color secundario (hex sin #)' },
    { key: 'accentColor', label: 'Color de acento (hex sin #)' },
    { key: 'whatsapp', label: 'WhatsApp (con código país)' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'email', label: 'Correo electrónico' },
    { key: 'website', label: 'Sitio web' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'tiktok', label: 'TikTok' },
  ];

  return (
    <div className="card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={f.key === 'description' || f.key === 'slogan' ? 'sm:col-span-2' : ''}>
            <label className="label-field">{f.label}</label>
            <input
              className="input-field"
              value={form[f.key] as string}
              placeholder={f.placeholder}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
        <div className="flex gap-2">
          <div className="h-10 w-10 rounded-lg" style={{ background: `#${form.primaryColor}` }} />
          <div className="h-10 w-10 rounded-lg" style={{ background: `#${form.secondaryColor}` }} />
          <div className="h-10 w-10 rounded-lg" style={{ background: `#${form.accentColor}` }} />
        </div>
        <p className="text-sm text-slate-500">Vista previa de los colores de la marca.</p>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary mt-6">
        {saving ? 'Guardando...' : saved ? (
          <><Check className="h-4 w-4" /> Guardado</>
        ) : (
          <><Save className="h-4 w-4" /> Guardar cambios</>
        )}
      </button>
    </div>
  );
}

function CoverageTab() {
  const { config } = useConfig();
  const { coverageZones } = useStore();
  const [zones, setZones] = useState(coverageZones);
  const [newName, setNewName] = useState('');

  useEffect(() => setZones(coverageZones), [coverageZones]);

  const addZone = async () => {
    if (!newName.trim()) return;
    try {
      const { data, error } = await supabase
        .from('coverage_zones')
        .insert({ company_id: config.id, name: newName.trim(), is_active: true })
        .select()
        .single();
      if (error) throw error;
      setZones([...zones, { id: data.id, companyId: data.company_id, name: data.name, isActive: data.is_active }]);
      setNewName('');
    } catch { /* ignore */ }
  };

  const toggleZone = async (id: string, isActive: boolean) => {
    try {
      await supabase.from('coverage_zones').update({ is_active: !isActive }).eq('id', id);
      setZones(zones.map((z) => z.id === id ? { ...z, isActive: !isActive } : z));
    } catch { /* ignore */ }
  };

  const deleteZone = async (id: string) => {
    try {
      await supabase.from('coverage_zones').delete().eq('id', id);
      setZones(zones.filter((z) => z.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            placeholder="Nombre de la zona (ej. Centro, Norte...)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addZone()}
          />
          <button onClick={addZone} className="btn-primary shrink-0">
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {zones.map((z) => (
          <div key={z.id} className="card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-800">{z.name}</p>
                <span className={`badge ${z.isActive ? 'bg-bici-primary-100 text-bici-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                  {z.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleZone(z.id, z.isActive)}
                className="btn-ghost text-xs"
              >
                {z.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button onClick={() => deleteZone(z.id)} className="btn-ghost text-xs text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {zones.length === 0 && (
          <div className="card p-8 text-center text-slate-400">
            <MapPin className="mx-auto mb-2 h-8 w-8" />
            <p>No hay zonas configuradas</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TariffsTab() {
  return (
    <Link to="/tariffs" className="group card flex items-center justify-between p-6 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <DollarSign className="h-7 w-7" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-900">Gestión de Tarifas</h3>
          <p className="mt-1 text-sm text-slate-500">Reglas de cobro configurables, tarifas por zona, promociones, tarifas para negocios y simulador de costos.</p>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-bici-primary-500" />
    </Link>
  );
}

function ScheduleTab() {
  return (
    <Link to="/schedule" className="group card flex items-center justify-between p-6 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600">
          <Clock className="h-7 w-7" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-900">Módulo de Horarios</h3>
          <p className="mt-1 text-sm text-slate-500">Horario semanal con múltiples franjas, días especiales, estado automático en vivo y vista pública.</p>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-bici-primary-500" />
    </Link>
  );
}

function VehiclesTab() {
  const { config } = useConfig();
  const { vehicleTypes } = useStore();
  const [items, setItems] = useState(vehicleTypes);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('bike');

  useEffect(() => setItems(vehicleTypes), [vehicleTypes]);

  const addVehicle = async () => {
    if (!newName.trim()) return;
    try {
      const { data, error } = await supabase
        .from('vehicle_types')
        .insert({ company_id: config.id, name: newName.trim(), icon: newIcon, is_active: true })
        .select()
        .single();
      if (error) throw error;
      setItems([...items, { id: data.id, companyId: data.company_id, name: data.name, icon: data.icon, isActive: data.is_active }]);
      setNewName('');
    } catch { /* ignore */ }
  };

  const toggleVehicle = async (id: string, isActive: boolean) => {
    try {
      await supabase.from('vehicle_types').update({ is_active: !isActive }).eq('id', id);
      setItems(items.map((v) => v.id === id ? { ...v, isActive: !isActive } : v));
    } catch { /* ignore */ }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await supabase.from('vehicle_types').delete().eq('id', id);
      setItems(items.filter((v) => v.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          <input
            className="input-field flex-1"
            placeholder="Nombre del tipo (ej. Drone, Camioneta...)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <select className="input-field w-40" value={newIcon} onChange={(e) => setNewIcon(e.target.value)}>
            <option value="bike">Bicicleta</option>
            <option value="moto">Moto</option>
            <option value="car">Automóvil</option>
            <option value="foot">Pie</option>
            <option value="other">Otro</option>
          </select>
          <button onClick={addVehicle} className="btn-primary shrink-0">
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((v) => (
          <div key={v.id} className="card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Bike className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-slate-800">{v.name}</p>
                <span className={`badge ${v.isActive ? 'bg-bici-primary-100 text-bici-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                  {v.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleVehicle(v.id, v.isActive)} className="btn-ghost text-xs">
                {v.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button onClick={() => deleteVehicle(v.id)} className="btn-ghost text-xs text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
