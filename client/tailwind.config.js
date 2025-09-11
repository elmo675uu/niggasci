/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Niggachain.ai inspired color palette
        primary: {
          50: '#f0fff4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#79ffa8', // Main primary color
          600: '#00e0a4',
          700: '#16a34a',
          800: '#15803d',
          900: '#14532d',
        },
        dark: {
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
          950: '#0b0e12', // Deepest dark
        },
        accent: {
          blue: '#8ab4f8',
          purple: '#c084fc',
          pink: '#f472b6',
        }
      },
      fontFamily: {
        'heading': ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 3s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { 
            textShadow: '0 0 6px rgba(121,255,168,0.15), 0 0 0 rgba(121,255,168,0)',
            boxShadow: '0 0 6px rgba(121,255,168,0.15)'
          },
          '100%': { 
            textShadow: '0 0 12px rgba(121,255,168,0.35), 0 0 24px rgba(121,255,168,0.25)',
            boxShadow: '0 0 12px rgba(121,255,168,0.35)'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neon-gradient': 'linear-gradient(135deg, #79ffa8 0%, #00e0a4 100%)',
      }
    },
  },
  plugins: [],
}
