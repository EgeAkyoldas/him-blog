import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { loadAIPrompts, interpolate } from "@/lib/ai-prompts";

const BUCKET = "articles";

/** Ensure storage bucket exists — create if missing */
async function ensureBucket() {
  const supabase = createAdminClient();
  const { data } = await supabase.storage.getBucket(BUCKET);
  if (!data) {
    console.log(`[AI Image] Creating storage bucket: ${BUCKET}`);
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"],
    });
    if (error) {
      console.error(`[AI Image] Failed to create bucket:`, error.message);
    }
  }
}

/**
 * POST /api/v1/admin/ai-image — Generate an image using Gemini Image Model.
 * Image prompt template is loaded from src/config/ai-prompts.yaml.
 */
export async function POST(request: NextRequest) {
  try {
    await ensureBucket();
    const { prompt, articleSlug, aspectRatio, articleTitle, articleContext } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.0-flash-exp";

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    // Map aspect ratio to explicit dimension and composition instruction
    const dimensionMap: Record<string, string> = {
      "1:1": "SQUARE format (1:1 aspect ratio). Compose with perfectly centered balanced framing. Fill the entire canvas edge-to-edge with visual content, absolutely no padding or bars",
      "4:3": "LANDSCAPE format (4:3 aspect ratio). Compose with wide horizontal framing. Fill the entire canvas edge-to-edge with visual content, absolutely no padding or bars",
      "9:16": "TALL PORTRAIT format (9:16 aspect ratio). Compose with very tall vertical framing. Fill the entire canvas edge-to-edge with visual content, absolutely no padding or bars",
      "16:9": "WIDE LANDSCAPE format (16:9 aspect ratio). Compose with cinematic wide horizontal framing. Fill the entire canvas edge-to-edge with visual content, absolutely no padding or bars",
      landscape: "WIDE LANDSCAPE format (16:9 aspect ratio). Compose with cinematic wide horizontal framing. Fill the entire canvas edge-to-edge with visual content, absolutely no padding or bars",
      portrait: "TALL PORTRAIT format (9:16 aspect ratio). Compose with very tall vertical framing. Fill the entire canvas edge-to-edge with visual content, absolutely no padding or bars",
      square: "SQUARE format (1:1 aspect ratio). Compose with perfectly centered balanced framing. Fill the entire canvas edge-to-edge with visual content, absolutely no padding or bars",
    };
    const dimensionHint = dimensionMap[aspectRatio] || dimensionMap.landscape;

    // Load image prompt from YAML
    const config = loadAIPrompts();
    const imagePrompt = interpolate(config.image_prompt, {
      dimension: dimensionHint,
      prompt,
      article_title: articleTitle || "Music Education Article",
      article_context: articleContext || "Music education, practice, and learning",
    });

    // Map named aspect ratios to API-compatible values (from Bananator working_ratios.ts)
    const apiRatioMap: Record<string, string> = {
      landscape: "16:9",
      portrait: "9:16",
      square: "1:1",
    };
    const apiAspectRatio = apiRatioMap[aspectRatio] || aspectRatio || "16:9";

    // Build generationConfig with native imageConfig.aspectRatio
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const generationConfig: Record<string, any> = {
      responseModalities: ["TEXT", "IMAGE"],
    };

    // Add imageConfig with native aspect ratio support (Gemini API parameter)
    if (apiAspectRatio && apiAspectRatio !== "auto") {
      generationConfig.imageConfig = {
        aspectRatio: apiAspectRatio,
      };
      console.log(`[AI Image] Native imageConfig.aspectRatio = ${apiAspectRatio}`);
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: imagePrompt }] }],
          generationConfig,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini image error:", err);
      return NextResponse.json({ error: "Image generation failed" }, { status: 502 });
    }

    const data = await res.json();

    // Extract image from response
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(
      (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData
    );

    if (!imagePart?.inlineData) {
      return NextResponse.json({ error: "No image generated" }, { status: 502 });
    }

    const { mimeType, data: base64Data } = imagePart.inlineData;

    if (!base64Data) {
      console.error("AI image: base64Data is empty");
      return NextResponse.json({ error: "Generated image has no data" }, { status: 502 });
    }

    // Upload to Supabase Storage
    const supabase = createAdminClient();
    const ext = mimeType.includes("png") ? "png" : "jpg";
    const sanitizedSlug = (articleSlug || "untitled").replace(/[^a-z0-9-]/gi, "-").slice(0, 40);
    const filename = `ai-gen/${sanitizedSlug}-${Date.now()}.${ext}`;

    const buffer = Buffer.from(base64Data, "base64");
    console.log(`[AI Image] Uploading: bucket=articles, path=${filename}, size=${buffer.length} bytes, mime=${mimeType}`);

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadErr) {
      console.error("Upload error:", uploadErr.message, uploadErr);

      // Fallback: try without subfolder
      const fallbackName = `${sanitizedSlug}-${Date.now()}.${ext}`;
      console.log(`[AI Image] Retrying with fallback path: ${fallbackName}`);

      const { error: fallbackErr } = await supabase.storage
        .from(BUCKET)
        .upload(fallbackName, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (fallbackErr) {
        console.error("Fallback upload also failed:", fallbackErr.message, fallbackErr);
        return NextResponse.json(
          { error: `Upload failed: ${uploadErr.message}. Fallback: ${fallbackErr.message}` },
          { status: 500 }
        );
      }

      // Fallback succeeded
      const { data: fbUrl } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fallbackName);

      return NextResponse.json({ url: fbUrl.publicUrl });
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filename);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error("AI image error:", error);
    return NextResponse.json({ error: `Internal Server Error: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
  }
}
