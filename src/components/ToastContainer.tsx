import { CircleCheck as CheckCircle2, Circle as XCircle, Info, TriangleAlert as AlertTriangle, X } from 'lucide-react';
import { useStore } from '../store';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES = {
  success: 'bg-bici-primary-50 text-bici-primary-800 ring-bici-primary-200',
  error: 'bg-red-50 text-red-800 ring-red-200',
  info: 'bg-blue-50 text-blue-800 ring-blue-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ring-1 animate-slide-in-right ${STYLES[toast.type]}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="rounded-lg p-1 transition-colors hover:bg-black/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
