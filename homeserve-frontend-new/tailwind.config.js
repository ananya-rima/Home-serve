/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef7f6',
          100: '#d6ece9',
          200: '#aed9d3',
          300: '#7ec0b7',
          400: '#4aa298',
          500: '#2e857b',
          600: '#1f6b63',
          700: '#1a5650',
          800: '#164541',
          900: '#123936',
          950: '#081e1c',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        ink: {
          50: '#f6f7f8',
          100: '#eceef0',
          200: '#d5dade',
          300: '#b0b9c1',
          400: '#84919d',
          500: '#657280',
          600: '#505b68',
          700: '#424a55',
          800: '#393f48',
          900: '#23272d',
          950: '#16181c',
        },
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(16, 24, 32, 0.08), 0 1px 2px rgba(16,24,32,0.04)',
        card: '0 4px 24px -6px rgba(16, 24, 32, 0.10)',
        floating: '0 12px 40px -8px rgba(16, 24, 32, 0.20)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #164541 0%, #2e857b 55%, #4aa298 100%)',
        'accent-gradient': 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
