import React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ 
  className,
  type = 'text',
  error = false,
  icon: Icon,
  sentiment,
  ...props 
}, ref) => {
  const sentimentClasses = {
    positive: 'focus:ring-sentiment-positive focus:border-sentiment-positive',
    negative: 'focus:ring-sentiment-negative focus:border-sentiment-negative',
    neutral: 'focus:ring-gray-400 focus:border-gray-400',
    mixed: 'focus:ring-sentiment-mixed focus:border-sentiment-mixed',
  };

  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={18} />
        </div>
      )}
      
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm',
          'transition-all duration-200',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          Icon && 'pl-10',
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : sentiment
            ? sentimentClasses[sentiment]
            : 'border-gray-200 focus:ring-primary-500 focus:border-primary-500',
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';

export default Input;