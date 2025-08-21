'use client';

import { useState } from 'react';

// Force dynamic rendering for auth pages
export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';
import { UntitledLogoMinimal } from '@/components/foundations/logo/untitledui-logo-minimal';
import { MainLayout } from '@/components/layout/main-layout';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setResendLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage('Confirmation email sent! Please check your inbox.');
      }
    } catch (error: any) {
      setError('Failed to resend confirmation email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        // Check if user has a profile, if not redirect to complete profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!profile) {
          // Create a basic profile
          await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: data.user.email || '',
                full_name: data.user.user_metadata?.full_name || '',
                role: 'attendee'
              }
            ]);
        }

        // Redirect based on user role
        const userRole = profile?.role || 'attendee';
        let redirectPath = redirectTo;
        
        if (redirectTo === '/dashboard') {
          redirectPath = userRole === 'admin' ? '/admin' : `/dashboard/${userRole}`;
        }
        
        router.push(redirectPath);
        router.refresh(); // Refresh to update auth state
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout showAuthButtons={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <UntitledLogoMinimal className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-gray-200">
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(value) => setEmail(value)}
                isRequired
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(value) => setPassword(value)}
                isRequired
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
                {error.includes('Email not confirmed') && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      color="secondary"
                      onClick={handleResendConfirmation}
                      disabled={resendLoading || !email}
                      className="text-xs"
                    >
                      {resendLoading ? 'Sending...' : 'Resend confirmation email'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                {successMessage}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                color="secondary"
                className="w-full"
                onClick={() => alert('Google OAuth will be implemented')}
              >
                Google
              </Button>

              <Button
                color="secondary"
                className="w-full"
                onClick={() => alert('GitHub OAuth will be implemented')}
              >
                GitHub
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/auth/signup" className="font-medium text-primary-600 hover:text-primary-500">
                Sign up
              </a>
            </p>
          </div>
        </div>
        </div>
      </div>
    </MainLayout>
  );
}