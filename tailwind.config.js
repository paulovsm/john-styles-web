import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fleek: {
          navy: '#0F172A',
          gold: '#C5A059',
        },
        white: {
          DEFAULT: '#FFFFFF',
          pure: '#FFFFFF',
          off: '#F8F9FA',
        },
        grey: {
          light: '#E2E8F0',
          medium: '#64748B',
          dark: '#334155',
        },
        status: {
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
      }
    },
  },
  plugins: [
    typography,
  ],
}

