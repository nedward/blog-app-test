/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand Colors - Full Scale
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Sentiment Colors
        sentiment: {
          positive: '#10b981',
          negative: '#ef4444',
          neutral: '#6b7280',
          mixed: '#f59e0b',
          // Light variants for backgrounds
          'positive-light': '#d1fae5',
          'negative-light': '#fee2e2',
          'neutral-light': '#f3f4f6',
          'mixed-light': '#fef3c7',
        },
        // Engagement Colors
        engagement: {
          like: '#ec4899',
          dislike: '#64748b',
          comment: '#8b5cf6',
          share: '#06b6d4',
          trending: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter var', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': '3rem',
        'h1': '2.25rem',
        'h2': '1.875rem',
        'h3': '1.5rem',
        'h4': '1.25rem',
      },
      animation: {
        'sentiment-pulse': 'sentiment-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'bounce-soft': 'bounce-soft 1s ease-in-out infinite',
        'like-heart': 'like-heart 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'sentiment-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'like-heart': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-sentiment': 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)',
        'gradient-engagement': 'linear-gradient(135deg, #ec4899 0%, #6366f1 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-dark': 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)',
      },
      boxShadow: {
        'sentiment-positive': '0 4px 14px 0 rgba(16, 185, 129, 0.15)',
        'sentiment-negative': '0 4px 14px 0 rgba(239, 68, 68, 0.15)',
        'sentiment-neutral': '0 4px 14px 0 rgba(107, 114, 128, 0.15)',
        'sentiment-mixed': '0 4px 14px 0 rgba(245, 158, 11, 0.15)',
        'engagement': '0 4px 14px 0 rgba(99, 102, 241, 0.15)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}