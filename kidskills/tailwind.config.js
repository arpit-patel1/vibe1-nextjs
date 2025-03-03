/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)'],
        nunito: ['var(--font-nunito)'],
      },
      colors: {
        'primary-blue': '#4A90E2',
        'sunshine-yellow': '#FFD166',
        'leaf-green': '#06D6A0',
        'coral-red': '#EF476F',
        'soft-purple': '#A480CF',
        'neutral-gray': '#F3F4F6',
        'warm-white': '#FFFCF9',
        'charcoal': '#2D3142',
        'light-gray': '#F9FAFB',
      },
    },
  },
  plugins: [],
}; 