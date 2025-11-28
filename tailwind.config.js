/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'callout-blue',
    'is-style-callout-blue',
    'h2-bg-brand',
    'is-full',
    'with-line',
    'section-brand',
    'section-brand--tight',
    'section-brand--loose',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '12px',
        md: '16px',
        xl: '20px',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
        '3xl': '1680px',
      },
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Noto Sans JP', 'system-ui', 'sans-serif'],
        'league-spartan': ['var(--font-league-spartan)', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // require('@tailwindcss/line-clamp'),
  ],
}
