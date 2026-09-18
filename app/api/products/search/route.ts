import { NextResponse, type NextRequest } from "next/server";
import { searchStorefrontProducts } from "@/lib/storefront/products";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") || "";
    if (!q.trim()) {
      return NextResponse.json({ products: [] });
    }
    const products = await searchStorefrontProducts(q);
    return NextResponse.json({ products });
  } catch (error) {
    // Re-throw Next.js internal prerender bail-out signal so it is not
    // mistaken for a real runtime error and logged as [Search API Error].
    if (
      error instanceof Error &&
      (error as { digest?: string }).digest === "NEXT_PRERENDER_INTERRUPTED"
    ) {
      throw error;
    }
    console.error("[Search API Error]:", error);
    return NextResponse.json({ products: [], error: "Search failed" }, { status: 500 });
  }
}
