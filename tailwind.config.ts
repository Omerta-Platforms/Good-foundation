import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
      },
      colors: {
        // "Milk & black" brand scale — replaces the old blue `primary`.
        // Every existing `primary-*` utility class across the app now
        // resolves to this warm gold-clay accent instead of blue.
        primary: {
          50: '#FBF8F1',
          100: '#F4ECDB',
          200: '#E7D5AF',
          300: '#D8BC80',
          400: '#C6A263',
          500: '#B08D57',
          600: '#93734A',
          700: '#755A3A',
          800: '#584330',
          900: '#3D2F23',
          950: '#241C16',
        },
        // Warm neutral scale — replaces cool `gray` with a milk/black
        // family so body text, borders, and surfaces read warm, not blue-gray.
        gray: {
          50: '#FAF9F6',
          100: '#F2EFE8',
          200: '#E4DFD3',
          300: '#CFC7B4',
          400: '#A79E8C',
          500: '#8C8577',
          600: '#6B655A',
          700: '#4F4A42',
          800: '#332F29',
          900: '#1E1B17',
          950: '#141311',
        },
        milk: '#F7F5F0',
        ink: '#141311',
      },
    },
  },
  plugins: [],
}
export default config
