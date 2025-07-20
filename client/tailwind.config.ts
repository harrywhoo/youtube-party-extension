import type { Config } from 'tailwindcss'

const config: Config = {
  // 1. Tell Tailwind which files to scan for class names
  content: [
    './src/**/*.{ts,tsx,html}',
    './public/index.html'
  ],

  // 2. Enable dark‑mode via a `class` on <html>
  darkMode: 'class',

  // 3. Customize your design tokens
  theme: {
    extend: {
      colors: {
        primary: '#ff4757',
        secondary: '#34d399',
        bg: {
          DEFAULT: '#1a1a1a',
          dark: '#0f0f0f'
        },
        fg: '#ffffff',
        muted: '#a0a0a0',
        errorBg: 'rgba(220, 38, 127, 0.15)',
        errorFg: '#ff6b7a',
      },
      spacing: {
        px: '1px',
        1: '0.25rem',   // 4px
        2: '0.5rem',    // 8px
        4: '1rem',      // 16px
        6: '1.5rem',    // 24px
        8: '2rem',      // 32px
        24: '6rem',     // 96px
      },
      borderRadius: {
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        DEFAULT: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        md: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
        lg: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
        xl: '0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)',
      }
    }
  },

  // 4. No extra plugins for now; add form, typography, etc. as needed
  plugins: []
}

export default config