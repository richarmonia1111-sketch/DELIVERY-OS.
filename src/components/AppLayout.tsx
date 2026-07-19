import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import Logo from './Logo';

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function AppLayout({ title, subtitle, children, actions }: AppLayoutProps) {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo size="md" to="/" />
          <div className="flex items-center gap-2">
            {actions}
            {!isLanding && (
              <Link to="/hub" className="btn-ghost hidden sm:inline-flex">
                <Home className="h-4 w-4" />
                Hub
              </Link>
            )}
            <Link to="/" className="btn-ghost">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {actions && <div className="sm:hidden">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}
