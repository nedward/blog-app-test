import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getSentimentColor(sentiment) {
  const colors = {
    positive: 'text-sentiment-positive bg-sentiment-positive-light',
    negative: 'text-sentiment-negative bg-sentiment-negative-light',
    neutral: 'text-sentiment-neutral bg-sentiment-neutral-light',
    mixed: 'text-sentiment-mixed bg-sentiment-mixed-light',
  };
  return colors[sentiment] || colors.neutral;
}

export function getSentimentEmoji(sentiment) {
  const emojis = {
    positive: '😊',
    negative: '😕',
    neutral: '😐',
    mixed: '🤔',
  };
  return emojis[sentiment] || emojis.neutral;
}

export function formatEngagementCount(count) {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
}

export function formatDate(date) {
  const now = new Date();
  const postDate = new Date(date);
  const diffInHours = (now - postDate) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
    return `${diffInMinutes}m ago`;
  }
  
  if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  }
  
  if (diffInHours < 168) { // 7 days
    return `${Math.floor(diffInHours / 24)}d ago`;
  }
  
  return postDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}