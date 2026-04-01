import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server client with service role — bypasses RLS
// Only use in server components and API routes
export function createServerClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}
