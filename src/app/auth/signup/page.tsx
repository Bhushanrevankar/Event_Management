'use client';

import { useState, useCallback, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';
import { Select } from '@/components/base/select/select';
import { UntitledLogoMinimal } from '@/components/foundations/logo/untitledui-logo-minimal';
import { MainLayout } from '@/components/layout/main-layout';

// OPTIMIZATION 1: Move static data outside component to prevent re-creation
const ROLE_OPTIONS = [
  { id: 'attendee', label: 'Attendee - Book and attend events' },
  { id: 'organizer', label: 'Organizer - Create and manage events' }
] 

const PASSWORD_MIN_LENGTH = 6;

// OPTIMIZATION 2: Type safety for form data
interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'attendee' | 'organizer';
}

// OPTIMIZATION 3: Validation logic extracted for reusability and testing
const validateForm = (formData: FormData): string | null => {
  if (!formData.fullName?.trim() || !formData.email?.trim() || !formData.password) {
    return 'Please fill in all required fields';
  }
  
  if (formData.password !== formData.confirmPassword) {
    return 'Passwords do not match';
  }

  if (formData.password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return 'Please enter a valid email address';
  }

  return null;
};

export default function SignUpPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'attendee'
  });
  const [error, setError] = useState('');
  
  // OPTIMIZATION 4: Use useTransition for non-blocking UI updates
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // OPTIMIZATION 5: Memoize Supabase client to prevent recreation
  const supabase = useMemo(() => createClient(), []);

  // OPTIMIZATION 6: useCallback to prevent function recreation on every render
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  }, [error]);

  // OPTIMIZATION 7: Debounced validation (optional, for real-time feedback)
  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      // Client-side validation
      const validationError = validateForm(formData);
      if (validationError) {
        setError(validationError);
        return;
      }

      // OPTIMIZATION 8: Trim whitespace from inputs
      const trimmedEmail = formData.email.trim().toLowerCase();
      const trimmedFullName = formData.fullName.trim();

      // Sign up with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: formData.password,
        options: {
          data: {
            full_name: trimmedFullName,
            role: formData.role
          }
        }
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!data.user) {
        setError('Failed to create account. Please try again.');
        return;
      }

      // Create profile using the database function
      const { error: profileError } = await supabase
        .rpc('create_user_profile', {
          user_id: data.user.id,
          user_email: trimmedEmail,
          user_full_name: trimmedFullName,
          user_role: formData.role
        });

      if (profileError) {
        // OPTIMIZATION 9: Simplified error logging (remove in production)
        if (process.env.NODE_ENV === 'development') {
          console.error('Profile creation error:', profileError);
        }
        
        const errorMessage = profileError?.message || 'Failed to create user profile';
        setError(errorMessage);
        return;
      }

      // OPTIMIZATION 10: Use startTransition for navigation
      startTransition(() => {
        router.push('/auth/signin?message=Account created successfully. Please check your email to verify your account.');
      });

    } catch (error: any) {
      setError(error?.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, supabase, router]);

  // OPTIMIZATION 11: Memoize computed values
  const isFormValid = useMemo(() => {
    return formData.fullName.trim() && 
           formData.email.trim() && 
           formData.password && 
           formData.confirmPassword;
  }, [formData]);

  return (
    <MainLayout showAuthButtons={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <UntitledLogoMinimal className="h-12 w-12 text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Create Your Account
            </h2>
            <p className="mt-2 text-gray-600">
              Join us to discover amazing events
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-gray-200">
            <form onSubmit={handleSignUp} className="space-y-6" noValidate>
              <div>
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.fullName}
                  onChange={(value) => handleInputChange('fullName', value)}
                  isRequired
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>

              <div>
                <Input
                  label="Email address"
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  isRequired
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <Select 
                  selectedKey={formData.role} 
                  onSelectionChange={(value) => handleInputChange('role', value as 'attendee' | 'organizer')}
                  items={ROLE_OPTIONS}
                >
                  {(item) => (
                    <Select.Item key={item.id} id={item.id}>
                      {item.label}
                    </Select.Item>
                  )}
                </Select>
              </div>

              <div>
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(value) => handleInputChange('password', value)}
                  isRequired
                  placeholder="Create a password"
                  hint={`Must be at least ${PASSWORD_MIN_LENGTH} characters`}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <Input
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(value) => handleInputChange('confirmPassword', value)}
                  isRequired
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm" role="alert">
                  {error}
                </div>
              )}

              <div className="flex items-center">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <a href="/terms" className="text-primary-600 hover:text-primary-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-primary-600 hover:text-primary-500">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting || !isFormValid || isPending}
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  color="secondary"
                  className="w-full"
                  onClick={() => alert('Google OAuth will be implemented')}
                  disabled={isSubmitting}
                  type="button"
                >
                  Google
                </Button>

                <Button
                  color="secondary"
                  className="w-full"
                  onClick={() => alert('GitHub OAuth will be implemented')}
                  disabled={isSubmitting}
                  type="button"
                >
                  GitHub
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/auth/signin" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}