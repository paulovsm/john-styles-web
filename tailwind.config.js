import typography from '@tailwindcss/typography';

const withVar = (v) => `rgb(var(${v}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Existing class names remapped to semantic tokens so the whole app is
        // theme-aware (light/dark) without renaming classes across components.
        brand: {
          navy: withVar('--c-ink'),        // high-contrast content / primary
          gold: withVar('--c-accent'),     // cognac accent
          'gold-dark': withVar('--c-accent-strong'),
        },
        white: {
          DEFAULT: withVar('--c-surface'),
          pure: withVar('--c-surface'),    // cards / on-primary text
          off: withVar('--c-bg'),          // page background
        },
        grey: {
          light: withVar('--c-border'),    // borders / subtle fills
          medium: withVar('--c-muted'),    // muted text
          dark: withVar('--c-content'),    // body text
        },
        status: {
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        // Aligned to the landing: Montserrat for display/headings, Inter for body.
        // `serif` is aliased to Montserrat too so any legacy font-serif usage
        // flips to the new display face until the class names are swept.
        display: ['Montserrat', 'sans-serif'],
        serif: ['Montserrat', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '9px',   // landing service-card radius
      },
      boxShadow: {
        card: '0 18px 48px rgba(0, 0, 0, 0.06)',  // landing soft card shadow
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
      },
      keyframes: {
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(14px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        reveal: 'reveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [
    typography,
  ],
}
