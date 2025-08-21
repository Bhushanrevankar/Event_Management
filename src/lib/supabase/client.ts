import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Add fallbacks for build time when env vars might not be available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not found, using placeholders')
  }
  
  return createBrowserClient(supabaseUrl, supabaseKey)
}

// Export a default client instance for convenience
export const supabase = createClient()