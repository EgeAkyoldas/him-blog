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

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 8192 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini API error:", err);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("AI assist error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
