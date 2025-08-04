import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ThumbsUp, ThumbsDown, Share2, Clock, Eye, User } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { 
  Button, 
  Card, 
  CardContent,
  SentimentBadge,
  Loading,
  EngagementButton
} from '@/components';
import { postsAPI, engagementAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const PostPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { user, isAuthenticated } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [engagement, setEngagement] = useState(null);
  const [engagementStats, setEngagementStats] = useState({ likes: 0, dislikes: 0 });

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getById(slug);
      setPost(response.data.post);
      setEngagementStats({
        likes: response.data.post.likes || 0,
        dislikes: response.data.post.dislikes || 0
      });
      
      // Get user's engagement if authenticated
      if (isAuthenticated) {
        try {
          const engagementRes = await engagementAPI.getStats(response.data.post.id);
          setEngagement(engagementRes.data.userEngagement);
        } catch (error) {
          console.error('Failed to fetch engagement:', error);
        }
      }
    } catch (error) {
      toast.error('Failed to load post');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleEngagement = async (isLike) => {
    if (!isAuthenticated) {
      toast.error('Please login to engage with posts');
      router.push('/login');
      return;
    }

    try {
      const response = await engagementAPI.toggle(post.id, isLike);
      setEngagement(response.data.engagement);
      setEngagementStats(response.data.stats);
      toast.success(response.data.engagement ? 'Engagement recorded!' : 'Engagement removed');
    } catch (error) {
      toast.error('Failed to update engagement');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <Loading size="lg" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link href="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{post.title} - SentiBlog</title>
        <meta name="description" content={post.excerpt || post.title} />
      </Head>

      <Layout>
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft size={16} className="mr-2" />
              Back to Posts
            </Button>
          </Link>

          <article>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-4xl font-display font-bold text-gray-900 flex-1">
                  {post.title}
                </h1>
                {post.sentiment && (
                  <SentimentBadge 
                    sentiment={post.sentiment}
                    score={post.sentiment_score}
                    size="lg"
                    showScore
                  />
                )}
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User size={16} />
                  <span>{post.author?.username || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye size={16} />
                  <span>{post.viewCount || 0} views</span>
                </div>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="mb-8">
                <CardContent className="prose prose-lg max-w-none">
                  {post.excerpt && (
                    <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
                  )}
                  <div 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Engagement Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="border-t pt-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">What did you think?</h3>
                <div className="flex items-center gap-4">
                  <EngagementButton
                    type="like"
                    count={engagementStats.likes}
                    isActive={engagement === true}
                    onClick={() => handleEngagement(true)}
                  />
                  <EngagementButton
                    type="dislike"
                    count={engagementStats.dislikes}
                    isActive={engagement === false}
                    onClick={() => handleEngagement(false)}
                  />
                </div>
              </div>

              {/* Share Section */}
              <div className="flex items-center gap-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }}
                >
                  <Share2 size={16} className="mr-2" />
                  Share Post
                </Button>
              </div>
            </motion.div>
          </article>
        </div>
      </Layout>
    </>
  );
};

export default PostPage;