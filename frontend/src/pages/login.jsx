import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components';

const LoginPage = () => {
  const router = useRouter();
  const { login, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);
    
    if (!result.success) {
      setError(result.error.message || 'Login failed');
      setLoading(false);
    }
  };

  // If already logged in, redirect
  React.useEffect(() => {
    if (!authLoading && router.query.redirect) {
      // User was redirected here, don't auto-redirect back
    }
  }, [authLoading, router]);

  return (
    <>
      <Head>
        <title>Login - SentiBlog</title>
        <meta name="description" content="Login to your SentiBlog account" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sentiment-positive/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="font-display text-2xl font-bold text-gray-900">
              SentiBlog
            </span>
          </Link>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Login to share your thoughts and emotions
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2"
                  >
                    <AlertCircle size={20} className="mt-0.5" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      icon={Mail}
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      icon={Lock}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  
                  <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loading}
                  disabled={loading}
                >
                  Login
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                    Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By logging in, you agree to our{' '}
              <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;