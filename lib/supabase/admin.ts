import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env/server";
import { getPublicEnv } from "@/lib/env";

export function createSupabaseAdminClient(): SupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  let serviceRoleKey: string | undefined;

  try {
    serviceRoleKey = getServerEnv().supabaseServiceRoleKey;
  } catch {
    // If SUPABASE_SERVICE_ROLE_KEY is missing, gracefully fall back to anon key
  }

  return createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
