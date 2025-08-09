'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';
import { Select } from '@/components/base/select/select';
import { UntitledLogoMinimal } from '@/components/foundations/logo/untitledui-logo-minimal';
import { MainLayout } from '@/components/layout/main-layout';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'attendee'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.fullName || !formData.email || !formData.password) {
        throw new Error('Please fill in all required fields');
      }
      
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const supabase = createClient();

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role
          }
        }
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        // Create profile using the database function
        const { error: profileError } = await supabase
          .rpc('create_user_profile', {
            user_id: data.user.id,
            user_email: formData.email,
            user_full_name: formData.fullName,
            user_role: formData.role
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          console.error('Profile error details:', JSON.stringify(profileError, null, 2));
          console.error('Profile error type:', typeof profileError);
          console.error('Profile error keys:', Object.keys(profileError || {}));
          
          const errorMessage = profileError?.message || profileError?.error_description || profileError?.details || JSON.stringify(profileError) || 'Unknown database error';
          setError(`Profile creation failed: ${errorMessage}`);
          return;
        }

        // Redirect with success message
        router.push('/auth/signin?message=Account created successfully. Please check your email to verify your account.');
      }

    } catch (error: any) {
      setError(error.message);
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
            Create Your Account
          </h2>
          <p className="mt-2 text-gray-600">
            Join us to discover amazing events
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-gray-200">
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <Input
                label="Full Name"
                type="text"
                value={formData.fullName}
                onChange={(value) => handleInputChange('fullName', value)}
                isRequired
                placeholder="Enter your full name"
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <Select 
                selectedKey={formData.role} 
                onSelectionChange={(value) => handleInputChange('role', value as string)}
                items={[
                  { id: 'attendee', label: 'Attendee - Book and attend events' },
                  { id: 'organizer', label: 'Organizer - Create and manage events' }
                ]}
              >
                {(item) => (
                  <Select.Item key={item.id} id={item.id} value={item.id}>
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
                hint="Must be at least 6 characters"
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
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
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
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
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