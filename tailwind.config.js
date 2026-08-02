/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        qcpp: {
          purple: '#46178f',
          darkPurple: '#25076b',
          lightPurple: '#864cbf',
          red: '#e21b3c',
          redHover: '#c61734',
          blue: '#1368ce',
          blueHover: '#1056ab',
          yellow: '#d89e00',
          yellowHover: '#b58500',
          green: '#26890c',
          greenHover: '#1f7009',
        },
        // Keep kahoot alias for backwards compatibility if needed
        kahoot: {
          purple: '#46178f',
          darkPurple: '#25076b',
          lightPurple: '#864cbf',
          red: '#e21b3c',
          redHover: '#c61734',
          blue: '#1368ce',
          blueHover: '#1056ab',
          yellow: '#d89e00',
          yellowHover: '#b58500',
          green: '#26890c',
          greenHover: '#1f7009',
        }
      },
      animation: {
        'bounce-short': 'bounce 0.6s ease-in-out 2',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
