import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

// Initialize Supabase Client
// Can connect to live Supabase project when credentials are supplied
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
