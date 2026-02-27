import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client — uses service role key (bypasses RLS).
 * Use only in server-side API routes.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Public Supabase client — uses anon key (respects RLS).
 * Use for public-facing data access.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
