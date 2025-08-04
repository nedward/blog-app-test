import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { Button, Card, SentimentBadge } from '@/components';

export default function Home() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/health`);
      if (response.data.status === 'ok') {
        setApiStatus('connected');
      }
    } catch (error) {
      setApiStatus('disconnected');
    }
  };

  return (
    <>
      <Head>
        <title>SentiBlog - Where Content Meets Emotion</title>
        <meta name="description" content="Transform your thoughts into viral, emotionally-resonant content" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout user={user}>
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
            <div className="flex gap-4 justify-center mb-16">
              <Link href="/components">
                <Button size="lg" variant="primary">
                  View Components
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="secondary">
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Features Grid */}
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

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center py-12 border-t border-gray-200"
          >
            <h2 className="text-3xl font-semibold mb-8">Built for the Modern Creator</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold text-primary-500">6</div>
                <div className="text-gray-600">Day Sprint Cycle</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-sentiment-positive">AI</div>
                <div className="text-gray-600">Sentiment Analysis</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-engagement-trending">100%</div>
                <div className="text-gray-600">Viral Ready</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-sentiment-mixed">24/7</div>
                <div className="text-gray-600">Real-time Insights</div>
              </div>
            </div>
          </motion.div>
        </div>
      </Layout>
    </>
  );
}