import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export const useRequireAuth = (redirectTo = '/login') => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push({
        pathname: redirectTo,
        query: { redirect: router.asPath },
      });
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  return { isAuthenticated, loading };
};