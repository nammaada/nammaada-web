"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminUser, setAdminSession } from "@/lib/auth/admin";

/**
 * Returns true if the currently authenticated session belongs to an admin user.
 * Used by the storefront CustomerAuthProvider to hide admin sessions from the storefront UI,
 * and sets the persistent admin session cookie when verified.
 */
export async function checkIsAdminSessionAction(explicitUserId?: string): Promise<boolean> {
  try {
    let userId = explicitUserId;
    if (!userId) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        userId = data.user.id;
      }
    }

    if (!userId) return false;

    const isAdmin = await isAdminUser(userId);
    if (isAdmin) {
      await setAdminSession(userId);
    }
    return isAdmin;
  } catch {
    return false;
  }
}
