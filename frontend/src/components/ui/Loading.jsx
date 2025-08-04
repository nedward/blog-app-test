import React from 'react';
import { cn } from '@/lib/utils';

const Loading = ({ 
  size = 'md',
  variant = 'spinner',
  sentiment,
  className,
  text = 'Loading...',
  showText = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const sentimentColors = {
    positive: 'text-sentiment-positive',
    negative: 'text-sentiment-negative',
    neutral: 'text-sentiment-neutral',
    mixed: 'text-sentiment-mixed',
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full bg-current animate-bounce-soft',
              size === 'sm' ? 'w-1.5 h-1.5' : 
              size === 'md' ? 'w-2 h-2' : 
              size === 'lg' ? 'w-3 h-3' : 'w-4 h-4',
              sentiment ? sentimentColors[sentiment] : 'text-primary-500'
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
        {showText && <span className="ml-2 text-sm text-gray-600">{text}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('relative', sizeClasses[size], className)}>
        <div className={cn(
          'absolute inset-0 rounded-full animate-ping opacity-75',
          sentiment ? sentimentColors[sentiment] : 'text-primary-500',
          'bg-current'
        )} />
        <div className={cn(
          'relative rounded-full',
          sentiment ? sentimentColors[sentiment] : 'text-primary-500',
          'bg-current',
          sizeClasses[size]
        )} />
        {showText && <span className="ml-2 text-sm text-gray-600">{text}</span>}
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn('flex items-center', className)}>
      <svg 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          sentiment ? sentimentColors[sentiment] : 'text-primary-500'
        )}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {showText && <span className="ml-2 text-sm text-gray-600">{text}</span>}
    </div>
  );
};

export default Loading;