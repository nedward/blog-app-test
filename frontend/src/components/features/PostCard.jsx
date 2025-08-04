import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Eye, TrendingUp, MessageCircle } from 'lucide-react';
import { cn, formatDate, formatEngagementCount } from '@/lib/utils';
import SentimentBadge from '../ui/SentimentBadge';
import EngagementButton from '../ui/EngagementButton';

const PostCard = ({ 
  post,
  onLike,
  onDislike,
  variant = 'default',
  className,
}) => {
  const {
    id,
    title,
    excerpt,
    slug,
    author,
    createdAt,
    viewCount = 0,
    sentimentAnalysis,
    engagementStats = { likes: 0, dislikes: 0 },
    userEngagement,
    commentCount = 0,
    tags = [],
    isTrending = false,
  } = post;

  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  const cardVariants = {
    default: 'p-6',
    compact: 'p-4',
    featured: 'p-8 bg-gradient-to-br from-primary-50 to-purple-50',
  };

  const getSentimentBorderColor = (sentiment) => {
    const colors = {
      positive: 'border-sentiment-positive/20 hover:border-sentiment-positive/40',
      negative: 'border-sentiment-negative/20 hover:border-sentiment-negative/40',
      neutral: 'border-gray-200 hover:border-gray-300',
      mixed: 'border-sentiment-mixed/20 hover:border-sentiment-mixed/40',
    };
    return colors[sentiment] || colors.neutral;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={cn(
        'relative bg-white rounded-lg border-2 transition-all duration-200',
        'hover:shadow-lg',
        getSentimentBorderColor(sentimentAnalysis?.sentiment),
        cardVariants[variant],
        className
      )}
    >
      {/* Trending Badge */}
      {isTrending && (
        <div className="absolute -top-2 -right-2 z-10">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            className="bg-gradient-engagement text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
          >
            <TrendingUp size={14} />
            Trending
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {sentimentAnalysis && (
              <SentimentBadge 
                sentiment={sentimentAnalysis.sentiment}
                score={sentimentAnalysis.sentimentScore}
                size={isCompact ? 'sm' : 'md'}
                showScore={isFeatured}
              />
            )}
            <span className="text-sm text-gray-500">•</span>
            <time className="text-sm text-gray-500">{formatDate(createdAt)}</time>
          </div>
          
          <Link href={`/posts/${slug}`}>
            <h3 className={cn(
              'font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2',
              isCompact ? 'text-lg' : 'text-xl',
              isFeatured && 'text-2xl'
            )}>
              {title}
            </h3>
          </Link>
        </div>
      </div>

      {/* Content */}
      <p className={cn(
        'text-gray-600 mb-4',
        isCompact ? 'line-clamp-2 text-sm' : 'line-clamp-3'
      )}>
        {excerpt}
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium text-sm">
          {author?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{author?.username}</p>
        </div>
      </div>

      {/* Tags */}
      {!isCompact && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <Link
              key={tag.id || tag.name}
              href={`/tags/${tag.slug}`}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
            >
              #{tag.name}
            </Link>
          ))}
          {tags.length > 3 && (
            <span className="text-xs px-2 py-1 text-gray-500">
              +{tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {/* Engagement Buttons */}
        <div className="flex items-center gap-2">
          <EngagementButton
            type="like"
            count={engagementStats.likes}
            isActive={userEngagement === true}
            onClick={() => onLike?.(id)}
            size={isCompact ? 'sm' : 'md'}
          />
          <EngagementButton
            type="dislike"
            count={engagementStats.dislikes}
            isActive={userEngagement === false}
            onClick={() => onDislike?.(id)}
            size={isCompact ? 'sm' : 'md'}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MessageCircle size={16} />
            <span>{formatEngagementCount(commentCount)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={16} />
            <span>{formatEngagementCount(viewCount)}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;