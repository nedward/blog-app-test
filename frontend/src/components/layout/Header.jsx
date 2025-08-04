import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PenSquare, TrendingUp, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '../ui/Button';

const Header = ({ user, onLogout }) => {
  const router = useRouter();
  
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/discover', label: 'Discover' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-display text-xl font-bold text-gray-900">
              SentiBlog
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 text-sm font-medium transition-colors',
                  router.pathname === item.href
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {item.icon && <item.icon size={16} />}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/posts/new')}
                  className="hidden sm:inline-flex"
                >
                  <PenSquare size={16} className="mr-1.5" />
                  Write
                </Button>
                
                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium text-sm">
                      {user.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      >
                        <User size={16} />
                        Profile
                      </Link>
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/login')}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/signup')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;