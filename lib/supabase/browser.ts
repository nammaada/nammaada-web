import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";

export function createSupabaseBrowserClient(): SupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase browser configuration is not available.");
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
