"use client";

import { useState, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import type { AIAction, ImageAspectRatio } from "@/types";

export function useAIAssistant(editor: Editor | null) {
  const [aiOpen, setAiOpen] = useState(false);

  // Text AI
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [bilingualResult, setBilingualResult] = useState<{ tr: string; en: string } | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");

  // Image AI
  const [aiImageLoading, setAiImageLoading] = useState(false);
  const [imagePromptText, setImagePromptText] = useState("");
  const [showImagePrompt, setShowImagePrompt] = useState<"toolbar" | "panel" | null>(null);
  const [aiImageSize, setAiImageSize] = useState<ImageAspectRatio>("landscape");

  // Generated image gallery
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  // SEO Meta
  const [seoMeta, setSeoMeta] = useState<string | null>(null);
  const [seoLoading, setSeoLoading] = useState(false);

  const callAI = useCallback(
    async (action: AIAction, title: string, language: "tr" | "en") => {
      if (!editor) return;
      setAiLoading(true);
      setAiResult(null);
      setBilingualResult(null);
      try {
        const res = await fetch("/api/v1/admin/ai-assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action, content: editor.getHTML(), title, language,
            prompt: action === "custom" ? customPrompt : undefined,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (action === "bilingual") {
            try {
              const clean = data.result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
              setBilingualResult(JSON.parse(clean));
            } catch { setAiResult(data.result); }
          } else {
            setAiResult(data.result);
          }
        } else {
          setAiResult("⚠️ AI yanıt veremedi. Lütfen tekrar deneyin.");
        }
      } catch { setAiResult("⚠️ Bağlantı hatası."); }
      finally { setAiLoading(false); }
    },
    [editor, customPrompt]
  );

  const applyAIResult = useCallback((content?: string) => {
    if (!editor) return;
    const html = content || aiResult;
    if (html) editor.commands.setContent(html);
    setAiResult(null);
    setBilingualResult(null);
  }, [editor, aiResult]);

  const generateAIImage = useCallback(async (
    title: string, slug: string, onSuccess: (url: string) => void
  ) => {
    setAiImageLoading(true);
    try {
      const res = await fetch("/api/v1/admin/ai-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePromptText || title || "Professional blog image",
          articleSlug: slug || "untitled",
          aspectRatio: aiImageSize,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setGeneratedImages((prev) => [data.url, ...prev]);
          onSuccess(data.url);
        }
      }
    } catch { /* ignore */ }
    finally { setAiImageLoading(false); }
  }, [imagePromptText, aiImageSize]);

  const insertImageIntoEditor = useCallback((url: string) => {
    if (!editor) return;
    try {
      // Try resizable image first
      editor.chain().focus().setResizableImage({ src: url }).run();
    } catch {
      // Fallback: insert as standard image via HTML
      editor.chain().focus().insertContent(`<img src="${url}" alt="" />`).run();
    }
  }, [editor]);

  const insertAIImage = useCallback(async (prompt: string, slug: string) => {
    if (!editor) return;
    setAiImageLoading(true);
    try {
      const res = await fetch("/api/v1/admin/ai-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt || "Professional blog illustration",
          articleSlug: slug || "untitled",
          aspectRatio: aiImageSize,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setGeneratedImages((prev) => [data.url, ...prev]);
          try {
            editor.chain().focus().setResizableImage({ src: data.url }).run();
          } catch {
            editor.chain().focus().insertContent(`<img src="${data.url}" alt="" />`).run();
          }
        }
      }
    } catch (err) {
      console.error("AI image insertion error:", err);
    }
    finally { setAiImageLoading(false); }
  }, [editor, aiImageSize]);

  const generateSEOMeta = useCallback(async (title: string) => {
    if (!editor) return;
    setSeoLoading(true);
    setSeoMeta(null);
    try {
      const res = await fetch("/api/v1/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "custom",
          content: editor.getHTML(),
          title,
          language: "tr",
          prompt: "Bu makale için Google SEO açıklaması yaz. Maksimum 155 karakter, sade ve tıklanabilir. Sadece açıklamayı döndür, başka bir şey yazma.",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const clean = (data.result as string).replace(/<[^>]*>/g, "").trim().slice(0, 160);
        setSeoMeta(clean);
      }
    } catch { setSeoMeta("⚠️ Meta açıklama üretilemedi."); }
    finally { setSeoLoading(false); }
  }, [editor]);

  const handleSEOOptimize = useCallback(async (
    issues: string,
    title: string,
    language: "tr" | "en"
  ) => {
    if (!editor) return;
    setAiLoading(true);
    setAiResult(null);
    setAiOpen(true);
    try {
      const res = await fetch("/api/v1/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "seo-optimize",
          content: editor.getHTML(),
          title,
          language,
          seoIssues: issues,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResult(data.result);
      } else {
        setAiResult("⚠️ SEO optimize isteği başarısız oldu.");
      }
    } catch {
      setAiResult("⚠️ Bağlantı hatası.");
    } finally {
      setAiLoading(false);
    }
  }, [editor]);

  // ── Auto Blog ──────────────────────────────────────────────────────
  const [autoBlogLoading, setAutoBlogLoading] = useState(false);
  const [autoBlogProgress, setAutoBlogProgress] = useState("");
  const [autoBlogIncludeImages, setAutoBlogIncludeImages] = useState(true);

  // Fallback category detection from topic keywords
  const detectCategory = (topic: string): string => {
    const t = topic.toLowerCase();
    if (/teori|armoni|akor|gamm|tonalite|nota/i.test(t)) return "theory";
    if (/piyano|gitar|keman|flüt|bateri|saz|çello|enstrüman|instrument/i.test(t)) return "instrument";
    if (/kulak|ear|interval|sol[fè]|dikte/i.test(t)) return "ear_training";
    if (/deşifre|sight|reading|okuma/i.test(t)) return "sight_reading";
    if (/sahne|performans|konser|resital|stage/i.test(t)) return "performance";
    if (/sınav|abrsm|trinity|hazırlık|exam/i.test(t)) return "exam_prep";
    return "other";
  };

  // Build <img> with CSS layout based on aspect ratio
  const buildImageHtml = (url: string, alt: string, size: string, index: number): string => {
    if (size === "landscape") {
      // Full-width block image
      return `<img src="${url}" alt="${alt}" style="width:100%;border-radius:8px;margin:1.5rem 0;display:block" />`;
    }
    // Float images for square/portrait — alternate left/right
    const side = index % 2 === 0 ? "left" : "right";
    const width = size === "portrait" ? "35%" : "45%";
    const marginSide = side === "left" ? "margin:0.5rem 1.5rem 0.5rem 0" : "margin:0.5rem 0 0.5rem 1.5rem";
    return `<img src="${url}" alt="${alt}" style="float:${side};width:${width};${marginSide};border-radius:8px" />`;
  };

  const generateAutoBlog = useCallback(async (
    topic: string,
    slug: string,
    language: "tr" | "en",
    onCoverImage?: (url: string) => void,
    onSetTitle?: (title: string) => void,
    onSetCategory?: (cat: string) => void,
  ) => {
    if (!editor || !topic.trim()) return;
    setAutoBlogLoading(true);
    setAutoBlogProgress("Makale metni oluşturuluyor...");
    setAiOpen(true);

    try {
      // 1. Generate text via AI
      const textRes = await fetch("/api/v1/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auto_blog",
          title: topic,
          language,
        }),
      });

      if (!textRes.ok) {
        const errText = await textRes.text().catch(() => "unknown");
        console.error("[Auto Blog] Text gen failed:", textRes.status, errText);
        setAutoBlogProgress("⚠️ Metin oluşturulamadı.");
        setAutoBlogLoading(false);
        return;
      }

      const textData = await textRes.json();
      let html: string = textData.result || "";

      // 2. Extract [CATEGORY: value] from AI output
      const catMatch = html.match(/\[CATEGORY:\s*([^\]]+)\]/i);
      if (catMatch) {
        const aiCategory = catMatch[1].trim().toLowerCase().replace(/\s+/g, "_");
        if (onSetCategory) {
          onSetCategory(aiCategory);
          console.log(`[Auto Blog] AI-detected category: ${aiCategory}`);
        }
        // Remove the tag from HTML
        html = html.replace(/\[CATEGORY:\s*[^\]]+\]/gi, "");
      } else {
        // Keyword fallback
        if (onSetCategory) onSetCategory(detectCategory(topic));
      }

      // 3. Extract title from first H1/H2 or use topic
      const titleMatch = html.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
      const articleTitle = titleMatch
        ? titleMatch[1].replace(/<[^>]*>/g, "").trim()
        : topic.trim();

      if (onSetTitle) {
        setAutoBlogProgress("Başlık ve slug ayarlanıyor...");
        onSetTitle(articleTitle);
      }

      // 4. Find image placeholders — new format: [IMAGE: desc | SIZE: landscape]
      const placeholderRegex = /\[IMAGE:\s*([^\]|]+?)(?:\s*\|\s*SIZE:\s*(landscape|square|portrait))?\s*\]/gi;
      const placeholders: { full: string; desc: string; size: string }[] = [];
      const defaultSizes = ["landscape", "square", "portrait", "landscape"];
      let match;
      while ((match = placeholderRegex.exec(html)) !== null) {
        const size = match[2]?.toLowerCase() || defaultSizes[placeholders.length % defaultSizes.length];
        placeholders.push({ full: match[0], desc: match[1].trim(), size });
      }

      console.log(`[Auto Blog] Found ${placeholders.length} image placeholders:`,
        placeholders.map(p => `${p.size}: ${p.desc.slice(0, 40)}`));

      // 5. Generate images if enabled
      if (autoBlogIncludeImages && placeholders.length > 0) {
        let firstImageUrl: string | null = null;

        for (let i = 0; i < placeholders.length; i++) {
          setAutoBlogProgress(
            `Görsel üretiliyor (${i + 1}/${placeholders.length}) [${placeholders[i].size}]...`
          );

          try {
            console.log(`[Auto Blog] Image ${i + 1} [${placeholders[i].size}]: "${placeholders[i].desc.slice(0, 60)}..."`);

            const imgRes = await fetch("/api/v1/admin/ai-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: placeholders[i].desc,
                articleSlug: slug || "untitled",
                aspectRatio: placeholders[i].size,
              }),
            });

            if (imgRes.ok) {
              const imgData = await imgRes.json();
              if (imgData.url) {
                console.log(`[Auto Blog] Image ${i + 1} OK`);
                setGeneratedImages((prev) => [imgData.url, ...prev]);
                const imgTag = buildImageHtml(imgData.url, placeholders[i].desc, placeholders[i].size, i);
                html = html.replace(placeholders[i].full, imgTag);
                if (!firstImageUrl) firstImageUrl = imgData.url;
              } else {
                console.warn(`[Auto Blog] Image ${i + 1}: no URL in response`);
                html = html.replace(placeholders[i].full, "");
              }
            } else {
              const errText = await imgRes.text().catch(() => "unknown");
              console.error(`[Auto Blog] Image ${i + 1} failed: ${imgRes.status}`, errText);
              html = html.replace(placeholders[i].full, "");
            }
          } catch (err) {
            console.error(`[Auto Blog] Image ${i + 1} exception:`, err);
            html = html.replace(placeholders[i].full, "");
          }
        }

        // Set first image as cover
        if (firstImageUrl && onCoverImage) {
          setAutoBlogProgress("Kapak görseli ayarlanıyor...");
          onCoverImage(firstImageUrl);
        }
      } else {
        // Remove all placeholders when images are disabled
        html = html.replace(/\[IMAGE:[^\]]*\]/gi, "");
      }

      // 6. Add clearfix after floated images to prevent layout issues
      html = html.replace(/<\/article>|$/, '<div style="clear:both"></div>');

      // 7. Apply to editor
      setAutoBlogProgress("Editöre uygulanıyor...");
      editor.commands.setContent(html);

      // 8. Auto-generate SEO meta description
      setAutoBlogProgress("SEO meta açıklaması üretiliyor...");
      try {
        const metaRes = await fetch("/api/v1/admin/ai-assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "custom",
            content: html,
            title: articleTitle,
            language,
            prompt: "Bu makale için Google SEO meta açıklaması yaz. Maksimum 155 karakter, sade, tıklanabilir ve konuyu özetleyen. Sadece açıklamayı döndür, başka bir şey yazma.",
          }),
        });
        if (metaRes.ok) {
          const metaData = await metaRes.json();
          const cleanMeta = (metaData.result as string).replace(/<[^>]*>/g, "").trim().slice(0, 160);
          setSeoMeta(cleanMeta);
          console.log(`[Auto Blog] SEO meta generated: "${cleanMeta}"`);
        }
      } catch (metaErr) {
        console.warn("[Auto Blog] SEO meta generation failed:", metaErr);
      }

      setAutoBlogProgress("");
    } catch (err) {
      console.error("[Auto Blog] Fatal error:", err);
      setAutoBlogProgress("⚠️ Auto Blog başarısız oldu.");
    } finally {
      setAutoBlogLoading(false);
    }
  }, [editor, autoBlogIncludeImages]);

  return {
    aiOpen, setAiOpen,
    aiLoading, aiResult, setAiResult, bilingualResult, customPrompt, setCustomPrompt,
    callAI, applyAIResult,
    aiImageLoading, imagePromptText, setImagePromptText,
    showImagePrompt, setShowImagePrompt,
    aiImageSize, setAiImageSize,
    generatedImages, setGeneratedImages,
    generateAIImage, insertAIImage, insertImageIntoEditor,
    seoMeta, setSeoMeta, seoLoading, generateSEOMeta,
    handleSEOOptimize,
    // Auto Blog
    autoBlogLoading, autoBlogProgress, autoBlogIncludeImages,
    setAutoBlogIncludeImages, generateAutoBlog,
  };
}
