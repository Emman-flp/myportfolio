import type { Config } from 'tailwindcss'

/**
 * Remaps Tailwind's palette onto the reference site's CSS custom properties so
 * class names match 1:1 (`bg-white`, `text-ink`, `border-gray-200`, `divide-gray-200`
 * all resolve to bryllim.com's exact values).
 *
 * Tokens: docs/UI-SPECIFICATION.md §2
 *
 * Tailwind is pinned to v3.4.19 — the version the reference compiled with.
 * v4 changed both the config format and the `rgb(var(--x) / <alpha-value>)`
 * pattern this mapping depends on.
 */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],

  theme: {
    extend: {
      colors: {
        white: token('bg'),
        black: token('g950'),
        ink: token('ink'),
        gray: {
          50: token('g50'),
          100: token('g100'),
          200: token('g200'),
          300: token('g300'),
          400: token('g400'),
          500: token('g500'),
          600: token('g600'),
          700: token('g700'),
          800: token('g800'),
          900: token('g900'),
          950: token('g950'),
        },
      },

      fontFamily: {
        sans: ['var(--font-geist)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
        pixel: ['Geist Pixel', 'var(--font-geist-mono)', 'monospace'],
        serif: ['var(--font-source-serif-4)', 'Georgia', 'serif'],
      },

      fontSize: {
        // Arbitrary sizes the reference uses, named so components stay readable.
        '9.5': ['9.5px', { lineHeight: '13.5px' }],
        '10.5': ['10.5px', { lineHeight: 'normal' }],
        '11.5': ['11.5px', { lineHeight: 'normal' }],
        '12.5': ['12.5px', { lineHeight: 'normal' }],
        '13.5': ['13.5px', { lineHeight: '21.9375px' }],
        '15': ['15px', { lineHeight: '22.5px' }],
      },

      letterSpacing: {
        wider: '0.05em',
      },

      boxShadow: {
        cert: '0 8px 22px -14px rgba(10,10,10,0.25)',
        'cert-hover': '0 18px 36px -20px rgba(10,10,10,0.4)',
        rec: '0 8px 22px -16px rgba(10,10,10,0.2)',
        'rec-hover': '0 18px 36px -20px rgba(10,10,10,0.35)',
        modal: '0 40px 90px -20px rgba(0,0,0,0.35)',
      },

      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'none' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
        caretBlink: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },

      animation: {
        fadeUp: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        blink: 'blink 1.8s ease-in-out infinite',
      },
    },
  },

  plugins: [],
}

export default config
