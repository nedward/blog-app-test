import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  TextArea, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  Loading,
  EmptyState,
  SentimentBadge,
  SentimentIndicator,
  EngagementButton,
  ShareButton,
  PostCard
} from '@/components';

const ComponentShowcase = () => {
  const [likeCount, setLikeCount] = useState(42);
  const [isLiked, setIsLiked] = useState(false);
  const [dislikeCount, setDislikeCount] = useState(5);
  const [isDisliked, setIsDisliked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
      setIsLiked(false);
    } else {
      setLikeCount(likeCount + 1);
      setIsLiked(true);
      if (isDisliked) {
        setDislikeCount(dislikeCount - 1);
        setIsDisliked(false);
      }
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setDislikeCount(dislikeCount - 1);
      setIsDisliked(false);
    } else {
      setDislikeCount(dislikeCount + 1);
      setIsDisliked(true);
      if (isLiked) {
        setLikeCount(likeCount - 1);
        setIsLiked(false);
      }
    }
  };

  const samplePost = {
    id: '1',
    title: 'Building a Sentiment-Aware Blog Platform',
    excerpt: 'Learn how we built SentiBlog, a platform that analyzes the emotional tone of content and creates viral-ready moments.',
    slug: 'building-sentiment-aware-blog',
    author: { username: 'johndoe', id: '1' },
    createdAt: new Date().toISOString(),
    viewCount: 1234,
    sentimentAnalysis: { sentiment: 'positive', sentimentScore: 0.75 },
    engagementStats: { likes: 42, dislikes: 5 },
    userEngagement: true,
    commentCount: 23,
    tags: [
      { id: '1', name: 'technology', slug: 'technology' },
      { id: '2', name: 'ai', slug: 'ai' },
    ],
    isTrending: true,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-8">
          Component Library
        </h1>
        
        {/* Buttons */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Buttons</h2>
          <Card>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button sentiment="positive">Positive</Button>
                <Button sentiment="negative">Negative</Button>
                <Button sentiment="neutral">Neutral</Button>
                <Button sentiment="mixed">Mixed</Button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Engagement Buttons */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Engagement Buttons</h2>
          <Card>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <EngagementButton
                  type="like"
                  count={likeCount}
                  isActive={isLiked}
                  onClick={handleLike}
                />
                <EngagementButton
                  type="dislike"
                  count={dislikeCount}
                  isActive={isDisliked}
                  onClick={handleDislike}
                />
                <ShareButton url={window.location.href} title="Check out this component!" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sentiment Components */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Sentiment Components</h2>
          <Card>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <SentimentBadge sentiment="positive" />
                <SentimentBadge sentiment="negative" />
                <SentimentBadge sentiment="neutral" />
                <SentimentBadge sentiment="mixed" />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <SentimentBadge sentiment="positive" showScore score={0.85} />
                <SentimentBadge sentiment="negative" showScore score={-0.65} />
                <SentimentBadge sentiment="neutral" showScore score={0.1} />
                <SentimentBadge sentiment="mixed" showScore score={0.4} />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <SentimentIndicator sentiment="positive" score={0.85} showLabel />
                <SentimentIndicator sentiment="negative" score={-0.65} showLabel />
                <SentimentIndicator sentiment="neutral" score={0.1} showLabel />
                <SentimentIndicator sentiment="mixed" score={0.4} showLabel />
              </div>
              
              <div className="space-y-4">
                <SentimentIndicator variant="bar" sentiment="positive" score={0.85} showLabel />
                <SentimentIndicator variant="bar" sentiment="negative" score={-0.65} showLabel />
                <SentimentIndicator variant="bar" sentiment="neutral" score={0.1} showLabel />
                <SentimentIndicator variant="bar" sentiment="mixed" score={0.4} showLabel />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form Components */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Form Components</h2>
          <Card>
            <CardContent className="space-y-4">
              <div className="space-y-4 max-w-md">
                <Input placeholder="Default input" />
                <Input placeholder="With error" error />
                <Input placeholder="Positive sentiment" sentiment="positive" />
                <Input placeholder="Negative sentiment" sentiment="negative" />
              </div>
              
              <div className="space-y-4 max-w-md">
                <TextArea placeholder="Write your thoughts..." />
                <TextArea 
                  placeholder="With character count" 
                  showCharCount 
                  maxLength={200}
                  value="This is some sample text to show the character count feature."
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Loading States */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Loading States</h2>
          <Card>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Loading size="sm" />
                <Loading size="md" />
                <Loading size="lg" />
                <Loading size="xl" />
              </div>
              
              <div className="flex items-center gap-6">
                <Loading variant="dots" sentiment="positive" />
                <Loading variant="dots" sentiment="negative" />
                <Loading variant="dots" sentiment="neutral" />
                <Loading variant="dots" sentiment="mixed" />
              </div>
              
              <div className="flex items-center gap-6">
                <Loading variant="pulse" size="md" />
                <Loading variant="spinner" size="md" showText />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Empty States */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Empty States</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <EmptyState 
                type="default"
                action={{
                  label: 'Create Post',
                  onClick: () => console.log('Create post'),
                }}
              />
            </Card>
            
            <Card>
              <EmptyState 
                type="search"
                sentiment="neutral"
              />
            </Card>
            
            <Card>
              <EmptyState 
                type="trending"
                action={{
                  label: 'Browse Posts',
                  onClick: () => console.log('Browse'),
                  variant: 'secondary',
                }}
              />
            </Card>
            
            <Card>
              <EmptyState 
                type="likes"
                sentiment="positive"
              />
            </Card>
          </div>
        </section>

        {/* Post Card */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Post Cards</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <PostCard 
              post={samplePost}
              onLike={(id) => console.log('Like post:', id)}
              onDislike={(id) => console.log('Dislike post:', id)}
            />
            
            <PostCard 
              post={{
                ...samplePost,
                sentimentAnalysis: { sentiment: 'negative', sentimentScore: -0.6 },
                isTrending: false,
              }}
              variant="compact"
            />
          </div>
          
          <div className="mt-6">
            <PostCard 
              post={{
                ...samplePost,
                sentimentAnalysis: { sentiment: 'mixed', sentimentScore: 0.3 },
              }}
              variant="featured"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ComponentShowcase;