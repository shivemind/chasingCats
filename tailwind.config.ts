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
        brand: '#0E7C7B',
        'brand-dark': '#095859',
        'brand-light': '#3DAAA8',
        night: '#0C1412',
        accent: '#F9982F'
      },
      boxShadow: {
        card: '0 18px 35px -15px rgba(14, 124, 123, 0.4)'
      }
    }
  },
  plugins: [typography, lineClamp]
};

export default config;
