import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CompanyConfig } from '../types';
import { DEFAULT_COMPANY_CONFIG } from '../types';
import { injectThemeColors } from '../lib/colors';
import { supabase } from '../lib/supabase';

interface ConfigContextValue {
  config: CompanyConfig;
  setConfig: (config: CompanyConfig) => void;
  loading: boolean;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<CompanyConfig>(DEFAULT_COMPANY_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('is_active', true)
          .order('created_at')
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (!cancelled && data) {
          const cfg: CompanyConfig = {
            id: data.id,
            name: data.name,
            description: data.description ?? '',
            logoUrl: data.logo_url ?? '',
            iconUrl: data.icon_url ?? '',
            primaryColor: data.primary_color ?? '16a34a',
            secondaryColor: data.secondary_color ?? '15803d',
            accentColor: data.accent_color ?? '4ade80',
            slogan: data.slogan ?? '',
            whatsapp: data.whatsapp ?? '',
            phone: data.phone ?? '',
            email: data.email ?? '',
            website: data.website ?? '',
            facebook: data.facebook ?? '',
            instagram: data.instagram ?? '',
            tiktok: data.tiktok ?? '',
            isActive: data.is_active ?? true,
          };
          setConfigState(cfg);
          injectThemeColors(cfg.primaryColor, cfg.secondaryColor, cfg.accentColor);
        }
      } catch {
        // Fallback to default config — app still works offline
        if (!cancelled) {
          injectThemeColors(
            DEFAULT_COMPANY_CONFIG.primaryColor,
            DEFAULT_COMPANY_CONFIG.secondaryColor,
            DEFAULT_COMPANY_CONFIG.accentColor,
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadConfig();
    return () => { cancelled = true; };
  }, []);

  const setConfig = (newConfig: CompanyConfig) => {
    setConfigState(newConfig);
    injectThemeColors(newConfig.primaryColor, newConfig.secondaryColor, newConfig.accentColor);
  };

  return (
    <ConfigContext.Provider value={{ config, setConfig, loading }}>
      {children}
    </ConfigContext.Provider>
  );
}
