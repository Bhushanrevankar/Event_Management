'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu01, X, User01, LogOut01, Settings01 } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { UntitledLogo } from '@/components/foundations/logo/untitledui-logo';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { cx } from '@/utils/cx';

interface HeaderProps {
  showAuthButtons?: boolean;
}

export function Header({ showAuthButtons = true }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const { profile, isOrganizer } = useProfile();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Default to attendee dashboard - let users choose their intent
  const getDashboardUrl = () => {
    return '/dashboard/attendee';
  };

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    { name: 'Events', href: '/events' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    window.location.href = '/'; // Redirect to homepage after sign out
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-6 lg:border-none">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <UntitledLogo className="h-8 w-auto" />
            </a>
            <div className="ml-10 hidden space-x-8 lg:block">
              {navigation.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-base font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {showAuthButtons && !loading && (
            <div className="ml-10 hidden lg:flex">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-3 py-2"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <User01 className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {user?.user_metadata?.full_name || user?.email || 'User'}
                    </span>
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <a
                        href={getDashboardUrl()}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-2">
                          <Settings01 className="h-4 w-4" />
                          <span>My Dashboard</span>
                        </div>
                      </a>
                      {isOrganizer && (
                        <a
                          href="/dashboard/organizer"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <div className="flex items-center space-x-2">
                            <Settings01 className="h-4 w-4" />
                            <span>Organizer Panel</span>
                          </div>
                        </a>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-2">
                          <LogOut01 className="h-4 w-4" />
                          <span>Sign out</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-x-4 flex">
                  <Button
                    color="secondary"
                    href="/auth/signin"
                    size="md"
                  >
                    Sign in
                  </Button>
                  <Button
                    href="/auth/signup"
                    size="md"
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="ml-10 lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu01 className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={cx(
          "lg:hidden transition-all duration-300 ease-in-out overflow-hidden",
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="space-y-1 px-2 pb-3 pt-2 border-t border-gray-200">
            {navigation.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
              >
                {link.name}
              </a>
            ))}
            {showAuthButtons && !loading && (
              <div className="mt-4 px-3">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700">
                      <User01 className="h-4 w-4" />
                      <span>{user?.user_metadata?.full_name || user?.email || 'User'}</span>
                    </div>
                    <a
                      href={getDashboardUrl()}
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    >
                      My Dashboard
                    </a>
                    {isOrganizer && (
                      <a
                        href="/dashboard/organizer"
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      >
                        Organizer Panel
                      </a>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      color="secondary"
                      href="/auth/signin"
                      size="md"
                      className="w-full"
                    >
                      Sign in
                    </Button>
                    <Button
                      href="/auth/signup"
                      size="md"
                      className="w-full"
                    >
                      Sign up
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}