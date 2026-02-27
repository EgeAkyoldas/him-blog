import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase";

/**
 * GET /api/v1/articles/[slug] — Public single article detail.
 * Query params: ?locale=tr (default: tr)
 *
 * This is the endpoint your CONSUMER website will call for article detail pages.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const locale = request.nextUrl.searchParams.get("locale") || "tr";
    const supabase = createPublicClient();

    // Get article by slug
    const { data: article, error: artErr } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .single();

    if (artErr || !article) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get translation for locale
    const { data: translation } = await supabase
      .from("article_translations")
      .select("*")
      .eq("article_id", article.id)
      .eq("language", locale)
      .eq("status", "published")
      .single();

    if (!translation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      article: {
        id: article.id,
        slug: article.slug,
        category: article.category,
        created_at: article.created_at,
        title: translation.title,
        content: translation.content,
        language: translation.language,
        meta_description: translation.meta_description ?? null,
        thumbnail: translation.thumbnail ?? null,
      },
    });
  } catch (error) {
    console.error("Article detail error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
