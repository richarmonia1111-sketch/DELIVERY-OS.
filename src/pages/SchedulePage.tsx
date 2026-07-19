import { useState, useEffect } from 'react';
import {
  Clock, Calendar, Plus, Trash2, Check, X, Circle, CalendarOff, Timer,
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { useStore } from '../store';
import { useConfig } from '../lib/config';
import { supabase } from '../lib/supabase';
import {
  computeBusinessStatus, getDaySchedule, minutesToLabel, formatDateLong,
} from '../lib/businessHours';
import {
  DAYS_OF_WEEK, HOLIDAY_TYPE_LABELS,
  type ScheduleSlot, type ScheduleHoliday, type HolidayType,
} from '../types';

type Tab = 'weekly' | 'special' | 'live';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'weekly', label: 'Horario Semanal', icon: Clock },
  { id: 'special', label: 'Días Especiales', icon: Calendar },
  { id: 'live', label: 'Estado en Vivo', icon: Circle },
];

// Monday(1) → Sunday(0) display order
const DISPLAY_DAYS = [1, 2, 3, 4, 5, 6, 0];

/** Convert a "HH:MM" string into a human-friendly 12h label. */
function timeToLabel(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  return minutesToLabel(h * 60 + m);
}

export default function SchedulePage() {
  const [tab, setTab] = useState<Tab>('weekly');

  return (
    <AppLayout
      title="Módulo de Horarios"
      subtitle="Configura tu horario semanal, días especiales y consulta el estado en vivo."
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

      {tab === 'weekly' && <WeeklyScheduleTab />}
      {tab === 'special' && <SpecialDaysTab />}
      {tab === 'live' && <LiveStatusTab />}
    </AppLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 1 — Horario Semanal                                            */
/* ------------------------------------------------------------------ */

function WeeklyScheduleTab() {
  const { config } = useConfig();
  const { scheduleSlots } = useStore();
  const [slots, setSlots] = useState<ScheduleSlot[]>(scheduleSlots);

  useEffect(() => setSlots(scheduleSlots), [scheduleSlots]);

  const daySlots = (dayOfWeek: number) =>
    slots
      .filter((s) => s.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.openTime.localeCompare(b.openTime));

  const addSlot = async (dayOfWeek: number) => {
    const count = daySlots(dayOfWeek).length;
    try {
      const { data, error } = await supabase
        .from('schedule_slots')
        .insert({
          company_id: config.id,
          day_of_week: dayOfWeek,
          open_time: '08:00',
          close_time: '14:00',
          is_active: true,
          sort_order: count,
        })
        .select()
        .single();
      if (error) throw error;
      setSlots([
        ...slots,
        {
          id: data.id,
          companyId: data.company_id,
          dayOfWeek: data.day_of_week,
          openTime: data.open_time,
          closeTime: data.close_time,
          isActive: data.is_active,
          sortOrder: data.sort_order,
          zoneId: data.zone_id ?? null,
          serviceTypeConfigId: data.service_type_config_id ?? null,
        },
      ]);
    } catch { /* ignore */ }
  };

  const updateTime = async (id: string, field: 'open_time' | 'close_time', value: string) => {
    const localField = field === 'open_time' ? 'openTime' : 'closeTime';
    setSlots(slots.map((s) => (s.id === id ? { ...s, [localField]: value } : s)));
    try {
      await supabase.from('schedule_slots').update({ [field]: value }).eq('id', id);
    } catch { /* ignore */ }
  };

  const deleteSlot = async (id: string) => {
    try {
      await supabase.from('schedule_slots').delete().eq('id', id);
      setSlots(slots.filter((s) => s.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-3">
      {DISPLAY_DAYS.map((dayNum) => {
        const items = daySlots(dayNum);
        return (
          <div key={dayNum} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
            <div className="w-40 shrink-0">
              <p className="inline-flex items-center gap-2 font-medium text-slate-800">
                <Clock className="h-4 w-4 text-slate-400" />
                {DAYS_OF_WEEK[dayNum]}
              </p>
            </div>

            <div className="flex-1 space-y-2">
              {items.length === 0 ? (
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-sm text-red-600">
                    <CalendarOff className="h-4 w-4" /> Cerrado
                  </span>
                  <button onClick={() => addSlot(dayNum)} className="btn-ghost text-xs">
                    <Plus className="h-4 w-4" /> Agregar horario
                  </button>
                </div>
              ) : (
                <>
                  {items.map((slot) => (
                    <div key={slot.id} className="flex items-center gap-2">
                      <input
                        type="time"
                        className="input-field w-32"
                        value={slot.openTime}
                        onChange={(e) => updateTime(slot.id, 'open_time', e.target.value)}
                      />
                      <span className="text-slate-400">—</span>
                      <input
                        type="time"
                        className="input-field w-32"
                        value={slot.closeTime}
                        onChange={(e) => updateTime(slot.id, 'close_time', e.target.value)}
                      />
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        className="btn-ghost text-xs text-red-600 hover:bg-red-50"
                        aria-label="Eliminar horario"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addSlot(dayNum)} className="btn-ghost text-xs">
                    <Plus className="h-4 w-4" /> Agregar horario
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}

      {slots.length === 0 && (
        <div className="card p-8 text-center text-slate-400">
          <Clock className="mx-auto mb-2 h-8 w-8" />
          <p>No hay horarios configurados. Agrega un horario a cada día.</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 2 — Días Especiales                                            */
/* ------------------------------------------------------------------ */

function SpecialDaysTab() {
  const { config } = useConfig();
  const { holidays: storeHolidays } = useStore();
  const [holidays, setHolidays] = useState<ScheduleHoliday[]>(storeHolidays);

  useEffect(() => {
    setHolidays([...storeHolidays].sort((a, b) => a.holidayDate.localeCompare(b.holidayDate)));
  }, [storeHolidays]);

  const [form, setForm] = useState({
    name: '',
    holidayDate: '',
    holidayType: 'holiday' as HolidayType,
    isClosed: true,
    openTime: '09:00',
    closeTime: '15:00',
  });

  const addHoliday = async () => {
    if (!form.name.trim() || !form.holidayDate) return;
    try {
      const { data, error } = await supabase
        .from('schedule_holidays')
        .insert({
          company_id: config.id,
          name: form.name.trim(),
          holiday_date: form.holidayDate,
          is_closed: form.isClosed,
          open_time: form.isClosed ? '' : form.openTime,
          close_time: form.isClosed ? '' : form.closeTime,
          holiday_type: form.holidayType,
        })
        .select()
        .single();
      if (error) throw error;
      const next: ScheduleHoliday = {
        id: data.id,
        companyId: data.company_id,
        name: data.name,
        holidayDate: data.holiday_date,
        isClosed: data.is_closed,
        openTime: data.open_time ?? '',
        closeTime: data.close_time ?? '',
        holidayType: data.holiday_type,
      };
      setHolidays([...holidays, next].sort((a, b) => a.holidayDate.localeCompare(b.holidayDate)));
      setForm({
        name: '',
        holidayDate: '',
        holidayType: 'holiday',
        isClosed: true,
        openTime: '09:00',
        closeTime: '15:00',
      });
    } catch { /* ignore */ }
  };

  const deleteHoliday = async (id: string) => {
    try {
      await supabase.from('schedule_holidays').delete().eq('id', id);
      setHolidays(holidays.filter((h) => h.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="card space-y-4 p-4">
        <p className="inline-flex items-center gap-2 font-medium text-slate-800">
          <Calendar className="h-4 w-4 text-slate-400" /> Nuevo día especial
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label-field">Nombre</label>
            <input
              className="input-field"
              placeholder="Ej. Día de la Independencia"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Fecha</label>
            <input
              type="date"
              className="input-field"
              value={form.holidayDate}
              onChange={(e) => setForm({ ...form, holidayDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Tipo</label>
            <select
              className="input-field"
              value={form.holidayType}
              onChange={(e) => setForm({ ...form, holidayType: e.target.value as HolidayType })}
            >
              {(Object.keys(HOLIDAY_TYPE_LABELS) as HolidayType[]).map((t) => (
                <option key={t} value={t}>{HOLIDAY_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={form.isClosed}
                onChange={(e) => setForm({ ...form, isClosed: e.target.checked })}
              />
              Cerrado todo el día
            </label>
          </div>
          {!form.isClosed && (
            <div>
              <label className="label-field">Apertura</label>
              <input
                type="time"
                className="input-field"
                value={form.openTime}
                onChange={(e) => setForm({ ...form, openTime: e.target.value })}
              />
            </div>
          )}
          {!form.isClosed && (
            <div>
              <label className="label-field">Cierre</label>
              <input
                type="time"
                className="input-field"
                value={form.closeTime}
                onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
              />
            </div>
          )}
        </div>
        <button onClick={addHoliday} className="btn-primary">
          <Plus className="h-4 w-4" /> Agregar día especial
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {holidays.map((h) => {
          const typeKey = (h.holidayType ?? 'special_hours') as HolidayType;
          const typeLabel = HOLIDAY_TYPE_LABELS[typeKey] ?? 'Día especial';
          return (
            <div key={h.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-800">{h.name}</p>
                  <p className="text-sm capitalize text-slate-500">{formatDateLong(h.holidayDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge bg-amber-100 text-amber-700">{typeLabel}</span>
                {h.isClosed ? (
                  <span className="badge bg-red-100 text-red-700">
                    <CalendarOff className="h-3 w-3" /> Cerrado
                  </span>
                ) : (
                  <span className="text-sm text-slate-600">
                    {timeToLabel(h.openTime)} — {timeToLabel(h.closeTime)}
                  </span>
                )}
                <button
                  onClick={() => deleteHoliday(h.id)}
                  className="btn-ghost text-xs text-red-600 hover:bg-red-50"
                  aria-label="Eliminar día especial"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        {holidays.length === 0 && (
          <div className="card p-8 text-center text-slate-400">
            <Calendar className="mx-auto mb-2 h-8 w-8" />
            <p>No hay días especiales configurados</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 3 — Estado en Vivo                                             */
/* ------------------------------------------------------------------ */

function LiveStatusTab() {
  const { scheduleSlots, holidays } = useStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const status = computeBusinessStatus(scheduleSlots, holidays, now);

  return (
    <div className="space-y-4">
      {/* Big status card */}
      <div className={`card p-8 ${status.isOpen ? 'ring-bici-primary-200' : 'ring-red-200'}`}>
        <div className="flex items-center gap-4">
          <Circle
            className={`h-10 w-10 ${status.isOpen ? 'text-bici-primary-500' : 'text-red-500'}`}
            fill="currentColor"
          />
          <div>
            <p
              className={`font-display text-3xl font-bold ${
                status.isOpen ? 'text-bici-primary-700' : 'text-red-600'
              }`}
            >
              {status.isOpen ? 'Abierto' : 'Cerrado'}
            </p>
            {status.isOpen ? (
              <span className="badge mt-1 inline-flex items-center gap-1 bg-bici-primary-100 text-bici-primary-700">
                <Check className="h-3 w-3" /> Abierto ahora
              </span>
            ) : (
              <span className="badge mt-1 inline-flex items-center gap-1 bg-red-100 text-red-700">
                <X className="h-3 w-3" /> Cerrado ahora
              </span>
            )}
          </div>
        </div>

        {status.nextOpenLabel && (
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600">
            <Timer className="h-4 w-4 text-slate-400" />
            {status.nextOpenLabel}
          </p>
        )}

        {status.isSpecialDay && status.specialDayName && (
          <span className="badge mt-3 inline-flex items-center gap-1 bg-amber-100 text-amber-700">
            <Calendar className="h-3 w-3" /> {status.specialDayName}
          </span>
        )}
      </div>

      {/* Today's hours */}
      <div className="card p-4">
        <h3 className="mb-2 inline-flex items-center gap-2 font-medium text-slate-800">
          <Clock className="h-4 w-4 text-slate-400" /> Horario de hoy
        </h3>
        {status.todayHours.length === 0 ? (
          <p className="inline-flex items-center gap-1 text-sm text-red-600">
            <X className="h-4 w-4" /> Cerrado hoy
          </p>
        ) : (
          <ul className="space-y-1">
            {status.todayHours.map((h, i) => (
              <li key={i} className="text-sm text-slate-700">
                {timeToLabel(h.open)} — {timeToLabel(h.close)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Weekly summary */}
      <div className="card p-4">
        <h3 className="mb-3 inline-flex items-center gap-2 font-medium text-slate-800">
          <Calendar className="h-4 w-4 text-slate-400" /> Resumen semanal
        </h3>
        <div className="space-y-2">
          {DISPLAY_DAYS.map((dayNum) => {
            const hours = getDaySchedule(dayNum, scheduleSlots);
            return (
              <div
                key={dayNum}
                className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0"
              >
                <span className="w-32 text-sm font-medium text-slate-700">
                  {DAYS_OF_WEEK[dayNum]}
                </span>
                <span className="flex-1 text-right text-sm text-slate-600">
                  {hours.length === 0 ? (
                    <span className="inline-flex items-center gap-1 text-red-500">
                      <CalendarOff className="h-3 w-3" /> Cerrado
                    </span>
                  ) : (
                    hours.map((h, i) => (
                      <span key={i}>
                        {timeToLabel(h.open)} — {timeToLabel(h.close)}
                        {i < hours.length - 1 ? ', ' : ''}
                      </span>
                    ))
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="inline-flex items-center gap-1 text-xs text-slate-400">
        <Timer className="h-3 w-3" /> Actualizado automáticamente cada 60 segundos ·{' '}
        {now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
}
