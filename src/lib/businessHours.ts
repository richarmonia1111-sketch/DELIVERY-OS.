import { useMemo } from 'react';
import type { ScheduleSlot, ScheduleHoliday, BusinessStatus } from '../types';

function parseTimeToMinutes(time: string): number {
  if (!time || time === '') return -1;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

function todayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function getDaySchedule(
  dayOfWeek: number,
  slots: ScheduleSlot[],
  zoneId?: string | null,
): { open: string; close: string }[] {
  return slots
    .filter((s) => s.dayOfWeek === dayOfWeek && s.isActive)
    .filter((s) => zoneId === undefined || s.zoneId === null || s.zoneId === zoneId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.openTime.localeCompare(b.openTime))
    .map((s) => ({ open: s.openTime, close: s.closeTime }));
}

function getCurrentSlot(
  currentMinutes: number,
  todaySlots: { open: string; close: string }[],
): { open: string; close: string } | null {
  return todaySlots.find((slot) => {
    const open = parseTimeToMinutes(slot.open);
    const close = parseTimeToMinutes(slot.close);
    return currentMinutes >= open && currentMinutes < close;
  }) ?? null;
}

function findNextOpenDay(
  fromDay: number,
  slots: ScheduleSlot[],
  holidays: ScheduleHoliday[],
): { dayOfWeek: number; hours: { open: string; close: string }[] } | null {
  for (let i = 0; i < 7; i++) {
    const checkDay = (fromDay + i) % 7;
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() + i);
    const dateStr = checkDate.toISOString().split('T')[0];

    const holiday = holidays.find((h) => h.holidayDate === dateStr);
    if (holiday && holiday.isClosed) continue;

    const daySlots = getDaySchedule(checkDay, slots);
    if (daySlots.length > 0) {
      return { dayOfWeek: checkDay, hours: daySlots };
    }
  }
  return null;
}

export function computeBusinessStatus(
  slots: ScheduleSlot[],
  holidays: ScheduleHoliday[],
  now: Date = new Date(),
  zoneId?: string | null,
): BusinessStatus {
  const dayOfWeek = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayStr = now.toISOString().split('T')[0];

  // Check for holiday/special day override
  const holiday = holidays.find((h) => h.holidayDate === todayStr);

  if (holiday) {
    if (holiday.isClosed) {
      const nextDay = findNextOpenDay((dayOfWeek + 1) % 7, slots, holidays);
      return {
        isOpen: false,
        label: 'Cerrado',
        nextOpenLabel: nextDay
          ? `Abre ${DAYS_OF_WEEK[nextDay.dayOfWeek]} ${nextDay.hours[0]?.open ?? ''}`
          : null,
        todayHours: [],
        currentSlot: null,
        isSpecialDay: true,
        specialDayName: holiday.name,
      };
    }
    // Special hours override
    if (holiday.openTime && holiday.closeTime) {
      const open = parseTimeToMinutes(holiday.openTime);
      const close = parseTimeToMinutes(holiday.closeTime);
      const isOpen = currentMinutes >= open && currentMinutes < close;
      const todayHours = [{ open: holiday.openTime, close: holiday.closeTime }];
      return {
        isOpen,
        label: isOpen ? 'Abierto' : 'Cerrado',
        nextOpenLabel: isOpen
          ? `Cierra a las ${minutesToLabel(close)}`
          : `Horario especial: ${holiday.openTime} - ${holiday.closeTime}`,
        todayHours,
        currentSlot: isOpen ? { open: holiday.openTime, close: holiday.closeTime } : null,
        isSpecialDay: true,
        specialDayName: holiday.name,
      };
    }
  }

  // Normal schedule
  const todaySlots = getDaySchedule(dayOfWeek, slots, zoneId);
  const currentSlot = getCurrentSlot(currentMinutes, todaySlots);

  if (currentSlot) {
    const close = parseTimeToMinutes(currentSlot.close);
    return {
      isOpen: true,
      label: 'Abierto',
      nextOpenLabel: `Cierra a las ${minutesToLabel(close)}`,
      todayHours,
      currentSlot,
      isSpecialDay: false,
      specialDayName: null,
    };
  }

  // Closed — find next opening today or this week
  const upcomingToday = todaySlots.find((slot) => parseTimeToMinutes(slot.open) > currentMinutes);
  if (upcomingToday) {
    return {
      isOpen: false,
      label: 'Cerrado',
      nextOpenLabel: `Abre hoy a las ${minutesToLabel(parseTimeToMinutes(upcomingToday.open))}`,
      todayHours,
      currentSlot: null,
      isSpecialDay: false,
      specialDayName: null,
    };
  }

  const nextDay = findNextOpenDay((dayOfWeek + 1) % 7, slots, holidays);
  return {
    isOpen: false,
    label: 'Cerrado',
    nextOpenLabel: nextDay
      ? `Abre ${DAYS_OF_WEEK[nextDay.dayOfWeek]} a las ${minutesToLabel(parseTimeToMinutes(nextDay.hours[0]?.open ?? '08:00'))}`
      : 'Sin horarios configurados',
    todayHours,
    currentSlot: null,
    isSpecialDay: false,
    specialDayName: null,
  };
}

export { parseTimeToMinutes, minutesToLabel, formatDateLong, todayDateString, getDaySchedule };

import { DAYS_OF_WEEK } from '../types';
