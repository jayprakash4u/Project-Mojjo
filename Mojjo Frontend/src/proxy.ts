import { NextResponse, type NextRequest } from "next/server";
import { categories } from "@/data/mock/categories";
import { products } from "@/data/mock/products";

/**
 * Returns a real HTTP 404 for unknown catalogue URLs.
 *
 * `notFound()` inside a page renders the right UI, but once a route has begun
 * streaming the status is already committed as 200 — Next documents this and
 * points at proxy for the check that has to run before the response starts.
 * Without it, every mistyped product URL is a soft 404 that search engines
 * will happily index.
 */

const productSlugs = new Set(products.map((product) => product.slug));

const categorySlugs = new Map(
  categories.map((category) => [
    category.slug,
    new Set((category.subcategories ?? []).map((sub) => sub.slug)),
  ]),
);

function isKnownPath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "products" && segments.length === 2) {
    return productSlugs.has(segments[1]);
  }

  if (segments[0] === "categories") {
    const subcategories = categorySlugs.get(segments[1] ?? "");
    if (!subcategories) return false;
    if (segments.length === 2) return true;
    if (segments.length === 3) return subcategories.has(segments[2]);
    return false;
  }

  return true;
}

export function proxy(request: NextRequest) {
  if (isKnownPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Rewrite to the same URL so the page still renders and `notFound()` still
  // produces the styled UI — the rewrite is only here to carry the status.
  return NextResponse.rewrite(request.nextUrl, { status: 404 });
}

export const config = {
  matcher: ["/products/:path*", "/categories/:path*"],
};
