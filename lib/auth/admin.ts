import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Cache admin validation results in memory to avoid repeated DB roundtrips and timeouts on refresh
const adminCache = new Map<string, { isAdmin: boolean; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function isAdminUser(userId: string): Promise<boolean> {
  if (!userId) return false;

  const cached = adminCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.isAdmin;
  }

  try {
    const adminClient = createSupabaseAdminClient();
    const { data, error } = await adminClient
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    const isAdmin = !error && data?.user_id === userId;
    adminCache.set(userId, { isAdmin, timestamp: Date.now() });
    return isAdmin;
  } catch (err) {
    console.error("isAdminUser query error:", err);
    return false;
  }
}

export async function setAdminSession(userId: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set("namma_admin_session", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch {}
}

export async function clearAdminSession() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("namma_admin_session", "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    cookieStore.delete("namma_admin_session");
  } catch {}
}

export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (!error && data?.user) return data.user;

  try {
    const cookieStore = await cookies();
    const adminSessionUserId = cookieStore.get("namma_admin_session")?.value;
    if (adminSessionUserId && (await isAdminUser(adminSessionUserId))) {
      const adminClient = createSupabaseAdminClient();
      const { data: adminUserData } = await adminClient.auth.admin.getUserById(adminSessionUserId);
      return adminUserData?.user || null;
    }
  } catch {}

  return null;
}

export async function requireAdmin(): Promise<User> {
  // 1. Check if an admin session cookie is active
  try {
    const cookieStore = await cookies();
    const adminSessionUserId = cookieStore.get("namma_admin_session")?.value;
    if (adminSessionUserId && (await isAdminUser(adminSessionUserId))) {
      const adminClient = createSupabaseAdminClient();
      const { data: adminUserData } = await adminClient.auth.admin.getUserById(adminSessionUserId);
      if (adminUserData?.user) {
        return adminUserData.user;
      }
    }
  } catch {}

  // 2. Check standard Supabase server session
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth/login?next=/admin");
  }

  const isAdmin = await isAdminUser(data.user.id);
  if (!isAdmin) {
    redirect("/auth/login?next=/admin&error=not_admin");
  }

  // Persist admin session cookie so future refreshes are permanently preserved
  await setAdminSession(data.user.id);
  return data.user;
}
