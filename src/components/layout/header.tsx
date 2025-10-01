'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu01, X, User01, LogOut01, Settings01 } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { UntitledLogo } from '@/components/foundations/logo/untitledui-logo';
import { cx } from '@/utils/cx';

interface HeaderProps {
  showAuthButtons?: boolean;
}

export function Header({ showAuthButtons = true }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Default to attendee dashboard - let users choose their intent
  

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
            
          </div>
        </div>
      </nav>
    </header>
  );
}