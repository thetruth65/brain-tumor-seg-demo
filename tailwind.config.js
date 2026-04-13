/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          cyan: '#00d4c8',
          violet: '#7c3aed',
          teal: '#0d9488',
        },
        surface: {
          900: '#05060a',
          800: '#0c0e17',
          700: '#131627',
          600: '#1a1f35',
          500: '#242a44',
        },
        tumor: {
          meningioma: '#f59e0b',
          glioma: '#ef4444',
          pituitary: '#8b5cf6',
          none: '#10b981',
        },
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(0,212,200,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,200,0.04) 1px, transparent 1px)`,
        'scan-gradient': 'linear-gradient(180deg, transparent 0%, rgba(0,212,200,0.08) 50%, transparent 100%)',
      },
      backgroundSize: {
        'grid': '48px 48px',
      },
      animation: {
        'scan': 'scan 3s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(400px)', opacity: '0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px rgba(0,212,200,0.3)' },
          'to': { boxShadow: '0 0 40px rgba(0,212,200,0.6), 0 0 80px rgba(0,212,200,0.2)' },
        },
        'fade-up': {
          'from': { opacity: '0', transform: 'translateY(24px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}