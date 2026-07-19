export interface CompanyConfig {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  iconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  slogan: string;
  whatsapp: string;
  phone: string;
  email: string;
  website: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  isActive: boolean;
}

export interface CoverageZone {
  id: string;
  companyId: string;
  name: string;
  isActive: boolean;
}

export type TariffType = 'simple' | 'multiple' | 'per_km' | 'surcharge' | 'promotion' | 'business_special';

export interface Tariff {
  id: string;
  companyId: string;
  name: string;
  type: TariffType;
  amount: number;
  isActive: boolean;
  description?: string;
  serviceTypeConfigId?: string | null;
  priority?: number;
}

export interface ServiceTypeConfig {
  id: string;
  companyId: string;
  name: string;
  description: string;
  basePrice: number;
  isActive: boolean;
  isSystem: boolean;
}

export interface TariffZoneRate {
  id: string;
  companyId: string;
  tariffId: string;
  zoneId: string;
  price: number;
}

export interface TariffEstablishmentRate {
  id: string;
  companyId: string;
  tariffId: string;
  establishmentCount: number;
  price: number;
}

export type TimeModifierType = 'surcharge' | 'discount';
export type TimeAmountType = 'fixed' | 'percentage';

export interface TariffTimeModifier {
  id: string;
  companyId: string;
  name: string;
  modifierType: TimeModifierType;
  amountType: TimeAmountType;
  amount: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface TariffBusinessRate {
  id: string;
  companyId: string;
  deliveryCount: number;
  price: number;
  description: string;
  isActive: boolean;
}

export type PromoType = 'first_free' | 'discount' | 'zone_discount' | 'date_discount';
export type PromoDiscountType = 'percentage' | 'fixed';

export interface TariffPromotion {
  id: string;
  companyId: string;
  name: string;
  description: string;
  promoType: PromoType;
  discountType: PromoDiscountType;
  discountAmount: number;
  zoneId: string | null;
  startDate: string | null;
  endDate: string | null;
  maxUses: number | null;
  usesCount: number;
  isActive: boolean;
}

export interface TariffBreakdownItem {
  label: string;
  amount: number;
  type: 'base' | 'zone' | 'establishment' | 'time' | 'business' | 'promotion';
}

export interface TariffBreakdown {
  total: number;
  items: TariffBreakdownItem[];
}

export interface TariffSimulatorInput {
  zoneId?: string | null;
  serviceTypeConfigId?: string | null;
  establishmentCount: number;
  timeOfDay: string;
  isBusinessClient: boolean;
  businessDeliveryCount: number;
  isFirstOrder: boolean;
}

export const PROMO_TYPE_LABELS: Record<PromoType, string> = {
  first_free: 'Primer envío gratis',
  discount: 'Descuento general',
  zone_discount: 'Descuento por zona',
  date_discount: 'Descuento por fecha',
};

export const MODIFIER_TYPE_LABELS: Record<TimeModifierType, string> = {
  surcharge: 'Recargo',
  discount: 'Descuento',
};

export const AMOUNT_TYPE_LABELS: Record<TimeAmountType, string> = {
  fixed: 'Monto fijo',
  percentage: 'Porcentaje',
};

export interface ScheduleGeneralEntry {
  id: string;
  companyId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface ScheduleZoneEntry {
  id: string;
  companyId: string;
  zoneId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface ScheduleHoliday {
  id: string;
  companyId: string;
  name: string;
  holidayDate: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  holidayType?: string;
}

export type HolidayType = 'holiday' | 'vacation' | 'closure' | 'special_hours';

export const HOLIDAY_TYPE_LABELS: Record<HolidayType, string> = {
  holiday: 'Día festivo',
  vacation: 'Vacaciones',
  closure: 'Cierre temporal',
  special_hours: 'Horario especial',
};

export interface ScheduleSlot {
  id: string;
  companyId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isActive: boolean;
  sortOrder: number;
  zoneId?: string | null;
  serviceTypeConfigId?: string | null;
}

export interface BusinessStatus {
  isOpen: boolean;
  label: string;
  nextOpenLabel: string | null;
  todayHours: { open: string; close: string }[];
  currentSlot: { open: string; close: string } | null;
  isSpecialDay: boolean;
  specialDayName: string | null;
}

export interface VehicleType {
  id: string;
  companyId: string;
  name: string;
  icon: string;
  isActive: boolean;
}

export interface BusinessTagConfig {
  label: string;
  cls: string;
}

export type BusinessTag = 'recomendado' | 'pedido_rapido' | 'promocion' | 'abierto';

export type ServiceType = 'compras' | 'farmacia' | 'envios_recolecciones' | 'mandado_personalizado';

export type OrderStatus =
  | 'solicitado'
  | 'confirmado'
  | 'en_compra'
  | 'en_camino'
  | 'entregado'
  | 'cancelado';

export type BusinessCategory =
  | 'Farmacia'
  | 'Supermercado'
  | 'Panadería'
  | 'Carnicería'
  | 'Ferretería'
  | 'Papelería'
  | 'Restaurante'
  | 'Tienda'
  | 'Abarrotes'
  | 'Miscelánea';

export interface Business {
  id: string;
  companyId?: string;
  name: string;
  category: string;
  address: string;
  hours: string;
  isOpen: boolean;
  photo: string;
  tags: BusinessTag[];
}

export interface Driver {
  id: string;
  companyId?: string;
  name: string;
  phone: string;
  zone: string;
  status: 'disponible' | 'en_ruta' | 'inactivo';
  rating: number;
  totalDeliveries: number;
  vehicleTypeId?: string | null;
}

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
}

export interface OrderTimelineEntry {
  id?: string;
  orderId?: string;
  status: OrderStatus;
  label: string;
  note?: string;
  timestamp: number | string;
}

export interface Order {
  id: string;
  companyId: string;
  code: string;
  customerName: string;
  customerPhone: string;
  address: string;
  reference?: string;
  notes: string;
  serviceType: ServiceType;
  establishments: string[];
  cost: number;
  status: OrderStatus;
  driverId: string | null;
  incident?: string;
  createdAt: number | string;
  updatedAt: number | string;
  timeline: OrderTimelineEntry[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface ServiceTypeMeta {
  value: ServiceType;
  label: string;
  description: string;
  icon: string;
  baseCost: number;
}

export const STATUS_FLOW: OrderStatus[] = [
  'solicitado',
  'confirmado',
  'en_compra',
  'en_camino',
  'entregado',
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  solicitado: 'Solicitado',
  confirmado: 'Confirmado',
  en_compra: 'En compra',
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  solicitado: 'bg-slate-100 text-slate-700',
  confirmado: 'bg-blue-100 text-blue-700',
  en_compra: 'bg-amber-100 text-amber-700',
  en_camino: 'bg-purple-100 text-purple-700',
  entregado: 'bg-bici-primary-100 text-bici-primary-700',
  cancelado: 'bg-red-100 text-red-700',
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === 'cancelado' || from === 'entregado') return false;
  const fromIdx = STATUS_FLOW.indexOf(from);
  const toIdx = STATUS_FLOW.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return false;
  return toIdx === fromIdx + 1;
}

export function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

export const SERVICE_TYPES: ServiceTypeMeta[] = [
  { value: 'compras', label: 'Compras', description: 'Compramos en cualquier establecimiento que elijas.', icon: 'shopping-bag', baseCost: 35 },
  { value: 'farmacia', label: 'Farmacias', description: 'Compra de medicamentos y productos de salud.', icon: 'pill', baseCost: 30 },
  { value: 'envios_recolecciones', label: 'Envíos y recolecciones', description: 'Documentos, paquetes y regalos.', icon: 'package', baseCost: 40 },
  { value: 'mandado_personalizado', label: 'Mandado personalizado', description: 'Para cualquier compra o servicio especial.', icon: 'sparkles', baseCost: 45 },
];

export const DEFAULT_COMPANY_CONFIG: CompanyConfig = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Bici Express',
  description: 'Mandados y entregas locales en bicicleta. Rápido, ecológico y confiable.',
  logoUrl: '',
  iconUrl: '',
  primaryColor: '16a34a',
  secondaryColor: '15803d',
  accentColor: '4ade80',
  slogan: 'Nosotros hacemos tus mandados mientras tú disfrutas tu tiempo.',
  whatsapp: '52524421234567',
  phone: '442 123 4567',
  email: 'hola@biciexpress.mx',
  website: 'https://biciexpress.mx',
  facebook: 'https://facebook.com/biciexpress',
  instagram: 'https://instagram.com/biciexpress',
  tiktok: 'https://tiktok.com/@biciexpress',
  isActive: true,
};

export const TAG_CONFIG: Record<BusinessTag, BusinessTagConfig> = {
  recomendado: { label: 'Recomendado', cls: 'bg-amber-100 text-amber-700' },
  pedido_rapido: { label: 'Pedido rápido', cls: 'bg-blue-100 text-blue-700' },
  promocion: { label: 'Promoción', cls: 'bg-pink-100 text-pink-700' },
  abierto: { label: 'Abierto', cls: 'bg-bici-primary-100 text-bici-primary-700' },
};

export const VEHICLE_ICON_MAP: Record<string, string> = {
  bike: 'Bike',
  moto: 'Bike',
  car: 'Car',
  foot: 'Footprints',
  other: 'Truck',
};

export const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const TARIFF_TYPE_LABELS: Record<TariffType, string> = {
  simple: 'Entrega sencilla',
  multiple: 'Entrega múltiple',
  per_km: 'Costo por kilómetro',
  surcharge: 'Costo adicional',
  promotion: 'Promoción',
  business_special: 'Tarifa especial negocios',
};

export function calculateCost(serviceCount: number, serviceType?: ServiceType, tariffs?: Tariff[]): number {
  const baseTariff = tariffs?.find((t) => t.type === 'simple' && t.isActive);
  const base = baseTariff
    ? baseTariff.amount
    : serviceType
      ? SERVICE_TYPES.find((s) => s.value === serviceType)?.baseCost ?? 35
      : 35;
  const multipleTariff = tariffs?.find((t) => t.type === 'multiple' && t.isActive);
  const extraPerItem = multipleTariff ? multipleTariff.amount : 5;
  return base + (serviceCount > 1 ? (serviceCount - 1) * extraPerItem : 0);
}
