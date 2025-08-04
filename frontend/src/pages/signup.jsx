import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, SentimentBadge } from '@/components';

const SignupPage = () => {
  const { register, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState('weak');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');

    // Check password strength
    if (e.target.name === 'password') {
      const strength = getPasswordStrength(e.target.value);
      setPasswordStrength(strength);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length < 6) return 'weak';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'strong': return 'text-green-600 bg-green-50';
      default: return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (passwordStrength === 'weak') {
      setError('Password is too weak. Please use a stronger password.');
      return;
    }

    setLoading(true);

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });
    
    if (!result.success) {
      setError(result.error.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - SentiBlog</title>
        <meta name="description" content="Create your SentiBlog account" />
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
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>
                Join the emotion-aware blogging community
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Fun sentiment badges */}
              <div className="flex justify-center gap-2 mb-6">
                <SentimentBadge sentiment="positive" size="sm" />
                <SentimentBadge sentiment="mixed" size="sm" />
                <SentimentBadge sentiment="neutral" size="sm" />
              </div>

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
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      icon={User}
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      autoComplete="username"
                    />
                  </div>

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
                      autoComplete="new-password"
                    />
                    {formData.password && (
                      <div className={`mt-2 text-xs px-2 py-1 rounded ${getPasswordStrengthColor()}`}>
                        Password strength: {passwordStrength}
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      icon={Lock}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loading}
                  disabled={loading}
                >
                  Create Account
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By signing up, you agree to our{' '}
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

export default SignupPage;