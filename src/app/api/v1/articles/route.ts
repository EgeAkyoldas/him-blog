import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase";

/**
 * GET /api/v1/articles — Public list of published articles.
 * Query params: ?locale=tr (default: tr)
 *
 * This is the endpoint your CONSUMER website will call to fetch articles.
 */
export async function GET(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get("locale") || "tr";
    const supabase = createPublicClient();

    const { data: translations, error } = await supabase
      .from("article_translations")
      .select(`
        title,
        status,
        article_id,
        articles!inner (
          id,
          slug,
          category,
          created_at
        )
      `)
      .eq("language", locale)
      .eq("status", "published")
      .order("article_id", { ascending: false });

    if (error) throw error;

    const articles = (translations ?? []).map((t) => {
      const article = t.articles as unknown as {
        id: string;
        slug: string;
        category: string;
        created_at: string;
      };
      return {
        id: article.id,
        slug: article.slug,
        category: article.category,
        created_at: article.created_at,
        title: t.title,
        status: t.status,
      };
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Public articles error:", error);
    return NextResponse.json({ articles: [] });
  }
}
