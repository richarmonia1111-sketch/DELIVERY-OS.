import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Pill, Sparkles, ArrowRight, ChevronDown, Zap, ShieldCheck, Smile, Store, Clock, Phone, MapPin, Mail, MessageCircle, CircleCheck as CheckCircle2, Star, Gift, X, ClipboardList, FileText, Bike, Home as HomeIcon } from 'lucide-react';
import Logo, { LogoIcon } from '../components/Logo';
import { useStore } from '../store';
import { useConfig } from '../lib/config';
import type { BusinessTag } from '../types';
import BusinessHoursDisplay from '../components/BusinessHoursDisplay';

function PricingCard() {
  const [open, setOpen] = useState(false);
  const { config } = useConfig();
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex w-full items-start gap-4 rounded-2xl border border-bici-primary-200 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md hover:ring-1 hover:ring-bici-primary-300 sm:items-center sm:p-6"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bici-primary-100 text-bici-primary-700 transition-colors group-hover:bg-bici-primary-600 group-hover:text-white">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-lg font-semibold text-slate-900">Precios transparentes</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 sm:text-base">
            En {config.name} pagas exactamente el mismo precio que en el establecimiento. Nunca incrementamos el costo de los productos; solo cobramos la tarifa del servicio de entrega.
          </p>
        </div>
        <ArrowRight className="hidden h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-bici-primary-500 sm:block" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg animate-slide-up rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bici-primary-100 text-bici-primary-700">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-slate-900">Nuestra política de precios</h3>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
              <p>En {config.name} creemos en la honestidad total. Por eso:</p>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-bici-primary-600" />
                  <span>Pagas exactamente el mismo precio que cuesta el producto en el establecimiento.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-bici-primary-600" />
                  <span>Nunca agregamos un margen ni incrementamos el costo de los productos.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-bici-primary-600" />
                  <span>Únicamente cobramos la tarifa del servicio de entrega, que se muestra antes de solicitar.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-bici-primary-600" />
                  <span>Si el establecimiento tiene una promoción, tú te beneficias de ella.</span>
                </li>
              </ul>
            </div>
            <button onClick={() => setOpen(false)} className="btn-primary mt-6 w-full">
              Entendido
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function BenefitCards() {
  const [open, setOpen] = useState<number | null>(null);
  const benefits = [
    { icon: Zap, title: 'Entrega rápida', color: 'amber', short: 'Tu pedido en menos de 35 minutos en promedio.', detail: 'Nuestros repartidores en bicicleta conocen la ciudad y toman las rutas más eficientes. La mayoría de los pedidos se entregan en menos de 35 minutos.' },
    { icon: ShieldCheck, title: 'Precios transparentes', color: 'bici-primary', short: 'Pagas lo mismo que en el establecimiento.', detail: 'No incrementamos el costo de los productos. Solo cobramos la tarifa del servicio de entrega, que siempre se muestra antes de confirmar tu pedido.' },
    { icon: Smile, title: 'Servicio confiable', color: 'blue', short: 'Repartidores confiables y verificados.', detail: 'Todos nuestros repartidores están registrados y calificados. Puedes seguir el estado de tu pedido en tiempo real desde la aplicación.' },
  ];
  const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', ring: 'hover:ring-amber-300' },
    'bici-primary': { bg: 'bg-bici-primary-100', text: 'text-bici-primary-700', ring: 'hover:ring-bici-primary-300' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', ring: 'hover:ring-blue-300' },
  };
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {benefits.map((b, i) => {
        const c = colorMap[b.color];
        const isOpen = open === i;
        return (
          <button
            key={b.title}
            onClick={() => setOpen(isOpen ? null : i)}
            className={`group rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200/70 transition-all hover:-translate-y-0.5 hover:shadow-md ${c.ring}`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
              <b.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-base font-semibold text-slate-900">{b.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{b.short}</p>
            <div className={`grid transition-all duration-300 ${isOpen ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <p className="border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">{b.detail}</p>
              </div>
            </div>
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${c.text}`}>
              {isOpen ? 'Ver menos' : 'Saber más'}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ServiceCards() {
  const services = [
    { icon: ShoppingBag, title: 'Compras', desc: 'Compramos en cualquier establecimiento que elijas: supermercados, panaderías, ferreterías, papelerías, carnicerías, tiendas y más.', cta: 'Solicitar compra', param: 'compras' },
    { icon: Pill, title: 'Farmacias', desc: 'Compra de medicamentos y productos de salud.', cta: 'Solicitar compra', param: 'farmacia' },
    { icon: Package, title: 'Envíos y recolecciones', desc: 'Documentos, paquetes y regalos.', cta: 'Solicitar servicio', param: 'envios_recolecciones' },
    { icon: Sparkles, title: 'Mandado personalizado', desc: 'Para cualquier compra o servicio especial.', cta: 'Solicitar servicio', param: 'mandado_personalizado' },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {services.map((s) => (
        <Link
          key={s.title}
          to={`/customer?service=${s.param}`}
          className="group flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-bici-primary-400 hover:shadow-lg"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bici-primary-50 text-bici-primary-600 transition-colors group-hover:bg-bici-primary-600 group-hover:text-white">
            <s.icon className="h-8 w-8" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">{s.title}</h3>
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">{s.desc}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-bici-primary-700">
            {s.cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
    </div>
  );
}

function FirstTimeGuide() {
  const steps = [
    { num: '1', title: 'Elige un servicio', desc: 'Selecciona entre compras, farmacia, envíos o mandado personalizado.', icon: ShoppingBag },
    { num: '2', title: 'Escribe los detalles', desc: 'Cuéntanos qué necesitas y dónde entregarlo.', icon: ClipboardList },
    { num: '3', title: 'Confirma la información', desc: 'Revisa tu pedido y confirma los datos.', icon: CheckCircle2 },
    { num: '4', title: 'Nosotros hacemos el resto', desc: 'Realizamos la compra o recolección por ti.', icon: Bike },
    { num: '5', title: 'Recibe tu pedido', desc: 'Tu repartidor llega a tu puerta.', icon: HomeIcon },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((s) => (
        <div key={s.num} className="group rounded-2xl bg-white p-5 ring-1 ring-slate-200/70 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-bici-primary-200">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bici-primary-600 font-display text-sm font-bold text-white">{s.num}</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bici-primary-50 text-bici-primary-600 transition-colors group-hover:bg-bici-primary-100">
              <s.icon className="h-5 w-5" />
            </div>
          </div>
          <h3 className="mt-3 font-display text-sm font-semibold text-slate-900">{s.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{s.desc}</p>
        </div>
      ))}
    </div>
  );
}

function CommerceCards() {
  const { businesses } = useStore();
  const tagConfig: Record<BusinessTag, { label: string; cls: string }> = {
    recomendado: { label: 'Recomendado', cls: 'bg-amber-100 text-amber-700' },
    pedido_rapido: { label: 'Pedido rápido', cls: 'bg-blue-100 text-blue-700' },
    promocion: { label: 'Promoción', cls: 'bg-pink-100 text-pink-700' },
    abierto: { label: 'Abierto', cls: 'bg-bici-primary-100 text-bici-primary-700' },
  };
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {businesses.slice(0, 10).map((b) => (
        <Link
          key={b.id}
          to={`/customer?business=${b.id}`}
          className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <img src={b.photo} alt={b.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            <div className="absolute left-2 top-2 flex flex-wrap gap-1">
              {b.tags.map((t) => (
                <span key={t} className={`badge ${tagConfig[t].cls}`}>{tagConfig[t].label}</span>
              ))}
            </div>
          </div>
          <div className="p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-bici-primary-600">{b.category}</span>
            <h3 className="mt-0.5 truncate text-sm font-semibold text-slate-900">{b.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3 w-3" /> {b.hours}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function HowItWorks() {
  const [open, setOpen] = useState<number | null>(null);
  const steps = [
    { num: '1', title: 'Solicita el servicio', short: 'Elige qué necesitas y llena el formulario.', detail: 'Selecciona el tipo de servicio, escribe los detalles de tu pedido y confirma tu dirección de entrega.', icon: ShoppingBag },
    { num: '2', title: 'Confirmamos tu pedido', short: 'Un operador revisa y confirma.', detail: 'Nuestro equipo recibe tu solicitud, la revisa y la confirma para asegurarse de que todo esté claro.', icon: CheckCircle2 },
    { num: '3', title: 'Realizamos la compra o recolección', short: 'El repartidor va al establecimiento.', detail: 'Tu repartidor acude al establecimiento elegido, compra o recoge lo que pediste y respeta el precio del negocio.', icon: Store },
    { num: '4', title: 'Vamos en camino', short: 'El repartidor se dirige a tu ubicación.', detail: 'Una vez listo el pedido, el repartidor toma la ruta más eficiente para llegar a tu puerta.', icon: Bike },
    { num: '5', title: 'Recibes tu pedido', short: '¡Pedido completado!', detail: 'Entregamos tu pedido en la dirección indicada. Puedes calificar el servicio y volver a pedir cuando quieras.', icon: HomeIcon },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((s, i) => {
        const isOpen = open === i;
        return (
          <button
            key={s.num}
            onClick={() => setOpen(isOpen ? null : i)}
            className="group rounded-2xl bg-slate-50 p-5 text-left ring-1 ring-slate-200/70 transition-all hover:bg-bici-primary-50 hover:ring-bici-primary-200"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bici-primary-600 font-display text-sm font-bold text-white">{s.num}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-bici-primary-600 shadow-sm">
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <h3 className="mt-3 font-display text-sm font-semibold text-slate-900">{s.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{s.short}</p>
            <div className={`grid transition-all duration-300 ${isOpen ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <p className="border-t border-slate-200 pt-2 text-xs leading-relaxed text-slate-600">{s.detail}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const { config } = useConfig();
  const faqs = [
    { q: '¿Cobran más caros los productos?', a: `No. En ${config.name} pagas exactamente el mismo precio que cuesta el producto en el establecimiento. Nunca incrementamos el costo de los productos. Solo cobramos la tarifa del servicio de entrega.` },
    { q: '¿Cómo puedo pagar?', a: 'Aceptas el pago en efectivo al recibir tu pedido, o transferencia. En futuras versiones incorporaremos métodos de pago digitales para mayor comodidad.' },
    { q: '¿Cuánto tarda un pedido?', a: 'El tiempo promedio es de 35 minutos, dependiendo del establecimiento, la disponibilidad de los productos y la distancia.' },
    { q: '¿Qué zonas cubren?', a: 'Cubrimos la zona metropolitana de Querétaro. Si tienes dudas sobre si llegamos a tu zona, contáctanos por WhatsApp.' },
    { q: '¿Puedo comprar en cualquier establecimiento?', a: 'Sí. Puedes solicitar compras en cualquier comercio de tu preferencia, no solo en los que aparecen en nuestra lista de comercios aliados.' },
  ];
  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-200 rounded-2xl bg-white ring-1 ring-slate-200/70">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-medium text-slate-800">{f.q}</span>
              <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContactButtons() {
  const { config } = useConfig();
  const contacts = [
    { icon: MessageCircle, label: 'WhatsApp', href: `https://wa.me/${config.whatsapp}`, cls: 'bg-bici-primary-600 text-white hover:bg-bici-primary-700' },
    { icon: Phone, label: 'Llamar', href: `tel:+${config.whatsapp}`, cls: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50' },
    { icon: Mail, label: 'Correo', href: `mailto:${config.email}`, cls: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50' },
    { icon: MapPin, label: 'Ver ubicación', href: 'https://maps.google.com/?q=Queretaro,Mexico', cls: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {contacts.map((c) => (
        <a
          key={c.label}
          href={c.href}
          target={c.href.startsWith('http') ? '_blank' : undefined}
          rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 active:scale-[0.98] ${c.cls}`}
        >
          <c.icon className="h-5 w-5" />
          {c.label}
        </a>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const { config } = useConfig();
  return (
    <div className="min-h-screen bg-white">
      <header className="absolute left-0 right-0 top-0 z-50">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo size="lg" to="/" name={config.name} />
          <Link to="/hub" className="btn-secondary !py-2.5">
            Acceder al sistema
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-bici-primary-700 via-bici-primary-600 to-bici-primary-800 pt-32 pb-24">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)', backgroundSize: '40px 40px, 60px 60px' }} />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-bici-primary-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bici-primary-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Repartidores disponibles ahora
            </div>
            <div className="flex justify-center">
              <LogoIcon size={96} className="rounded-3xl shadow-2xl shadow-bici-primary-900/30" />
            </div>
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              {config.name}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-bici-primary-50 sm:text-xl">
              {config.slogan}
            </p>

            <div className="mx-auto mt-8 max-w-2xl text-left">
              <PricingCard />
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/customer" className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-bici-primary-700 shadow-lg shadow-bici-primary-900/20 transition-all hover:bg-bici-primary-50 hover:shadow-xl active:scale-[0.98] sm:w-auto">
                <Bike className="h-5 w-5" />
                Solicitar un mandado
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/driver" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-7 py-4 text-base font-semibold text-white ring-1 ring-inset ring-white/30 backdrop-blur-sm transition-all hover:bg-white/20 active:scale-[0.98] sm:w-auto">
                Trabaja con nosotros
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4">
            {[
              { label: 'Pedidos hoy', value: '120+' },
              { label: 'Repartidores activos', value: '24' },
              { label: 'Tiempo promedio', value: '35 min' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 px-4 py-5 text-center ring-1 ring-inset ring-white/20 backdrop-blur-sm">
                <div className="font-display text-2xl font-bold text-white sm:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs font-medium text-bici-primary-100 sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <svg className="absolute bottom-0 left-0 right-0 h-12 w-full text-slate-50" preserveAspectRatio="none" viewBox="0 0 1440 48" fill="currentColor">
          <path d="M0 48h1440V0c-240 32-480 48-720 48S240 32 0 0v48z" />
        </svg>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BenefitCards />
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">¿Qué podemos hacer por ti?</h2>
            <p className="mt-4 text-lg text-slate-600">Elige el servicio que necesitas y nosotros nos encargamos del resto.</p>
          </div>
          <div className="mt-12">
            <ServiceCards />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">¿Es tu primera vez?</h2>
            <p className="mt-4 text-lg text-slate-600">Es muy sencillo. Así funciona {config.name} en 5 pasos.</p>
          </div>
          <div className="mt-12">
            <FirstTimeGuide />
          </div>
          <div className="mt-10 text-center">
            <Link to="/customer" className="btn-primary px-8 py-4 text-base">
              Comenzar ahora
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">Compra en tus comercios favoritos</h2>
            <p className="mt-4 text-lg text-slate-600">
              Puedes comprar en cualquiera de nuestros comercios aliados o solicitar compras en cualquier establecimiento de tu preferencia. Siempre respetamos el precio del negocio.
            </p>
          </div>
          <div className="mt-12">
            <CommerceCards />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">¿Cómo funciona?</h2>
            <p className="mt-4 text-lg text-slate-600">Toca cada paso para ver más detalles.</p>
          </div>
          <div className="mt-12">
            <HowItWorks />
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">Preguntas frecuentes</h2>
            <p className="mt-4 text-lg text-slate-600">Todo lo que necesitas saber antes de tu primer pedido.</p>
          </div>
          <div className="mt-12">
            <FAQ />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">Contáctanos</h2>
            <p className="mt-4 text-lg text-slate-600">Estamos aquí para ayudarte. Elige el medio que prefieras.</p>
          </div>
          <div className="mx-auto mt-10 max-w-3xl">
            <ContactButtons />
            <div className="mt-6">
              <BusinessHoursDisplay />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Logo size="md" to={null} name={config.name} />
              <p className="mt-3 text-sm text-slate-500">Mandados y entregas locales en bicicleta. Rápido, ecológico y confiable.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Servicios</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li><Link to="/customer?service=compras" className="hover:text-bici-primary-600">Compras</Link></li>
                <li><Link to="/customer?service=farmacia" className="hover:text-bici-primary-600">Farmacias</Link></li>
                <li><Link to="/customer?service=envios_recolecciones" className="hover:text-bici-primary-600">Envíos y recolecciones</Link></li>
                <li><Link to="/customer?service=mandado_personalizado" className="hover:text-bici-primary-600">Mandado personalizado</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Plataforma</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li><Link to="/customer" className="hover:text-bici-primary-600">Cliente</Link></li>
                <li><Link to="/operador" className="hover:text-bici-primary-600">Operador</Link></li>
                <li><Link to="/driver" className="hover:text-bici-primary-600">Repartidor</Link></li>
                <li><Link to="/admin" className="hover:text-bici-primary-600">Administrador</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Contacto</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {config.phone}</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {config.phone}</li>
                <li className="flex items-center gap-2"><Clock className="h-4 w-4" /> Lun-Dom 7:00-22:00</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
            <p className="text-sm text-slate-400">© 2026 {config.name} {config.tagline || 'OS'}. Todos los derechos reservados.</p>
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-slate-600">4.9</span>
              <span>· 2,400+ reseñas</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
