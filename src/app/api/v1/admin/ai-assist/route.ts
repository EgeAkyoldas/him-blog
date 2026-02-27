import { NextRequest, NextResponse } from "next/server";
import { loadAIPrompts, interpolate } from "@/lib/ai-prompts";

/**
 * POST /api/v1/admin/ai-assist — AI text generation using Google Gemini.
 * Prompts are loaded from src/config/ai-prompts.yaml.
 */

interface AIRequest {
  action: "improve" | "expand" | "summarize" | "translate" | "generate" | "custom" | "bilingual" | "seo-optimize" | "auto_blog";
  content?: string;
  title?: string;
  language?: string;
  prompt?: string;
  seoIssues?: string;
  existingArticles?: string;
}

function buildPrompt(data: AIRequest): string {
  const config = loadAIPrompts();
  const lang = data.language === "en" ? "en" : "tr";
  const langName = lang === "en" ? "English" : "Türkçe";
  const targetLang = lang === "tr" ? "English" : "Türkçe";

  const vars: Record<string, string> = {
    language: langName,
    target_language: targetLang,
    content: data.content ?? "(boş)",
    title: data.title ?? "",
    prompt: data.prompt ?? "",
    seo_issues: data.seoIssues ?? "",
    dimension: "",
    existing_articles: data.existingArticles
      ? `Mevcut blog makaleleri:\n${data.existingArticles}\nBu makalelerden alakalı olanları metin içinde doğal şekilde <a href="/blog/SLUG">başlık</a> formatıyla linkle. Zorla linkleme, sadece konuyla gerçekten ilgili olanları kullan.`
      : "Henüz mevcut makale yok, iç link ekleme.",
  };

  const actionKey = data.action === "seo-optimize" ? "seo_optimize" : data.action;
  const template = config.actions[actionKey];

  if (template) {
    return interpolate(template, vars);
  }

  return data.prompt || "";
}

export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const config = loadAIPrompts();
    const systemInstruction = config.system_instruction;
    const prompt = buildPrompt(body);

    // Enable Google Search grounding for auto_blog to get real sources
    const isAutoBlog = body.action === "auto_blog";

    // Build request body
    const geminiBody: Record<string, unknown> = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 8192 },
    };

    // Add google search tool for auto_blog
    if (isAutoBlog) {
      geminiBody.tools = [{ googleSearch: {} }];
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini API error:", err);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Extract grounding metadata if available (for auto_blog w/ search)
    const groundingMeta = data.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMeta?.groundingChunks?.map(
      (chunk: { web?: { uri?: string; title?: string } }) => ({
        url: chunk.web?.uri ?? "",
        title: chunk.web?.title ?? "",
      })
    )?.filter((c: { url: string }) => c.url) ?? [];

    return NextResponse.json({
      result: text,
      ...(groundingChunks.length > 0 && { groundingChunks }),
    });
  } catch (error) {
    console.error("AI assist error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
