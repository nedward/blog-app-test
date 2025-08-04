import React from 'react';
import { cn } from '@/lib/utils';

const TextArea = React.forwardRef(({ 
  className,
  error = false,
  sentiment,
  showCharCount = false,
  maxLength,
  value = '',
  ...props 
}, ref) => {
  const sentimentClasses = {
    positive: 'focus:ring-sentiment-positive focus:border-sentiment-positive',
    negative: 'focus:ring-sentiment-negative focus:border-sentiment-negative',
    neutral: 'focus:ring-gray-400 focus:border-gray-400',
    mixed: 'focus:ring-sentiment-mixed focus:border-sentiment-mixed',
  };

  const charCount = value.length;
  const isNearLimit = maxLength && charCount > maxLength * 0.9;

  return (
    <div className="relative">
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm',
          'transition-all duration-200 resize-y',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : sentiment
            ? sentimentClasses[sentiment]
            : 'border-gray-200 focus:ring-primary-500 focus:border-primary-500',
          showCharCount && 'pb-8',
          className
        )}
        ref={ref}
        value={value}
        maxLength={maxLength}
        {...props}
      />
      
      {showCharCount && maxLength && (
        <div className={cn(
          'absolute bottom-2 right-2 text-xs',
          isNearLimit ? 'text-red-500 font-medium' : 'text-gray-400'
        )}>
          {charCount}/{maxLength}
        </div>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;