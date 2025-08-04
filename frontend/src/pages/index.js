import Head from 'next/head'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'

export default function Home() {
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    checkApiConnection()
  }, [])

  const checkApiConnection = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      if (response.data.status === 'ok') {
        setApiStatus('connected')
      }
    } catch (error) {
      setApiStatus('disconnected')
    }
  }

  return (
    <>
      <Head>
        <title>SentiBlog - Where Content Meets Emotion</title>
        <meta name="description" content="Transform your thoughts into viral, emotionally-resonant content" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-primary-100 via-white to-sentiment-positive/10">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              Welcome to SentiBlog
            </h1>
            <p className="text-2xl text-gray-600 mb-8">
              Where Content Meets Emotion
            </p>
            
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white p-8 rounded-xl shadow-lg"
              >
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
                <p className="text-gray-600">
                  Real-time sentiment analysis helps you understand your audience
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white p-8 rounded-xl shadow-lg"
              >
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold mb-2">Viral Mechanics</h3>
                <p className="text-gray-600">
                  Built-in features designed to make your content spread
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white p-8 rounded-xl shadow-lg"
              >
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-semibold mb-2">Engagement Analytics</h3>
                <p className="text-gray-600">
                  Track likes, dislikes, and emotional responses in real-time
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-12"
            >
              <button className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
                Get Started
              </button>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </>
  )
}