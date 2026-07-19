import { useEffect, useState } from 'react';
import { Clock, Circle } from 'lucide-react';
import { useStore } from '../store';
import { computeBusinessStatus, getDaySchedule, minutesToLabel, formatDateLong } from '../lib/businessHours';
import { DAYS_OF_WEEK } from '../types';
import type { BusinessStatus } from '../types';

export default function BusinessHoursDisplay({ compact = false }: { compact?: boolean }) {
  const { scheduleSlots, holidays } = useStore();
  const [status, setStatus] = useState<BusinessStatus | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const update = () => {
      setStatus(computeBusinessStatus(scheduleSlots, holidays));
      setTick((t) => t + 1);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [scheduleSlots, holidays]);

  if (!status) return null;

  const displayDays = [1, 2, 3, 4, 5, 6, 0];

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-sm">
        <Circle
          className={`h-2.5 w-2.5 ${status.isOpen ? 'fill-bici-primary-400 text-bici-primary-400' : 'fill-red-400 text-red-400'}`}
        />
        <span className="text-sm font-medium text-white">
          {status.isOpen ? 'Abierto ahora' : 'Cerrado'}
        </span>
        {status.nextOpenLabel && (
          <span className="text-xs text-white/70">— {status.nextOpenLabel}</span>
        )}
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      {/* Status header */}
      <div className={`flex items-center gap-3 p-5 ${status.isOpen ? 'bg-bici-primary-50' : 'bg-red-50'}`}>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${status.isOpen ? 'bg-bici-primary-100' : 'bg-red-100'}`}>
          <Clock className={`h-6 w-6 ${status.isOpen ? 'text-bici-primary-600' : 'text-red-500'}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Circle className={`h-3 w-3 ${status.isOpen ? 'fill-bici-primary-500 text-bici-primary-500' : 'fill-red-500 text-red-500'}`} />
            <span className={`font-display text-lg font-bold ${status.isOpen ? 'text-bici-primary-700' : 'text-red-600'}`}>
              {status.isOpen ? 'Abierto ahora' : 'Cerrado'}
            </span>
          </div>
          {status.nextOpenLabel && (
            <p className="mt-0.5 text-sm text-slate-500">{status.nextOpenLabel}</p>
          )}
        </div>
      </div>

      {/* Special day banner */}
      {status.isSpecialDay && status.specialDayName && (
        <div className="border-b border-amber-100 bg-amber-50 px-5 py-2.5">
          <p className="text-sm font-medium text-amber-700">
            {status.specialDayName} — {status.isOpen ? 'Horario especial' : 'Cerrado'}
          </p>
        </div>
      )}

      {/* Weekly schedule */}
      <div className="divide-y divide-slate-50">
        {displayDays.map((dow) => {
          const daySlots = getDaySchedule(dow, scheduleSlots);
          const isToday = new Date().getDay() === dow;
          return (
            <div
              key={dow}
              className={`flex items-center justify-between px-5 py-3 ${isToday ? 'bg-bici-primary-50/50' : ''}`}
            >
              <span className={`text-sm font-medium ${isToday ? 'text-bici-primary-700' : 'text-slate-600'}`}>
                {DAYS_OF_WEEK[dow]}
                {isToday && <span className="ml-2 text-xs text-bici-primary-500">Hoy</span>}
              </span>
              <div className="text-right">
                {daySlots.length > 0 ? (
                  <div className="space-y-0.5">
                    {daySlots.map((slot, i) => (
                      <div key={i} className="text-sm text-slate-500">
                        {slot.open} - {slot.close}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">Cerrado</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming special days */}
      {holidays.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Próximos días especiales
          </p>
          <div className="space-y-1.5">
            {holidays
              .filter((h) => new Date(h.holidayDate + 'T00:00:00') >= new Date(new Date().toDateString()))
              .slice(0, 3)
              .map((h) => (
                <div key={h.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{h.name}</span>
                  <span className="text-slate-400">{formatDateLong(h.holidayDate)}</span>
                </div>
              ))}
            {holidays.filter((h) => new Date(h.holidayDate + 'T00:00:00') >= new Date(new Date().toDateString())).length === 0 && (
              <p className="text-sm text-slate-400">No hay días especiales próximos</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
