import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from 'react';
import { supabase } from './lib/supabase';
import { useConfig } from './lib/config';
import {
  type Order, type OrderStatus, type ToastMessage, type Tariff,
  type CoverageZone, type VehicleType, type ScheduleGeneralEntry,
  type ServiceTypeConfig, type TariffZoneRate, type TariffEstablishmentRate,
  type TariffTimeModifier, type TariffBusinessRate, type TariffPromotion,
  type ScheduleSlot, type ScheduleHoliday,
  STATUS_FLOW, STATUS_LABELS, canTransition, nextStatus,
  DEFAULT_COMPANY_CONFIG,
} from './types';
import {
  MOCK_BUSINESSES, MOCK_DRIVERS, MOCK_ORDERS,
} from './mockData';

interface StoreContextValue {
  orders: Order[];
  drivers: typeof MOCK_DRIVERS;
  businesses: typeof MOCK_BUSINESSES;
  tariffs: Tariff[];
  coverageZones: CoverageZone[];
  vehicleTypes: VehicleType[];
  scheduleGeneral: ScheduleGeneralEntry[];
  scheduleSlots: ScheduleSlot[];
  holidays: ScheduleHoliday[];
  serviceTypes: ServiceTypeConfig[];
  zoneRates: TariffZoneRate[];
  establishmentRates: TariffEstablishmentRate[];
  timeModifiers: TariffTimeModifier[];
  businessRates: TariffBusinessRate[];
  promotions: TariffPromotion[];
  customerCount: number;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string) => void;
  dismissToast: (id: string) => void;
  createOrder: (data: {
    customerName: string; customerPhone: string; address: string;
    reference?: string; notes: string; serviceType: Order['serviceType'];
    establishments: string[]; cost: number;
  }) => Promise<Order>;
  transitionOrder: (orderId: string, to: OrderStatus) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  assignDriver: (orderId: string, driverId: string) => Promise<boolean>;
  resetData: () => void;
  loading: boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id,
    companyId: row.company_id,
    code: row.code,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    address: row.address,
    reference: row.reference ?? '',
    notes: row.notes ?? '',
    serviceType: row.service_type,
    establishments: row.establishments ?? [],
    cost: Number(row.cost ?? 0),
    status: row.status,
    driverId: row.driver_id ?? null,
    incident: row.incident ?? '',
    createdAt: row.created_at ? new Date(row.created_at as string).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at as string).getTime() : Date.now(),
    timeline: [],
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { config } = useConfig();
  const companyId = config.id;

  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<typeof MOCK_DRIVERS>(MOCK_DRIVERS);
  const [businesses, setBusinesses] = useState<typeof MOCK_BUSINESSES>(MOCK_BUSINESSES);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [coverageZones, setCoverageZones] = useState<CoverageZone[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [scheduleGeneral, setScheduleGeneral] = useState<ScheduleGeneralEntry[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [holidays, setHolidays] = useState<ScheduleHoliday[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeConfig[]>([]);
  const [zoneRates, setZoneRates] = useState<TariffZoneRate[]>([]);
  const [establishmentRates, setEstablishmentRates] = useState<TariffEstablishmentRate[]>([]);
  const [timeModifiers, setTimeModifiers] = useState<TariffTimeModifier[]>([]);
  const [businessRates, setBusinessRates] = useState<TariffBusinessRate[]>([]);
  const [promotions, setPromotions] = useState<TariffPromotion[]>([]);
  const [customerCount, setCustomerCount] = useState(3);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const toastTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Load all tenant data from Supabase
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [bizRes, drvRes, ordRes, tarRes, zoneRes, vehRes, schedRes, svcRes, zrRes, erRes, tmRes, brRes, promoRes, slotsRes, holsRes] = await Promise.all([
          supabase.from('businesses').select('*').eq('company_id', companyId),
          supabase.from('drivers').select('*').eq('company_id', companyId),
          supabase.from('orders').select('*').eq('company_id', companyId).order('created_at', { ascending: false }),
          supabase.from('tariffs').select('*').eq('company_id', companyId),
          supabase.from('coverage_zones').select('*').eq('company_id', companyId),
          supabase.from('vehicle_types').select('*').eq('company_id', companyId),
          supabase.from('schedule_general').select('*').eq('company_id', companyId),
          supabase.from('service_types_config').select('*').eq('company_id', companyId),
          supabase.from('tariff_zone_rates').select('*').eq('company_id', companyId),
          supabase.from('tariff_establishment_rates').select('*').eq('company_id', companyId),
          supabase.from('tariff_time_modifiers').select('*').eq('company_id', companyId),
          supabase.from('tariff_business_rates').select('*').eq('company_id', companyId),
          supabase.from('tariff_promotions').select('*').eq('company_id', companyId),
          supabase.from('schedule_slots').select('*').eq('company_id', companyId).order('day_of_week', { ascending: true }).order('sort_order', { ascending: true }),
          supabase.from('schedule_holidays').select('*').eq('company_id', companyId).order('holiday_date', { ascending: true }),
        ]);

        if (cancelled) return;

        if (bizRes.data && bizRes.data.length > 0) {
          setBusinesses(bizRes.data.map((r: Record<string, unknown>) => ({
            id: r.id, companyId: r.company_id, name: r.name, category: r.category,
            address: r.address ?? '', hours: r.hours ?? '', is_open: r.is_open,
            photo: r.photo ?? '', tags: r.tags ?? [],
          })) as typeof MOCK_BUSINESSES);
        }
        if (drvRes.data && drvRes.data.length > 0) {
          setDrivers(drvRes.data.map((r: Record<string, unknown>) => ({
            id: r.id, companyId: r.company_id, name: r.name, phone: r.phone ?? '',
            zone: r.zone ?? '', status: r.status, rating: Number(r.rating ?? 5),
            totalDeliveries: r.total_deliveries ?? 0, vehicleTypeId: r.vehicle_type_id ?? null,
          })) as typeof MOCK_DRIVERS);
        }
        if (ordRes.data) {
          const mapped = ordRes.data.map(mapOrder);
          // Load timelines for each order
          const timelinePromises = mapped.map((o) =>
            supabase.from('order_timeline').select('*').eq('order_id', o.id).order('timestamp', { ascending: true }),
          );
          const timelines = await Promise.all(timelinePromises);
          mapped.forEach((o, i) => {
            o.timeline = (timelines[i].data ?? []).map((t: Record<string, unknown>) => ({
              id: t.id, orderId: t.order_id, status: t.status, label: t.label,
              note: t.note ?? '', timestamp: new Date(t.timestamp as string).getTime(),
            }));
          });
          setOrders(mapped);
        }
        if (tarRes.data) setTariffs(tarRes.data as unknown as Tariff[]);
        if (zoneRes.data) setCoverageZones(zoneRes.data as unknown as CoverageZone[]);
        if (vehRes.data) setVehicleTypes(vehRes.data as unknown as VehicleType[]);
        if (schedRes.data) setScheduleGeneral(schedRes.data as unknown as ScheduleGeneralEntry[]);
        if (svcRes.data) setServiceTypes(svcRes.data as unknown as ServiceTypeConfig[]);
        if (zrRes.data) setZoneRates(zrRes.data as unknown as TariffZoneRate[]);
        if (erRes.data) setEstablishmentRates(erRes.data as unknown as TariffEstablishmentRate[]);
        if (tmRes.data) setTimeModifiers(tmRes.data as unknown as TariffTimeModifier[]);
        if (brRes.data) setBusinessRates(brRes.data as unknown as TariffBusinessRate[]);
        if (promoRes.data) setPromotions(promoRes.data as unknown as TariffPromotion[]);
        if (slotsRes.data) setScheduleSlots(slotsRes.data as unknown as ScheduleSlot[]);
        if (holsRes.data) setHolidays(holsRes.data as unknown as ScheduleHoliday[]);
      } catch {
        // Keep mock data as fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [companyId]);

  // Toast management
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = toastTimers.current.get(id);
    if (timer) { clearTimeout(timer); toastTimers.current.delete(id); }
  }, []);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      toastTimers.current.delete(id);
    }, 4000);
    toastTimers.current.set(id, timer);
  }, []);

  const createOrder = useCallback(async (data: {
    customerName: string; customerPhone: string; address: string;
    reference?: string; notes: string; serviceType: Order['serviceType'];
    establishments: string[]; cost: number;
  }): Promise<Order> => {
    const code = `BX-${String(orders.length + 1).padStart(3, '0')}`;
    try {
      const { data: row, error } = await supabase.from('orders').insert({
        company_id: companyId, code, customer_name: data.customerName,
        customer_phone: data.customerPhone, address: data.address,
        reference: data.reference ?? '', notes: data.notes,
        service_type: data.serviceType, establishments: data.establishments,
        cost: data.cost, status: 'solicitado',
      }).select().single();
      if (error) throw error;

      await supabase.from('order_timeline').insert({
        order_id: row.id, status: 'solicitado', label: 'Pedido solicitado',
      });

      const newOrder = mapOrder(row);
      newOrder.timeline = [{ status: 'solicitado', label: 'Pedido solicitado', timestamp: Date.now() }];
      setOrders((prev) => [newOrder, ...prev]);
      setCustomerCount((c) => c + 1);
      addToast('success', `Pedido ${code} creado correctamente`);
      return newOrder;
    } catch {
      addToast('error', 'Error al crear el pedido');
      throw new Error('Failed to create order');
    }
  }, [companyId, orders.length, addToast]);

  const transitionOrder = useCallback(async (orderId: string, to: OrderStatus): Promise<boolean> => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || !canTransition(order.status, to)) {
      addToast('error', 'Transición no permitida');
      return false;
    }
    try {
      await supabase.from('orders').update({ status: to, updated_at: new Date().toISOString() }).eq('id', orderId);
      const labelMap: Record<OrderStatus, string> = {
        ...STATUS_LABELS, en_compra: 'Repartidor en compra', en_camino: 'Repartidor en camino',
      };
      await supabase.from('order_timeline').insert({
        order_id: orderId, status: to, label: labelMap[to],
      });
      setOrders((prev) => prev.map((o) => o.id === orderId ? {
        ...o, status: to, updatedAt: Date.now(),
        timeline: [...o.timeline, { status: to, label: labelMap[to], timestamp: Date.now() }],
      } : o));
      addToast('success', `Pedido actualizado a "${STATUS_LABELS[to]}"`);
      return true;
    } catch {
      addToast('error', 'Error al actualizar el pedido');
      return false;
    }
  }, [orders, addToast]);

  const cancelOrder = useCallback(async (orderId: string): Promise<boolean> => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || (order.status !== 'solicitado' && order.status !== 'confirmado')) {
      addToast('error', 'No se puede cancelar un pedido en progreso');
      return false;
    }
    try {
      await supabase.from('orders').update({ status: 'cancelado', updated_at: new Date().toISOString() }).eq('id', orderId);
      await supabase.from('order_timeline').insert({
        order_id: orderId, status: 'cancelado', label: 'Pedido cancelado',
      });
      setOrders((prev) => prev.map((o) => o.id === orderId ? {
        ...o, status: 'cancelado', updatedAt: Date.now(),
        timeline: [...o.timeline, { status: 'cancelado', label: 'Pedido cancelado', timestamp: Date.now() }],
      } : o));
      addToast('warning', 'Pedido cancelado');
      return true;
    } catch {
      addToast('error', 'Error al cancelar el pedido');
      return false;
    }
  }, [orders, addToast]);

  const assignDriver = useCallback(async (orderId: string, driverId: string): Promise<boolean> => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || (order.status !== 'solicitado' && order.status !== 'confirmado')) {
      addToast('error', 'No se puede asignar repartidor a este pedido');
      return false;
    }
    try {
      await supabase.from('orders').update({ driver_id: driverId, updated_at: new Date().toISOString() }).eq('id', orderId);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, driverId, updatedAt: Date.now() } : o));
      const driver = drivers.find((d) => d.id === driverId);
      addToast('info', `Repartidor ${driver?.name ?? ''} asignado`);
      return true;
    } catch {
      addToast('error', 'Error al asignar repartidor');
      return false;
    }
  }, [orders, drivers, addToast]);

  const resetData = useCallback(() => {
    addToast('info', 'Datos restablecidos');
    setOrders([]);
    setCustomerCount(0);
  }, [addToast]);

  const value = useMemo<StoreContextValue>(() => ({
    orders, drivers, businesses, tariffs, coverageZones, vehicleTypes,
    scheduleGeneral, customerCount, toasts, addToast, dismissToast,
    createOrder, transitionOrder, cancelOrder, assignDriver, resetData, loading,
    serviceTypes, zoneRates, establishmentRates, timeModifiers, businessRates, promotions,
    scheduleSlots, holidays,
  }), [orders, drivers, businesses, tariffs, coverageZones, vehicleTypes,
      scheduleGeneral, customerCount, toasts, addToast, dismissToast,
      createOrder, transitionOrder, cancelOrder, assignDriver, resetData, loading,
      serviceTypes, zoneRates, establishmentRates, timeModifiers, businessRates, promotions,
      scheduleSlots, holidays]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAutoplay(enabled: boolean, intervalMs = 15000) {
  const { orders, transitionOrder } = useStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    timerRef.current = setInterval(() => {
      const activeOrders = orders.filter(
        (o) => STATUS_FLOW.includes(o.status) && o.status !== 'entregado',
      );
      if (activeOrders.length === 0) return;
      const order = activeOrders[Math.floor(Math.random() * activeOrders.length)];
      const nxt = nextStatus(order.status);
      if (nxt) transitionOrder(order.id, nxt);
    }, intervalMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [enabled, intervalMs, orders, transitionOrder]);

  return null;
}
