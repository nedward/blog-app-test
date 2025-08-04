import React from 'react';
import { Heart, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, formatEngagementCount } from '@/lib/utils';

const EngagementButton = ({ 
  type = 'like',
  count = 0,
  isActive = false,
  onClick,
  disabled = false,
  size = 'md',
  showCount = true,
  className,
}) => {
  const isLike = type === 'like';
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 text-base gap-2',
    lg: 'h-12 px-5 text-lg gap-2.5',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const Icon = isLike ? Heart : ThumbsDown;
  
  const activeClasses = isLike
    ? 'text-engagement-like bg-pink-50 hover:bg-pink-100'
    : 'text-engagement-dislike bg-slate-50 hover:bg-slate-100';
    
  const inactiveClasses = 'text-gray-600 bg-white hover:bg-gray-50 border-gray-200';

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-medium',
        'border rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        isLike ? 'focus:ring-engagement-like' : 'focus:ring-engagement-dislike',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        isActive ? activeClasses : inactiveClasses,
        className
      )}
    >
      <motion.div
        animate={isActive ? {
          scale: [1, 1.2, 1],
        } : {}}
        transition={{ duration: 0.3 }}
      >
        <Icon 
          size={iconSizes[size]} 
          className={cn(
            'transition-all duration-200',
            isActive && isLike && 'fill-current'
          )}
        />
      </motion.div>
      
      {showCount && (
        <span className="font-semibold">
          {formatEngagementCount(count)}
        </span>
      )}
    </motion.button>
  );
};

export default EngagementButton;