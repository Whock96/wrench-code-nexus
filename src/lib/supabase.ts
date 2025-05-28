
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qvjoldaphzuvlxbrptiq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2am9sZGFwaHp1dmx4YnJwdGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjA0NTUsImV4cCI6MjA2MzU5NjQ1NX0.0aGoKVdOqBZsc4i_oaG61kPwj9lOzlIf_P642yehXKo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
  },
});
