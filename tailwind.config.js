/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'bici-primary': {
          50: 'var(--color-bici-primary-50, #f0fdf4)',
          100: 'var(--color-bici-primary-100, #dcfce7)',
          200: 'var(--color-bici-primary-200, #bbf7d0)',
          300: 'var(--color-bici-primary-300, #86efac)',
          400: 'var(--color-bici-primary-400, #4ade80)',
          500: 'var(--color-bici-primary-500, #22c55e)',
          600: 'var(--color-bici-primary-600, #16a34a)',
          700: 'var(--color-bici-primary-700, #15803d)',
          800: 'var(--color-bici-primary-800, #166534)',
          900: 'var(--color-bici-primary-900, #14532d)',
        },
        'bici-secondary': {
          50: 'var(--color-bici-secondary-50, #f0fdf4)',
          100: 'var(--color-bici-secondary-100, #dcfce7)',
          200: 'var(--color-bici-secondary-200, #bbf7d0)',
          300: 'var(--color-bici-secondary-300, #86efac)',
          400: 'var(--color-bici-secondary-400, #4ade80)',
          500: 'var(--color-bici-secondary-500, #22c55e)',
          600: 'var(--color-bici-secondary-600, #15803d)',
          700: 'var(--color-bici-secondary-700, #15803d)',
          800: 'var(--color-bici-secondary-800, #166534)',
          900: 'var(--color-bici-secondary-900, #14532d)',
        },
        'bici-accent': {
          50: 'var(--color-bici-accent-50, #f0fdf4)',
          100: 'var(--color-bici-accent-100, #dcfce7)',
          200: 'var(--color-bici-accent-200, #bbf7d0)',
          300: 'var(--color-bici-accent-300, #86efac)',
          400: 'var(--color-bici-accent-400, #4ade80)',
          500: 'var(--color-bici-accent-500, #4ade80)',
          600: 'var(--color-bici-accent-600, #16a34a)',
          700: 'var(--color-bici-accent-700, #15803d)',
          800: 'var(--color-bici-accent-800, #166534)',
          900: 'var(--color-bici-accent-900, #14532d)',
        },
      },
    },
  },
  plugins: [],
};
