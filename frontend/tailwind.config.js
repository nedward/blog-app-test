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
        // Brand colors
        primary: {
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
        },
        // Sentiment colors
        sentiment: {
          positive: '#10b981',
          neutral: '#6b7280',
          negative: '#ef4444',
          mixed: '#f59e0b',
        },
        // Engagement colors
        engagement: {
          like: '#ec4899',
          dislike: '#64748b',
          comment: '#8b5cf6',
          share: '#06b6d4',
          trending: '#f59e0b',
        },
      },
      animation: {
        'sentiment-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'like-bounce': 'bounce 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}