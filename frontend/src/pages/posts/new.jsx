import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Save, Eye, X, Hash } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { postsAPI } from '@/lib/api';
import Layout from '@/components/layout/Layout';
import { 
  Button, 
  Input, 
  TextArea,
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  SentimentBadge,
  SentimentIndicator,
  Loading
} from '@/components';
import toast from 'react-hot-toast';

const CreatePostPage = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useRequireAuth();
  
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: [],
    published: false,
  });

  const [tagInput, setTagInput] = useState('');

  // Debounced sentiment analysis
  const analyzeSentiment = useCallback(async (title, content) => {
    if (!title && !content) {
      setSentimentData(null);
      return;
    }

    setAnalyzing(true);
    
    // Enhanced sentiment analysis simulation
    setTimeout(() => {
      const text = `${title} ${content}`.toLowerCase();
      let score = 0;
      
      // Expanded sentiment dictionaries
      const positiveWords = {
        strong: ['amazing', 'excellent', 'fantastic', 'wonderful', 'love', 'perfect', 'beautiful', 'brilliant'],
        moderate: ['great', 'good', 'nice', 'happy', 'enjoy', 'like', 'helpful', 'interesting'],
        mild: ['okay', 'fine', 'decent', 'alright', 'satisfactory']
      };
      
      const negativeWords = {
        strong: ['terrible', 'awful', 'horrible', 'hate', 'disgusting', 'worst', 'disaster'],
        moderate: ['bad', 'poor', 'disappointing', 'sad', 'unfortunate', 'difficult'],
        mild: ['issue', 'problem', 'concern', 'lacking']
      };
      
      // Calculate positive score
      Object.entries(positiveWords).forEach(([strength, words]) => {
        words.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = text.match(regex);
          if (matches) {
            const weight = strength === 'strong' ? 0.3 : strength === 'moderate' ? 0.2 : 0.1;
            score += weight * matches.length;
          }
        });
      });
      
      // Calculate negative score
      Object.entries(negativeWords).forEach(([strength, words]) => {
        words.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = text.match(regex);
          if (matches) {
            const weight = strength === 'strong' ? -0.3 : strength === 'moderate' ? -0.2 : -0.1;
            score += weight * matches.length;
          }
        });
      });
      
      // Normalize score
      score = Math.max(-1, Math.min(1, score));
      
      // Determine sentiment
      let sentiment = 'neutral';
      if (score > 0.3) sentiment = 'positive';
      else if (score < -0.3) sentiment = 'negative';
      else if (Math.abs(score) > 0.1) sentiment = 'mixed';
      
      // Add confidence based on text length
      const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
      const confidence = Math.min(wordCount / 50, 1); // Max confidence at 50 words
      
      setSentimentData({ sentiment, score, confidence });
      setAnalyzing(false);
    }, 300);
  }, []);

  // Analyze sentiment when content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeSentiment(formData.title, formData.content);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [formData.title, formData.content, analyzeSentiment]);

  const handleSubmit = async (isDraft = false) => {
    setLoading(true);
    
    try {
      const response = await postsAPI.create({
        ...formData,
        published: !isDraft,
      });
      
      toast.success(isDraft ? 'Draft saved!' : 'Post published!');
      router.push(`/posts/${response.data.post.slug}`);
    } catch (error) {
      toast.error('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <Loading size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Create Post - SentiBlog</title>
        <meta name="description" content="Create a new blog post" />
      </Head>

      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Create New Post
            </h1>
            
            <div className="flex items-center gap-3">
              {sentimentData && !analyzing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <SentimentBadge 
                    sentiment={sentimentData.sentiment}
                    score={sentimentData.score}
                    showScore
                  />
                </motion.div>
              )}
              
              <Button
                variant="secondary"
                onClick={() => handleSubmit(true)}
                loading={loading}
                disabled={loading || !formData.title || !formData.content}
              >
                Save Draft
              </Button>
              
              <Button
                variant="primary"
                onClick={() => handleSubmit(false)}
                loading={loading}
                disabled={loading || !formData.title || !formData.content}
              >
                <Save size={16} className="mr-2" />
                Publish
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <Input
                      id="title"
                      placeholder="Enter your post title..."
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="text-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                      Excerpt (optional)
                    </label>
                    <Input
                      id="excerpt"
                      placeholder="Brief description of your post..."
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <TextArea
                      placeholder="Write your post content here..."
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={15}
                      sentiment={sentimentData?.sentiment}
                      showCharCount
                      maxLength={5000}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <form onSubmit={handleAddTag} className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        icon={Hash}
                      />
                      <Button type="submit" variant="secondary" size="md">
                        Add
                      </Button>
                    </form>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          #{tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Sentiment Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyzing ? (
                    <div className="flex justify-center py-8">
                      <Loading variant="dots" />
                    </div>
                  ) : sentimentData ? (
                    <div className="space-y-4">
                      <SentimentIndicator
                        sentiment={sentimentData.sentiment}
                        score={sentimentData.score}
                        variant="circle"
                        size="lg"
                        showLabel
                      />
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 text-center">
                          Your content appears to be{' '}
                          <span className="font-medium">{sentimentData.sentiment}</span>
                        </div>
                        {sentimentData.confidence < 0.5 && (
                          <div className="text-xs text-gray-500 text-center">
                            Write more to improve analysis accuracy
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Start writing to see sentiment analysis
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Writing Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Writing Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  {sentimentData?.sentiment === 'positive' ? (
                    <>
                      <p>✨ Great positive energy! Keep it up!</p>
                      <p>📸 Add uplifting images to enhance the mood</p>
                      <p>🎉 Consider adding a call-to-action</p>
                      <p>💫 Share personal success stories</p>
                    </>
                  ) : sentimentData?.sentiment === 'negative' ? (
                    <>
                      <p>💭 Consider balancing with solutions</p>
                      <p>🌟 End on a hopeful or constructive note</p>
                      <p>🤝 Invite reader engagement and support</p>
                      <p>📖 Share lessons learned</p>
                    </>
                  ) : sentimentData?.sentiment === 'mixed' ? (
                    <>
                      <p>⚖️ Nice balance! Complex topics resonate</p>
                      <p>🔄 Consider organizing pros and cons</p>
                      <p>💡 Highlight key takeaways</p>
                      <p>🗣️ Ask thought-provoking questions</p>
                    </>
                  ) : (
                    <>
                      <p>📝 Use descriptive titles that capture emotion</p>
                      <p>🎯 Keep paragraphs short for better readability</p>
                      <p>✨ Add images to make your post more engaging</p>
                      <p>🏷️ Use relevant tags to help others discover your content</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default CreatePostPage;