/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'sm':   ['13px', { lineHeight: '18px', letterSpacing: '0.01em' }],
        'base': ['15px', { lineHeight: '22px' }],
        'lg':   ['17px', { lineHeight: '24px', fontWeight: '500' }],
        'xl':   ['20px', { lineHeight: '28px', fontWeight: '500' }],
        '2xl':  ['24px', { lineHeight: '32px', fontWeight: '600' }],
        '3xl':  ['30px', { lineHeight: '38px', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
}
