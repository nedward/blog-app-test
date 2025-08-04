import React from 'react';
import { motion } from 'framer-motion';
import { cn, getSentimentColor, getSentimentEmoji } from '@/lib/utils';

const SentimentBadge = ({ 
  sentiment = 'neutral',
  score,
  size = 'md',
  animated = true,
  showEmoji = true,
  showScore = false,
  className,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const sentimentClasses = {
    positive: 'bg-sentiment-positive-light text-sentiment-positive border-sentiment-positive/20',
    negative: 'bg-sentiment-negative-light text-sentiment-negative border-sentiment-negative/20',
    neutral: 'bg-sentiment-neutral-light text-sentiment-neutral border-sentiment-neutral/20',
    mixed: 'bg-sentiment-mixed-light text-sentiment-mixed border-sentiment-mixed/20',
  };

  const emoji = getSentimentEmoji(sentiment);
  
  const AnimationWrapper = animated ? motion.div : 'div';
  const animationProps = animated ? {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <AnimationWrapper
      {...animationProps}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        'rounded-full border',
        sizeClasses[size],
        sentimentClasses[sentiment],
        animated && sentiment !== 'neutral' && 'animate-sentiment-pulse',
        className
      )}
    >
      {showEmoji && (
        <span className="inline-block" role="img" aria-label={sentiment}>
          {emoji}
        </span>
      )}
      
      <span className="capitalize">{sentiment}</span>
      
      {showScore && score !== undefined && (
        <span className="opacity-75">
          ({score > 0 ? '+' : ''}{(score * 100).toFixed(0)}%)
        </span>
      )}
    </AnimationWrapper>
  );
};

export default SentimentBadge;