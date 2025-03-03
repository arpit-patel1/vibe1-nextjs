import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors
        "primary-blue": "#4A90E2",
        "sunshine-yellow": "#FFD166",
        "leaf-green": "#06D6A0",
        "coral-red": "#EF476F",
        // Secondary colors
        "soft-purple": "#A480CF",
        "neutral-gray": "#F3F4F6",
        "warm-white": "#FFFCF9",
        "charcoal": "#2D3142",
      },
      fontFamily: {
        'comic': ['Comic Neue', 'cursive'],
        'nunito': ['Nunito', 'sans-serif'],
      },
      fontSize: {
        'xs': '16px',    // Small text
        'sm': '18px',    // Small text
        'base': '20px',  // Medium text
        'lg': '22px',    // Medium text
        'xl': '24px',    // Large text
        '2xl': '28px',   // Large text
        '3xl': '32px',   // Large text
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
};
export default config; 