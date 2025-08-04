const { SentimentAnalysis } = require('../models');

// Mock sentiment analysis - replace with actual service (OpenAI, Google Cloud, etc.)
const analyzeSentiment = async (text) => {
  // This is a simple mock implementation
  // In production, integrate with OpenAI, Google Cloud Natural Language, or similar
  
  const positiveWords = ['happy', 'love', 'awesome', 'great', 'amazing', 'wonderful', 'excellent', 'fantastic', 'beautiful', 'excited'];
  const negativeWords = ['sad', 'hate', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'disgusting', 'angry', 'frustrated'];
  
  const lowercaseText = text.toLowerCase();
  let score = 0;
  
  // Count positive and negative words
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowercaseText.match(regex);
    if (matches) score += matches.length * 0.1;
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowercaseText.match(regex);
    if (matches) score -= matches.length * 0.1;
  });
  
  // Clamp score between -1 and 1
  score = Math.max(-1, Math.min(1, score));
  
  // Determine sentiment category
  let sentiment;
  if (score > 0.2) sentiment = 'positive';
  else if (score < -0.2) sentiment = 'negative';
  else sentiment = 'neutral';
  
  // Extract keywords (simple implementation)
  const words = text.split(/\s+/).filter(word => word.length > 4);
  const wordFreq = {};
  words.forEach(word => {
    const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleaned) {
      wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
    }
  });
  
  const keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  // Mock emotion scores
  const emotions = {
    joy: Math.max(0, score * 0.5 + Math.random() * 0.3),
    trust: Math.random() * 0.5 + 0.3,
    fear: Math.max(0, -score * 0.3 + Math.random() * 0.2),
    surprise: Math.random() * 0.4,
    sadness: Math.max(0, -score * 0.5 + Math.random() * 0.2),
    disgust: Math.max(0, -score * 0.4 + Math.random() * 0.1),
    anger: Math.max(0, -score * 0.4 + Math.random() * 0.2),
    anticipation: Math.random() * 0.5 + 0.2
  };
  
  return {
    sentiment,
    sentimentScore: score,
    keywords,
    emotions
  };
};

// Analyze and store sentiment for a post
const analyzePostSentiment = async (postId, title, content, transaction = null) => {
  try {
    // Combine title and content for analysis
    const textToAnalyze = `${title} ${content}`;
    
    // Perform sentiment analysis
    const analysis = await analyzeSentiment(textToAnalyze);
    
    // Extract only the fields that exist in our database
    const { sentiment, sentimentScore, keywords } = analysis;
    
    // Store or update sentiment analysis
    const [sentimentRecord, created] = await SentimentAnalysis.findOrCreate({
      where: { postId },
      defaults: {
        postId,
        sentiment,
        sentimentScore,
        keywords
      },
      transaction
    });
    
    if (!created) {
      await sentimentRecord.update({
        sentiment,
        sentimentScore,
        keywords
      }, { transaction });
    }
    
    return sentimentRecord;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
};

// Get sentiment distribution for multiple posts
const getSentimentDistribution = async (postIds) => {
  const sentiments = await SentimentAnalysis.findAll({
    where: { postId: postIds },
    attributes: ['sentiment']
  });
  
  const distribution = {
    positive: 0,
    negative: 0,
    neutral: 0
  };
  
  sentiments.forEach(({ sentiment }) => {
    distribution[sentiment]++;
  });
  
  return distribution;
};

// Get trending emotions across all posts
const getTrendingEmotions = async (limit = 7) => {
  // In a real implementation with emotion data, this would aggregate across posts
  // For now, we'll derive emotions from sentiment scores
  const recentAnalyses = await SentimentAnalysis.findAll({
    order: [['analyzedAt', 'DESC']],
    limit: 100
  });
  
  // Mock emotion data based on sentiment scores
  const emotionTotals = {
    joy: 0,
    trust: 0,
    fear: 0,
    surprise: 0,
    sadness: 0,
    disgust: 0,
    anger: 0,
    anticipation: 0
  };
  
  recentAnalyses.forEach(analysis => {
    const score = parseFloat(analysis.sentimentScore) || 0;
    
    // Derive emotions from sentiment score
    if (score > 0) {
      emotionTotals.joy += score * 0.6;
      emotionTotals.trust += score * 0.4;
      emotionTotals.anticipation += score * 0.3;
    } else if (score < 0) {
      emotionTotals.sadness += Math.abs(score) * 0.5;
      emotionTotals.anger += Math.abs(score) * 0.3;
      emotionTotals.fear += Math.abs(score) * 0.2;
    }
    
    // Add some randomness for variety
    emotionTotals.surprise += Math.random() * 0.3;
  });
  
  // Normalize and sort
  const totalPosts = recentAnalyses.length || 1;
  const trendingEmotions = Object.entries(emotionTotals)
    .map(([emotion, total]) => ({
      emotion,
      averageScore: total / totalPosts,
      trend: Math.random() > 0.5 ? 'up' : 'down' // Mock trend
    }))
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, limit);
  
  return trendingEmotions;
};

module.exports = {
  analyzeSentiment,
  analyzePostSentiment,
  getSentimentDistribution,
  getTrendingEmotions
};