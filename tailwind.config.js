/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          border: 'var(--color-border)', // slate-200
          input: 'var(--color-input)', // white
          ring: 'var(--color-ring)', // emerald-600
          background: 'var(--color-background)', // slate-50
          foreground: 'var(--color-foreground)', // slate-800
          primary: {
            DEFAULT: 'var(--color-primary)', // emerald-600
            foreground: 'var(--color-primary-foreground)' // white
          },
          secondary: {
            DEFAULT: 'var(--color-secondary)', // emerald-700
            foreground: 'var(--color-secondary-foreground)' // white
          },
          destructive: {
            DEFAULT: 'var(--color-destructive)', // red-500
            foreground: 'var(--color-destructive-foreground)' // white
          },
          muted: {
            DEFAULT: 'var(--color-muted)', // slate-100
            foreground: 'var(--color-muted-foreground)' // slate-500
          },
          accent: {
            DEFAULT: 'var(--color-accent)', // sky-500
            foreground: 'var(--color-accent-foreground)' // white
          },
          popover: {
            DEFAULT: 'var(--color-popover)', // white
            foreground: 'var(--color-popover-foreground)' // slate-800
          },
          card: {
            DEFAULT: 'var(--color-card)', // white
            foreground: 'var(--color-card-foreground)' // slate-800
          },
          success: {
            DEFAULT: 'var(--color-success)', // emerald-500
            foreground: 'var(--color-success-foreground)' // white
          },
          warning: {
            DEFAULT: 'var(--color-warning)', // amber-500
            foreground: 'var(--color-warning-foreground)' // white
          },
          error: {
            DEFAULT: 'var(--color-error)', // red-500
            foreground: 'var(--color-error-foreground)' // white
          }
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace'],
        },
        fontSize: {
          'fluid-xs': 'clamp(0.75rem, 1.5vw, 0.875rem)',
          'fluid-sm': 'clamp(0.875rem, 2vw, 1rem)',
          'fluid-base': 'clamp(1rem, 2.5vw, 1.125rem)',
          'fluid-lg': 'clamp(1.125rem, 3vw, 1.25rem)',
          'fluid-xl': 'clamp(1.25rem, 3.5vw, 1.5rem)',
          'fluid-2xl': 'clamp(1.5rem, 4vw, 1.875rem)',
          'fluid-3xl': 'clamp(1.875rem, 5vw, 2.25rem)',
        },
        animation: {
          'gradient-morph': 'gradientMorph 3s ease-in-out infinite',
          'shimmer': 'shimmer 1.5s infinite',
          'status-pulse': 'statusPulse 2s infinite',
        },
        keyframes: {
          gradientMorph: {
            '0%, 100%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
          },
          shimmer: {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' },
          },
          statusPulse: {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.5' },
          },
        },
        boxShadow: {
          'glow-primary': '0 0 20px rgba(22, 163, 74, 0.3)',
          'glow-accent': '0 0 20px rgba(14, 165, 233, 0.3)',
          'card': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          'modal': '0 10px 25px rgba(0, 0, 0, 0.1)',
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
        },
        zIndex: {
          '60': '60',
          '70': '70',
          '80': '80',
          '90': '90',
          '100': '100',
          '150': '150',
          '200': '200',
          '1000': '1000',
          '2000': '2000',
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
      require('tailwindcss-animate'),
    ],
  }
