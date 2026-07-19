import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShoppingBag, Package, Pill, Sparkles,
  MapPin, Phone, User, Home, MessageSquare, Info,
  Check, ArrowRight, ArrowLeft, Store,
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { useStore } from '../store';
import { useConfig } from '../lib/config';
import { SERVICE_TYPES, calculateCost, type ServiceType } from '../types';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'shopping-bag': ShoppingBag,
  package: Package,
  pill: Pill,
  sparkles: Sparkles,
};

const STEPS = ['Servicio', 'Detalles', 'Confirmación', 'Pedido enviado'];

const STEP_MESSAGES: Record<number, string> = {
  0: '¿Qué necesitas hoy?',
  1: 'Excelente elección. Cuéntanos los detalles.',
  2: 'Confirma tu información para enviar el pedido.',
  3: '¡Tu pedido va en camino!',
};

export default function CustomerPage() {
  const { createOrder, businesses } = useStore();
  const { config } = useConfig();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialService = (searchParams.get('service') as ServiceType) || 'compras';
  const businessId = searchParams.get('business');
  const preselectedBusiness = businessId ? businesses.find((b) => b.id === businessId) : undefined;

  const [step, setStep] = useState(0);
  const [serviceType, setServiceType] = useState<ServiceType>(
    SERVICE_TYPES.some((s) => s.value === initialService) ? initialService : 'compras',
  );
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    reference: '',
    notes: preselectedBusiness ? `Comprar en: ${preselectedBusiness.name}` : '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (preselectedBusiness) setStep(1);
  }, [preselectedBusiness]);

  const cost = useMemo(() => calculateCost(1, serviceType), [serviceType]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Requerido';
    if (!form.phone.trim()) e.phone = 'Requerido';
    if (!form.address.trim()) e.address = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const order = await createOrder({
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        address: form.address.trim(),
        reference: form.reference.trim(),
        notes: form.notes.trim(),
        serviceType,
        establishments: preselectedBusiness ? [preselectedBusiness.name] : [],
        cost,
      });
      setStep(3);
      setTimeout(() => navigate(`/operador?highlight=${order.id}`), 1800);
    } catch {
      // Error toast is handled by store
    }
  };

  const handleNext = () => {
    if (step === 0) setStep(1);
    else if (step === 1) setStep(2);
    else if (step === 2) handleSubmit();
  };

  const handleBack = () => {
    if (step > 0 && step < 3) setStep(step - 1);
  };

  const selectedService = SERVICE_TYPES.find((s) => s.value === serviceType);

  return (
    <AppLayout title="Solicitar mandado" subtitle="Elige el tipo de servicio y nosotros nos encargamos del resto.">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {i > 0 && <div className={`h-0.5 flex-1 transition-colors duration-300 ${i <= step ? 'bg-bici-primary-500' : 'bg-slate-200'}`} />}
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                  i < step ? 'bg-bici-primary-600 text-white' : i === step ? 'bg-bici-primary-600 text-white ring-4 ring-bici-primary-100' : 'bg-slate-200 text-slate-400'
                }`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 transition-colors duration-300 ${i < step ? 'bg-bici-primary-500' : 'bg-slate-200'}`} />}
              </div>
              <span className={`mt-2 hidden text-xs font-medium sm:block ${i <= step ? 'text-bici-primary-700' : 'text-slate-400'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Friendly message */}
      <div className="mb-6 rounded-2xl bg-bici-primary-50 px-5 py-3.5 text-center">
        <p className="text-sm font-medium text-bici-primary-800">{STEP_MESSAGES[step]}</p>
      </div>

      {step === 0 && (
        <div className="animate-fade-in">
          {preselectedBusiness && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-bici-primary-200 bg-bici-primary-50 px-4 py-3">
              <Store className="h-5 w-5 text-bici-primary-600" />
              <span className="text-sm text-slate-700">Comercio seleccionado: <strong>{preselectedBusiness.name}</strong></span>
            </div>
          )}
          <h2 className="font-display text-lg font-semibold text-slate-900">¿Qué necesitas?</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SERVICE_TYPES.map((s) => {
              const Icon = ICONS[s.icon] ?? ShoppingBag;
              const active = serviceType === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setServiceType(s.value)}
                  className={`group relative flex flex-col items-start rounded-2xl border-2 p-5 text-left transition-all ${
                    active
                      ? 'border-bici-primary-500 bg-bici-primary-50 ring-1 ring-bici-primary-500'
                      : 'border-slate-200 bg-white hover:border-bici-primary-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                      active ? 'bg-bici-primary-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-bici-primary-100 group-hover:text-bici-primary-600'
                    }`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    {active && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-bici-primary-600 text-white">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  <h3 className={`mt-4 font-display text-base font-semibold ${active ? 'text-bici-primary-800' : 'text-slate-800'}`}>{s.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-bici-primary-200 bg-bici-primary-50/60 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bici-primary-100 text-bici-primary-700">
              <Info className="h-5 w-5" />
            </div>
            <p className="text-sm leading-relaxed text-slate-700">
              En {config.name} respetamos el precio del establecimiento. No aumentamos el costo de los productos; únicamente cobramos la tarifa correspondiente por el servicio de entrega.
            </p>
          </div>

          <button onClick={handleNext} className="btn-primary mt-6 w-full sm:w-auto">
            Continuar
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="animate-fade-in">
          <div className="card p-5">
            <h2 className="font-display text-lg font-semibold text-slate-900">Detalles del pedido</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-field">Nombre completo</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input className="input-field pl-10" placeholder="Tu nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="label-field">Teléfono</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input className="input-field pl-10" placeholder="442 000 0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label-field">Dirección de entrega</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input className="input-field pl-10" placeholder="Calle, número, colonia" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label-field">Referencia (opcional)</label>
                <div className="relative">
                  <Home className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input className="input-field pl-10" placeholder="Color de casa, punto de referencia..." value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="label-field">Notas del pedido (opcional)</label>
                <div className="relative">
                  <MessageSquare className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <textarea className="input-field pl-10 min-h-[80px] resize-y" placeholder="Instrucciones especiales, productos específicos..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={handleBack} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" />
              Atrás
            </button>
            <button onClick={handleNext} className="btn-primary flex-1 sm:flex-none">
              Continuar
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <div className="card overflow-hidden">
            <div className="bg-bici-primary-600 px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-white">Confirma tu pedido</h2>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Servicio</span>
                <span className="font-medium text-slate-800">{selectedService?.label}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Nombre</span>
                <span className="font-medium text-slate-800">{form.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Teléfono</span>
                <span className="font-medium text-slate-800">{form.phone}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Dirección</span>
                <span className="max-w-[60%] text-right font-medium text-slate-800">{form.address}</span>
              </div>
              {form.notes && (
                <div className="flex items-start justify-between gap-4 text-sm">
                  <span className="shrink-0 text-slate-500">Notas</span>
                  <span className="text-right font-medium text-slate-800">{form.notes}</span>
                </div>
              )}
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                <p className="font-medium text-slate-600">Tarifa de servicio</p>
                <p className="mt-1.5">Costo único de entrega según el servicio seleccionado. No incluye el costo de los productos.</p>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Costo del servicio</span>
                  <span className="font-display text-2xl font-bold text-bici-primary-700">${cost}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={handleBack} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" />
              Atrás
            </button>
            <button onClick={handleSubmit} className="btn-primary flex-1 sm:flex-none">
              Solicitar pedido
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">Al solicitar aceptas los términos del servicio.</p>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bici-primary-100">
            <Check className="h-10 w-10 text-bici-primary-600" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold text-slate-900">¡Tu pedido va en camino!</h2>
          <p className="mt-2 text-sm text-slate-500">Te estamos redirigiendo al seguimiento...</p>
        </div>
      )}
    </AppLayout>
  );
}
