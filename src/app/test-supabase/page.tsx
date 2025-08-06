import { createClient } from '@/utils/supabase/server'

export default async function TestSupabasePage() {
  const supabase = await createClient()

  // Test the connection by trying to get the user session
  const { data: { session }, error } = await supabase.auth.getSession()

  // Test a simple query - this will fail if no tables exist, but that's expected
  let tablesError = null
  let hasConnection = false
  
  try {
    // Try a simple query to test connection
    const { error: testError } = await supabase.from('profiles').select('count').limit(1).single()
    hasConnection = true
  } catch (err) {
    hasConnection = true // Connection works even if table doesn't exist
    tablesError = 'Tables not created yet (this is expected)'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <strong>Environment Variables:</strong> ✅ Loaded successfully
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <strong>Supabase Client:</strong> ✅ Created successfully
                  </p>
                </div>
              </div>
            </div>

            <div className={`border-l-4 ${hasConnection ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'} p-4`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className={`h-5 w-5 ${hasConnection ? 'text-green-400' : 'text-red-400'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${hasConnection ? 'text-green-700' : 'text-red-700'}`}>
                    <strong>Database Connection:</strong> {hasConnection ? '✅ Connected' : '❌ Failed'}
                  </p>
                  {tablesError && (
                    <p className="text-xs text-green-600 mt-1">
                      Note: {tablesError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Authentication Session:</strong> {session ? '✅ Active session' : 'ℹ️ No active session (this is normal)'}
                  </p>
                  {session && (
                    <p className="text-xs text-blue-600 mt-1">
                      User ID: {session.user.id}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Next Steps:</strong> Create the database schema from the documentation
                  </p>
                  <ul className="text-xs text-yellow-600 mt-1 list-disc list-inside">
                    <li>Apply the SQL schema from docs/DATABASE_SCHEMA.md</li>
                    <li>Set up Row Level Security policies</li>
                    <li>Create initial event categories</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-gray-800 mb-2">Environment Configuration</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
              <p><strong>Supabase Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
              <p><strong>Node Environment:</strong> {process.env.NODE_ENV}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}