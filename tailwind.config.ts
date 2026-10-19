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
      // Editorial display scale, rebuilt 2026-10-19 on measured evidence.
      //
      // The previous scale was deliberately pulled back during the "visual
      // polish" passes and, combined with the then-active 85% root font-size,
      // produced a measured 27px hero H1 / 24px section H2 on desktop - a
      // nearly flat hierarchy. With the root font restored to 100%, these
      // clamps establish a real editorial scale:
      //   2xl 22-24px | 3xl 24-28px (H3) | 4xl 28-34px | 5xl 32-44px (H2)
      //   6xl 36-52px (page H1) | 7xl 40-64px (display)
      //
      // Each size is a clamp(): the minimum is what renders on a 320-430px
      // phone, the maximum is reached around the xl breakpoint, so small
      // screens get proportionally smaller text without hand-tuned overrides.
      // Line heights are unitless ratios so they track the fluid size, and
      // the largest steps get progressively tighter tracking, matching
      // editorial display-type convention.
      fontSize: {
        '2xl': ['clamp(1.375rem, 1.32rem + 0.275vw, 1.5rem)', { lineHeight: '1.3' }],
        '3xl': ['clamp(1.5rem, 1.42rem + 0.4vw, 1.75rem)', { lineHeight: '1.25' }],
        '4xl': ['clamp(1.75rem, 1.61rem + 0.7vw, 2.125rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        '5xl': ['clamp(2rem, 1.78rem + 1.1vw, 2.75rem)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        '6xl': ['clamp(2.25rem, 1.95rem + 1.5vw, 3.25rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        '7xl': ['clamp(2.5rem, 2.1rem + 2vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
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
