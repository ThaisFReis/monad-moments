/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        monad: {
          bg: '#0a0a12',
          surface: '#13131f',
          card: '#1a1a2e',
          border: '#2a2a45',
          purple: '#836EF9',
          fuchsia: '#E040FB',
          accent: '#00E5FF',
          success: '#00E676',
          text: '#E8E8F0',
          muted: '#8888AA',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(131, 110, 249, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(224, 64, 251, 0.5)' },
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
