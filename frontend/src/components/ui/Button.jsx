import React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = {
  variant: {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
    success: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700',
    sentiment: {
      positive: 'bg-sentiment-positive text-white hover:bg-green-600 active:bg-green-700',
      negative: 'bg-sentiment-negative text-white hover:bg-red-600 active:bg-red-700',
      neutral: 'bg-sentiment-neutral text-white hover:bg-gray-700 active:bg-gray-800',
      mixed: 'bg-sentiment-mixed text-white hover:bg-amber-600 active:bg-amber-700',
    },
  },
  size: {
    xs: 'h-7 px-2 text-xs',
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
    xl: 'h-14 px-8 text-xl',
  },
};

const Button = React.forwardRef(({ 
  className,
  variant = 'primary',
  size = 'md',
  sentiment,
  loading = false,
  disabled = false,
  children,
  ...props
}, ref) => {
  const variantClasses = sentiment 
    ? buttonVariants.variant.sentiment[sentiment]
    : buttonVariants.variant[variant];

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-all duration-200 ease-out',
        'transform hover:-translate-y-0.5 active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        variantClasses,
        buttonVariants.size[size],
        loading && 'relative text-transparent',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="animate-spin h-5 w-5 text-current" 
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
        </div>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;