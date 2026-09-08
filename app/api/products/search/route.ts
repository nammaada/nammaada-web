import { NextResponse, type NextRequest } from "next/server";
import { searchStorefrontProducts } from "@/lib/storefront/products";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") || "";
    if (!q.trim()) {
      return NextResponse.json({ products: [] });
    }
    const products = await searchStorefrontProducts(q);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("[Search API Error]:", error);
    return NextResponse.json({ products: [], error: "Search failed" }, { status: 500 });
  }
}
