import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { count, error } = await supabase
      .from("storefront_products")
      .select("id", { count: "exact", head: true });

    if (error) {
      return Response.json(
        { ok: false, message: "Supabase connectivity check failed." },
        { status: 503 },
      );
    }

    return Response.json({
      ok: true,
      resource: "storefront_products",
      count: count ?? 0,
    });
  } catch {
    return Response.json(
      { ok: false, message: "Supabase configuration is unavailable." },
      { status: 503 },
    );
  }
}
