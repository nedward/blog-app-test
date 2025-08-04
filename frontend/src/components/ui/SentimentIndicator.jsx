import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const SentimentIndicator = ({ 
  sentiment = 'neutral',
  score = 0,
  size = 'md',
  variant = 'circle',
  animated = true,
  showLabel = false,
  className,
}) => {
  const sizeClasses = {
    sm: { circle: 'w-12 h-12', bar: 'h-2' },
    md: { circle: 'w-16 h-16', bar: 'h-3' },
    lg: { circle: 'w-20 h-20', bar: 'h-4' },
  };

  const sentimentConfig = {
    positive: {
      color: 'bg-sentiment-positive',
      lightColor: 'bg-sentiment-positive-light',
      label: 'Positive',
      emoji: '😊',
    },
    negative: {
      color: 'bg-sentiment-negative',
      lightColor: 'bg-sentiment-negative-light',
      label: 'Negative',
      emoji: '😕',
    },
    neutral: {
      color: 'bg-sentiment-neutral',
      lightColor: 'bg-sentiment-neutral-light',
      label: 'Neutral',
      emoji: '😐',
    },
    mixed: {
      color: 'bg-sentiment-mixed',
      lightColor: 'bg-sentiment-mixed-light',
      label: 'Mixed',
      emoji: '🤔',
    },
  };

  const config = sentimentConfig[sentiment];
  const percentage = Math.abs(score * 100);

  if (variant === 'bar') {
    return (
      <div className={cn('w-full', className)}>
        {showLabel && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {config.emoji} {config.label}
            </span>
            <span className="text-sm text-gray-500">
              {score > 0 ? '+' : ''}{(score * 100).toFixed(0)}%
            </span>
          </div>
        )}
        <div className={cn(
          'w-full rounded-full overflow-hidden',
          config.lightColor,
          sizeClasses[size].bar
        )}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn('h-full rounded-full', config.color)}
          />
        </div>
      </div>
    );
  }

  // Circle variant
  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <div className={cn(
        'relative rounded-full flex items-center justify-center',
        config.lightColor,
        sizeClasses[size].circle
      )}>
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-gray-200"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            className={config.color.replace('bg-', 'text-')}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: percentage / 100 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              strokeDasharray: '283',
              strokeDashoffset: '283',
            }}
          />
        </svg>
        
        <div className="z-10 text-center">
          <div className="text-2xl">{config.emoji}</div>
          {size !== 'sm' && (
            <div className="text-xs font-medium text-gray-700 mt-1">
              {(score * 100).toFixed(0)}%
            </div>
          )}
        </div>
      </div>
      
      {showLabel && (
        <span className="mt-2 text-sm font-medium text-gray-700">
          {config.label}
        </span>
      )}
    </div>
  );
};

export default SentimentIndicator;