/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        monad: {
          bg: '#0a0a0a',
          surface: '#101010',
          card: '#171717',
          border: '#262626',
          purple: '#FF4500',
          fuchsia: '#FF7A00',
          accent: '#F5F5F5',
          success: '#00E676',
          text: '#F5F5F5',
          muted: '#737373',
        },
      },
      fontFamily: {
        display: ['Instrument Serif', 'serif'],
        body: ['ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'badge-reveal': 'badge-reveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 18px rgba(255, 69, 0, 0.22)' },
          '50%': { boxShadow: '0 0 36px rgba(255, 69, 0, 0.42)' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'badge-reveal': {
          from: { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
          to: { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'shimmer': {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
