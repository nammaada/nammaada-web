import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnv } from "@/lib/env";

export async function updateSupabaseSession(request: NextRequest) {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser validates the session with Supabase Auth and refreshes it when needed.
  const { data } = await supabase.auth.getUser();

  // This is only an early unauthenticated redirect. The admin allowlist check
  // remains authoritative in the server-side admin layout and database RLS.
  if (request.nextUrl.pathname.startsWith("/admin") && !data.user) {
    return NextResponse.redirect(new URL("/auth/login?next=/admin", request.url));
  }

  return response;
}
