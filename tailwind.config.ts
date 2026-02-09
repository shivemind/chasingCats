import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        brand: '#0E7C7B',
        'brand-dark': '#095859',
        'brand-light': '#3DAAA8',
        sand: '#f9f4ef',
        night: '#0C1412',
        accent: '#F9982F',
        // Futuristic cat-themed colors
        'neon-cyan': '#00FFFF',
        'neon-purple': '#BF40BF',
        'cat-eye': '#FFD700',
        'cat-eye-green': '#39FF14',
        'midnight': '#0a0a0f',
        'deep-space': '#12121a'
      },
      boxShadow: {
        card: '0 18px 35px -15px rgba(14, 124, 123, 0.4)',
        'glow': '0 0 20px rgba(0, 255, 255, 0.3)',
        'glow-accent': '0 0 20px rgba(249, 152, 47, 0.4)',
        'glow-purple': '0 0 30px rgba(191, 64, 191, 0.3)',
        'cat-eye': '0 0 15px rgba(255, 215, 0, 0.6)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cat-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c-2 0-4 2-4 4v6c-3 0-6 3-6 6 0 2 1 4 3 5-2 2-3 5-3 8 0 6 5 11 10 11s10-5 10-11c0-3-1-6-3-8 2-1 3-3 3-5 0-3-3-6-6-6v-6c0-2-2-4-4-4z' fill='rgba(255,255,255,0.02)'/%3E%3C/svg%3E\")"
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in-delayed': 'fadeIn 0.3s ease-in 0.3s forwards'
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: [typography]
};

export default config;
