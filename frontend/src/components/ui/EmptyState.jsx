import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, TrendingUp, Heart } from 'lucide-react';
import { cn, getSentimentEmoji } from '@/lib/utils';
import Button from './Button';

const EmptyState = ({ 
  type = 'default',
  title,
  description,
  action,
  sentiment,
  className,
}) => {
  const defaultConfigs = {
    default: {
      icon: FileText,
      title: 'No content yet',
      description: 'Get started by creating your first post.',
    },
    search: {
      icon: Search,
      title: 'No results found',
      description: 'Try adjusting your search or filters.',
    },
    trending: {
      icon: TrendingUp,
      title: 'No trending posts',
      description: 'Be the first to create something viral!',
    },
    likes: {
      icon: Heart,
      title: 'No liked posts yet',
      description: 'Start exploring and like posts that resonate with you.',
    },
  };

  const config = defaultConfigs[type] || defaultConfigs.default;
  const Icon = config.icon;
  
  const sentimentEmoji = sentiment && getSentimentEmoji(sentiment);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon size={32} className="text-gray-400" />
        </div>
        {sentimentEmoji && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute -bottom-2 -right-2 text-3xl"
          >
            {sentimentEmoji}
          </motion.div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || config.title}
      </h3>
      
      <p className="text-sm text-gray-600 mb-6 max-w-sm">
        {description || config.description}
      </p>
      
      {action && (
        <Button
          variant={action.variant || 'primary'}
          size="md"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;