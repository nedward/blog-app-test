import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PenSquare, TrendingUp, Heart, MessageCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button, Card, CardContent, SentimentBadge, Loading, EmptyState } from '@/components';
import { postsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Delay the API check slightly to ensure env-config.js is loaded
    const timer = setTimeout(() => {
      checkApiConnection();
      fetchPosts();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const checkApiConnection = async () => {
    try {
      const response = await fetch(`${window.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/health`);
      if (response.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('disconnected');
      }
    } catch (error) {
      setApiStatus('disconnected');
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await postsAPI.getAll({ limit: 20 });
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <Head>
        <title>SentiBlog - Where Content Meets Emotion</title>
        <meta name="description" content="Transform your thoughts into viral, emotionally-resonant content" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center py-16"
          >
            <h1 className="text-6xl font-display font-bold text-gray-900 mb-4">
              Welcome to <span className="text-primary-500">SentiBlog</span>
            </h1>
            <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Where Content Meets Emotion
            </p>
            
            {/* API Status */}
            <div className="mb-12">
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                apiStatus === 'connected' ? 'bg-green-100 text-green-800' : 
                apiStatus === 'disconnected' ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  apiStatus === 'connected' ? 'bg-green-500' : 
                  apiStatus === 'disconnected' ? 'bg-red-500' : 
                  'bg-gray-500 animate-pulse'
                }`} />
                API Status: {apiStatus === 'connected' ? 'Connected' : 
                           apiStatus === 'disconnected' ? 'Disconnected' : 
                           'Checking...'}
              </div>
            </div>

            {/* CTA Buttons */}
            {isAuthenticated && (
              <div className="flex gap-4 justify-center mb-16">
                <Link href="/posts/new">
                  <Button size="lg" variant="primary">
                    <PenSquare size={20} className="mr-2" />
                    Write a Post
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Posts Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Recent Posts</h2>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <Loading size="lg" />
              </div>
            ) : posts.length === 0 ? (
              <EmptyState
                title="No posts yet"
                description="Be the first to share your thoughts and emotions!"
                action={
                  isAuthenticated ? (
                    <Link href="/posts/new">
                      <Button variant="primary">Create First Post</Button>
                    </Link>
                  ) : (
                    <Link href="/signup">
                      <Button variant="primary">Sign Up to Post</Button>
                    </Link>
                  )
                }
              />
            ) : (
              <div className="grid gap-6">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link href={`/posts/${post.slug}`}>
                      <Card hover className="cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h3 className="text-xl font-semibold text-gray-900 flex-1">
                              {post.title}
                            </h3>
                            {post.sentiment && (
                              <SentimentBadge 
                                sentiment={post.sentiment}
                                score={post.sentiment_score}
                                size="sm"
                              />
                            )}
                          </div>
                          
                          {post.excerpt && (
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                              <span>By {post.author?.username || 'Anonymous'}</span>
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Heart size={16} />
                                {post.likes || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle size={16} />
                                {post.commentCount || 0}
                              </span>
                            </div>
                          </div>
                          
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag.id}
                                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                                >
                                  #{tag.name}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{post.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Features Grid (shown when no posts) */}
          {!loading && posts.length === 0 && (
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card hover className="h-full">
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-4">🤖</div>
                    <h3 className="text-xl font-semibold mb-3">AI-Powered Insights</h3>
                    <p className="text-gray-600 mb-4">
                      Real-time sentiment analysis helps you understand your audience
                    </p>
                    <div className="flex justify-center gap-2">
                      <SentimentBadge sentiment="positive" size="sm" />
                      <SentimentBadge sentiment="negative" size="sm" />
                      <SentimentBadge sentiment="mixed" size="sm" />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card hover className="h-full">
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-4">🚀</div>
                    <h3 className="text-xl font-semibold mb-3">Viral Mechanics</h3>
                    <p className="text-gray-600 mb-4">
                      Built-in features designed to make your content spread
                    </p>
                    <div className="flex justify-center">
                      <div className="bg-gradient-engagement text-white px-3 py-1 rounded-full text-sm font-medium">
                        Trending Algorithm
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card hover className="h-full">
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold mb-3">Engagement Analytics</h3>
                    <p className="text-gray-600 mb-4">
                      Track likes, dislikes, and emotional responses in real-time
                    </p>
                    <div className="flex justify-center gap-4 text-sm">
                      <span className="text-engagement-like">❤️ 1.2K</span>
                      <span className="text-engagement-dislike">👎 45</span>
                      <span className="text-engagement-comment">💬 234</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}