'use client';

import { UntitledLogo } from '@/components/foundations/logo/untitledui-logo';

const navigation = {
  main: [
    { name: 'Events', href: '/events' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
  social: [
    {
      name: 'Facebook',
      href: '#',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12.017 0C8.396 0 7.989.016 6.756.072 5.526.128 4.715.325 3.995.61c-.767.296-1.418.685-2.063 1.33C1.287 2.585.898 3.236.6 4.003.315 4.723.118 5.534.072 6.765.016 7.997 0 8.404 0 12.017c0 3.614.016 4.021.072 5.253.046 1.23.243 2.041.528 2.76.298.767.687 1.418 1.332 2.063.645.645 1.296 1.034 2.063 1.332.719.285 1.53.482 2.76.528 1.232.056 1.639.072 5.253.072 3.614 0 4.021-.016 5.253-.072 1.23-.046 2.041-.243 2.76-.528.767-.298 1.418-.687 2.063-1.332.645-.645 1.034-1.296 1.332-2.063.285-.719.482-1.53.528-2.76.056-1.232.072-1.639.072-5.253 0-3.614-.016-4.021-.072-5.253-.046-1.23-.243-2.041-.528-2.76-.298-.767-.687-1.418-1.332-2.063C19.777.898 19.126.509 18.359.211 17.64-.074 16.829-.271 15.598-.325 14.366-.381 13.959-.397 10.345-.397h3.672zm-.706 1.62c.96-.003 1.619.001 2.145.024 1.182.054 1.824.246 2.25.408.565.219.97.482 1.394.906.425.425.687.83.906 1.395.162.426.354 1.068.408 2.25.023.526.027 1.185.024 2.145v.002c.003.96-.001 1.619-.024 2.145-.054 1.182-.246 1.824-.408 2.25-.219.565-.482.97-.906 1.394-.425.425-.83.687-1.395.906-.426.162-1.068.354-2.25.408-.526.023-1.185.027-2.145.024h-.002c-.96.003-1.619-.001-2.145-.024-1.182-.054-1.824-.246-2.25-.408-.565-.219-.97-.482-1.394-.906-.425-.425-.687-.83-.906-1.395-.162-.426-.354-1.068-.408-2.25-.023-.526-.027-1.185-.024-2.145v-.002c-.003-.96.001-1.619.024-2.145.054-1.182.246-1.824.408-2.25.219-.565.482-.97.906-1.394.425-.425.83-.687 1.395-.906.426-.162 1.068-.354 2.25-.408.526-.023 1.185-.027 2.145-.024z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      href: '#',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: 'GitHub',
      href: '#',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ],
};

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-8">
          <div className="flex items-center">
            <UntitledLogo className="h-8 w-auto" />
          </div>
          <nav className="flex flex-wrap justify-center space-x-6 text-sm text-gray-600 md:justify-start">
            {navigation.main.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="hover:text-primary-600 transition-colors"
              >
                {item.name}
              </a>
            ))}
          </nav>
        </div>
        
        <div className="mt-8 flex justify-center space-x-6 md:mt-0">
          {navigation.social.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-400 hover:text-primary-600 transition-colors"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
      
      <div className="border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center space-x-6 md:order-2">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} EventBooking. All rights reserved.
              </p>
            </div>
            <div className="mt-4 md:order-1 md:mt-0">
              <p className="text-center text-xs text-gray-500 md:text-left">
                Built with ❤️ for amazing events
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}