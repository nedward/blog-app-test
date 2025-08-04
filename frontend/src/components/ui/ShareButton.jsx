import React, { useState } from 'react';
import { Share2, Twitter, Facebook, Link2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const ShareButton = ({ 
  url,
  title,
  text,
  via,
  hashtags = [],
  size = 'md',
  variant = 'icon',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const shareOptions = [
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:bg-blue-50 hover:text-blue-500',
      action: () => {
        const params = new URLSearchParams({
          text: text || title,
          url,
          ...(via && { via }),
          ...(hashtags.length && { hashtags: hashtags.join(',') }),
        });
        window.open(`https://twitter.com/intent/tweet?${params}`, '_blank');
      },
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-blue-50 hover:text-blue-600',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      },
    },
    {
      name: 'Copy Link',
      icon: copied ? Check : Link2,
      color: copied ? 'bg-green-50 text-green-500' : 'hover:bg-gray-50 hover:text-gray-700',
      action: async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      },
    },
  ];

  if (variant === 'text') {
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
          'bg-white border border-gray-200 text-gray-700',
          'hover:bg-gray-50 transition-colors',
          'font-medium text-sm',
          className
        )}
      >
        <Share2 size={16} />
        Share
      </button>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center justify-center rounded-lg',
          'bg-white border border-gray-200 text-gray-600',
          'hover:bg-gray-50 hover:text-gray-900 transition-all',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          sizeClasses[size],
          className
        )}
      >
        <Share2 size={iconSizes[size]} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Share Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 bottom-full mb-2 z-50"
            >
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[180px]">
                <div className="text-xs font-medium text-gray-500 px-3 py-2">
                  Share this post
                </div>
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => {
                      option.action();
                      if (option.name !== 'Copy Link') {
                        setIsOpen(false);
                      }
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                      'text-sm font-medium text-gray-700',
                      'transition-colors',
                      option.color
                    )}
                  >
                    <option.icon size={16} />
                    {option.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareButton;