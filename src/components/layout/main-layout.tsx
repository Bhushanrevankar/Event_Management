import { ReactNode } from 'react';
import { Header } from './header';
import { Footer } from './footer';

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showAuthButtons?: boolean;
}

export function MainLayout({ 
  children, 
  showHeader = true, 
  showFooter = true, 
  showAuthButtons = true 
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header showAuthButtons={showAuthButtons} />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}