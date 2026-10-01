import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Refined display scale, pass 2. The workhorse sizes (2xl/3xl/4xl) are
      // intentionally left alone so body-adjacent text stays comfortable;
      // only the oversized top of the range is pulled back.
      //
      // The clamp() minimum is what these sizes collapse to on a 320-430px
      // phone, and the maximum is the previous fixed value reached at the
      // xl breakpoint (1280px). Previously every one of these was a single fixed
      // pixel value, so a 3xl heading rendered at 1.625rem on a 320px screen and
      // wrapped into a stack of oversized lines - the "site looks enormous on
      // mobile" report. Each size now grows with the viewport, so small screens
      // get proportionally smaller text while the desktop rendering at xl and
      // above is byte-for-byte identical to before.
      fontSize: {
        '2xl': ['clamp(1.25rem, 1.2083rem + 0.2083vw, 1.375rem)', { lineHeight: '1.75rem' }],
        '3xl': ['clamp(1.375rem, 1.2917rem + 0.4167vw, 1.625rem)', { lineHeight: '2rem' }],
        '4xl': ['clamp(1.5rem, 1.375rem + 0.625vw, 1.875rem)', { lineHeight: '2.25rem' }],
        '5xl': ['clamp(1.625rem, 1.4583rem + 0.8333vw, 2.125rem)', { lineHeight: '2.375rem' }],
        '6xl': ['clamp(1.75rem, 1.5rem + 1.25vw, 2.5rem)', { lineHeight: '2.75rem' }],
        '7xl': ['clamp(1.875rem, 1.5rem + 1.875vw, 3rem)', { lineHeight: '3.25rem' }],
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        navy: {
          DEFAULT: 'hsl(var(--navy))',
          light: 'hsl(var(--navy-light))',
          lighter: 'hsl(var(--navy-lighter))',
        },
        gold: {
          DEFAULT: 'hsl(var(--gold))',
          dark: 'hsl(var(--gold-dark))',
        },
        ivory: {
          DEFAULT: 'hsl(var(--ivory))',
          dark: 'hsl(var(--ivory-dark))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
