/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Merriweather', 'serif'],
      },
      colors: {
        brand: {
          50: '#f0f4fe',
          100: '#dde9fc',
          200: '#c2d9fa',
          300: '#99c2f6',
          400: '#6ea3f0',
          500: '#4680e9',
          600: '#2d63d6',
          700: '#2550c0',
          800: '#24439c',
          900: '#223a7e',
          950: '#17244d',
        },
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        surface: {
          DEFAULT: '#ffffff',
          soft: '#fafbfc',
        }
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(15, 23, 42, 0.08), 0 1px 4px -2px rgba(15, 23, 42, 0.04)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        floating: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        'subtle-glow': 'radial-gradient(circle at 50% 0%, #f0f4fe 0%, transparent 70%)',
      }
    },
  },
  plugins: [],
};
