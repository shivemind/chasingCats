import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import typography from '@tailwindcss/typography';
import lineClamp from '@tailwindcss/line-clamp';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        brand: {
          DEFAULT: '#0E7C7B',
          dark: '#095859',
          light: '#3DAAA8'
        },
        sand: {
          DEFAULT: '#F5F1E3',
          '50': '#FBF8EE',
          '100': '#F5F1E3'
        },
        night: {
          DEFAULT: '#0C1412'
        },
        accent: {
          DEFAULT: '#F9982F'
        }
      },
      boxShadow: {
        card: '0 18px 35px -15px rgba(14, 124, 123, 0.4)'
      }
    }
  },
  plugins: [typography, lineClamp]
};

export default config;
