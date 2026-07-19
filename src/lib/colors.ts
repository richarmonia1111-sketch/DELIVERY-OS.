export interface ColorRamp {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('');
}

function mix(color: { r: number; g: number; b: number }, weight: number, target: { r: number; g: number; b: number }) {
  return {
    r: color.r * (1 - weight) + target.r * weight,
    g: color.g * (1 - weight) + target.g * weight,
    b: color.b * (1 - weight) + target.b * weight,
  };
}

export function generateColorRamp(hex: string): ColorRamp {
  const base = hexToRgb(hex);
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  const weights: Record<keyof ColorRamp, number> = {
    50: 0.95,
    100: 0.90,
    200: 0.75,
    300: 0.60,
    400: 0.30,
    500: 0.00,
    600: 0.10,
    700: 0.25,
    800: 0.40,
    900: 0.55,
  };
  const ramp = {} as ColorRamp;
  (Object.keys(weights) as (keyof ColorRamp)[]).forEach((key) => {
    const w = weights[key];
    const target = w > 0.5 && key < 500 ? white : key > 500 ? black : base;
    const useWhite = key < 500;
    const mixed = useWhite ? mix(base, w, white) : key > 500 ? mix(base, w, black) : base;
    ramp[key] = `#${rgbToHex(mixed.r, mixed.g, mixed.b)}`;
  });
  return ramp;
}

export function injectThemeColors(primaryHex: string, secondaryHex: string, accentHex: string) {
  const root = document.documentElement;
  const primary = generateColorRamp(primaryHex);
  const secondary = generateColorRamp(secondaryHex);
  const accent = generateColorRamp(accentHex);

  (Object.keys(primary) as (keyof ColorRamp)[]).forEach((key) => {
    root.style.setProperty(`--color-bici-primary-${key}`, primary[key]);
  });
  (Object.keys(secondary) as (keyof ColorRamp)[]).forEach((key) => {
    root.style.setProperty(`--color-bici-secondary-${key}`, secondary[key]);
  });
  (Object.keys(accent) as (keyof ColorRamp)[]).forEach((key) => {
    root.style.setProperty(`--color-bici-accent-${key}`, accent[key]);
  });
}
