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

  // Persona
  const [selectedPersona, setSelectedPersona] = useState("philosopher_editor");

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
            persona: selectedPersona,
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
    [editor, customPrompt, selectedPersona]
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
          articleTitle: title || "Music Education",
          articleContext: `Article about: ${title}. Generate a cover image that captures the essence of this topic.`,
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
          articleTitle: prompt,
          articleContext: `Content image for an article about: ${prompt}`,
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

  // ── XML Hybrid Parser (V3) ──────────────────────────────────────────
  // Tries XML tag first, falls back to old regex for backward compatibility
  const extractXMLTag = (html: string, tag: string): string => {
    const xmlMatch = html.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
    return xmlMatch ? xmlMatch[1].trim() : '';
  };

  // Strip all XML wrapper tags from content, leaving only inner HTML
  const stripXMLWrappers = (html: string): string => {
    let result = html;
    // Remove <meta_data>...</meta_data> block entirely
    result = result.replace(/<meta_data>[\s\S]*?<\/meta_data>/gi, '');
    // Remove <ref_links>...</ref_links> block entirely  
    result = result.replace(/<ref_links>[\s\S]*?<\/ref_links>/gi, '');
    // Extract content from <article_body> if present
    const bodyMatch = result.match(/<article_body>([\s\S]*?)<\/article_body>/i);
    if (bodyMatch) result = bodyMatch[1].trim();
    return result;
  };

  // ── Auto Blog ──────────────────────────────────────────────────────
  const [autoBlogLoading, setAutoBlogLoading] = useState(false);
  const [autoBlogProgress, setAutoBlogProgress] = useState("");
  const [autoBlogIncludeImages, setAutoBlogIncludeImages] = useState(true);
  const [autoTags, setAutoTags] = useState<string[]>([]);

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
    onSetSlug?: (slug: string) => void,
    onSetMetaDescription?: (text: string) => void,
  ) => {
    if (!editor || !topic.trim()) return;
    setAutoBlogLoading(true);
    setAutoBlogProgress("Kaynak araştırılıyor ve makale oluşturuluyor...");
    setAiOpen(true);
    setAutoTags([]);

    try {
      // 1. Generate text via AI (with Google Search grounding)
      const textRes = await fetch("/api/v1/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auto_blog",
          title: topic,
          language,
          persona: selectedPersona,
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
      const groundingChunks: { url: string; title: string }[] = textData.groundingChunks || [];

      // 2. Extract metadata from XML tags (V3) with regex fallback (V2)
      const xmlCategory = extractXMLTag(html, 'category');
      const xmlSlug = extractXMLTag(html, 'slug');
      const xmlMeta = extractXMLTag(html, 'meta_description');
      const xmlKeywords = extractXMLTag(html, 'keywords');
      // ★ Extract ref_links BEFORE stripping XML wrappers (stripXMLWrappers removes them)
      const xmlRefLinks = extractXMLTag(html, 'ref_links');

      // Category: XML first, then old [CATEGORY:] regex, then keyword detection
      const catMatch = html.match(/\[CATEGORY:\s*([^\]]+)\]/i);
      const aiCategory = xmlCategory
        || (catMatch ? catMatch[1].trim().toLowerCase().replace(/\s+/g, "_") : "")
        || detectCategory(topic);
      if (onSetCategory) {
        onSetCategory(aiCategory);
        console.log(`[Auto Blog] Category: ${aiCategory} (source: ${xmlCategory ? 'XML' : catMatch ? 'regex' : 'detect'})`);
      }

      // Strip XML wrapper tags + old [CATEGORY:] from HTML, leaving clean article content
      html = stripXMLWrappers(html);
      html = html.replace(/\[CATEGORY:\s*[^\]]+\]/gi, "");

      // 3. Extract title from first H1/H2 or use topic
      const titleMatch = html.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
      const articleTitle = titleMatch
        ? titleMatch[1].replace(/<[^>]*>/g, "").trim()
        : topic.trim();

      if (onSetTitle) {
        setAutoBlogProgress("Başlık ayarlanıyor...");
        onSetTitle(articleTitle);
      }

      // 3b. Slug: XML first, then generate locally (no extra AI call!)
      if (onSetSlug) {
        if (xmlSlug && xmlSlug.length > 3) {
          const cleanSlug = xmlSlug.toLowerCase()
            .replace(/<[^>]*>/g, "").trim()
            .replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
          if (cleanSlug.length > 3) {
            onSetSlug(cleanSlug);
            console.log(`[Auto Blog] Slug from XML: ${cleanSlug}`);
          }
        } else {
          // Fallback: generate slug from title locally
          const fallbackSlug = articleTitle.toLowerCase()
            .replace(/[çÇ]/g, "c").replace(/[ğĞ]/g, "g").replace(/[ıİ]/g, "i")
            .replace(/[öÖ]/g, "o").replace(/[üÜ]/g, "u").replace(/[şŞ]/g, "s")
            .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
            .replace(/^-|-$/g, "").slice(0, 60);
          if (fallbackSlug.length > 3) onSetSlug(fallbackSlug);
        }
      }

      // 4. Parse sources from pre-extracted XML <ref_links> or old [SOURCES] block + merge with grounding chunks
      const sourcesMatch = html.match(/\[SOURCES\]([\s\S]*?)\[\/SOURCES\]/i);
      const sourceText = xmlRefLinks || (sourcesMatch ? sourcesMatch[1] : "");
      const parsedSources: { title: string; url: string }[] = [];

      if (sourceText) {
        const sourceLines = sourceText.trim().split("\n").filter(l => l.trim());
        for (const line of sourceLines) {
          const clean = line.replace(/^\d+\.\s*/, "").trim();
          // Try "Title | URL" format first
          const pipeMatch = clean.match(/^(.+?)\s*\|\s*(https?:\/\/\S+)/);
          if (pipeMatch) {
            parsedSources.push({ title: pipeMatch[1].trim(), url: pipeMatch[2].trim() });
            continue;
          }
          // Try to find URL anywhere in the line
          const urlMatch = clean.match(/(https?:\/\/\S+)/);
          if (urlMatch) {
            const title = clean.replace(urlMatch[0], "").replace(/[—–|\-]\s*$/g, "").trim() || urlMatch[0];
            parsedSources.push({ title, url: urlMatch[0] });
          }
          // Skip lines without URLs (we want only clickable sources)
        }
        html = html.replace(/\[SOURCES\][\s\S]*?\[\/SOURCES\]/i, "");
      }

      // Merge grounding chunks (deduplicate by URL)
      const seenUrls = new Set(parsedSources.map(s => s.url));
      for (const chunk of groundingChunks) {
        if (chunk.url && !seenUrls.has(chunk.url)) {
          parsedSources.push({ title: chunk.title || chunk.url, url: chunk.url });
          seenUrls.add(chunk.url);
        }
      }

      // 4b. Verify source URLs are alive (non-blocking)
      if (parsedSources.length > 0) {
        setAutoBlogProgress("Kaynak linkleri doğrulanıyor...");
        const verifiedSources: { title: string; url: string; alive: boolean }[] = [];
        
        for (const src of parsedSources) {
          try {
            const checkRes = await fetch(`/api/v1/admin/verify-url?url=${encodeURIComponent(src.url)}`, {
              signal: AbortSignal.timeout(5000),
            });
            const checkData = await checkRes.json();
            verifiedSources.push({ ...src, alive: checkData.alive ?? false });
          } catch {
            verifiedSources.push({ ...src, alive: false });
          }
        }

        const aliveCount = verifiedSources.filter(s => s.alive).length;
        console.log(`[Auto Blog] Source verification: ${aliveCount}/${verifiedSources.length} alive`);

        // Build styled references footer with verification status
        const sourceItems = verifiedSources.map(s => {
          if (s.alive) {
            return `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title}</a></li>`;
          }
          // Dead link — still show but with warning
          return `<li><span style="text-decoration:line-through;opacity:0.5">${s.title}</span> <span style="font-size:11px;color:var(--color-text-muted)">⚠️ link erişilemez</span></li>`;
        });

        const referencesFooter = `
          <footer class="article-references" style="margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid var(--color-border)">
            <h3 style="font-size:16px;font-weight:600;margin-bottom:0.75rem">📚 Kaynaklar</h3>
            <ol style="font-size:14px;line-height:1.8;padding-left:1.2rem;color:var(--color-secondary)">
              ${sourceItems.join("\n              ")}
            </ol>
          </footer>`;
        html += referencesFooter;
        console.log(`[Auto Blog] Sources added: ${aliveCount} alive, ${verifiedSources.length - aliveCount} dead`);
      }

      // 5. Find image placeholders — format: [IMAGE: desc | SIZE: landscape]
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

      // 6. Generate images if enabled
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
                articleTitle,
                articleContext: `This image is part of #{i + 1} in an article titled "${articleTitle}". The article covers: ${topic}. Maintain visual consistency with other images in this series.`,
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

      // 7. Add clearfix after floated images to prevent layout issues
      html = html.replace(/<\/article>|$/, '<div style="clear:both"></div>');

      // 8. Apply to editor
      setAutoBlogProgress("Editöre uygulanıyor...");
      editor.commands.setContent(html);

      // 9. SEO meta: XML first, fallback to AI call
      if (xmlMeta && xmlMeta.length > 10) {
        const cleanMeta = xmlMeta.replace(/<[^>]*>/g, "").trim().slice(0, 160);
        setSeoMeta(cleanMeta);
        if (onSetMetaDescription) onSetMetaDescription(cleanMeta);
        console.log(`[Auto Blog] SEO meta from XML: "${cleanMeta}"`);
      } else {
        setAutoBlogProgress("SEO meta açıklaması üretiliyor...");
        try {
          const metaRes = await fetch("/api/v1/admin/ai-assist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "custom", content: html, title: articleTitle, language,
              prompt: "Bu makale için Google SEO meta açıklaması yaz. Maksimum 155 karakter. Sadece açıklamayı döndür.",
            }),
          });
          if (metaRes.ok) {
            const metaData = await metaRes.json();
            const cleanMeta = (metaData.result as string).replace(/<[^>]*>/g, "").trim().slice(0, 160);
            setSeoMeta(cleanMeta);
            if (onSetMetaDescription) onSetMetaDescription(cleanMeta);
          }
        } catch (metaErr) {
          console.warn("[Auto Blog] SEO meta generation failed:", metaErr);
        }
      }

      // 10. Keywords: XML first, fallback to AI call
      if (xmlKeywords && xmlKeywords.length > 3) {
        const tags = xmlKeywords.replace(/<[^>]*>/g, "").split(",").map(t => t.trim()).filter(t => t.length > 0 && t.length < 40);
        setAutoTags(tags);
        console.log(`[Auto Blog] Tags from XML:`, tags);
      } else {
        setAutoBlogProgress("Anahtar kelimeler çıkarılıyor...");
        try {
          const tagRes = await fetch("/api/v1/admin/ai-assist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "custom", content: html, title: articleTitle, language,
              prompt: "Bu makale için 5-8 adet SEO anahtar kelime/tag çıkar. Virgülle ayırarak sadece kelimeleri döndür.",
            }),
          });
          if (tagRes.ok) {
            const tagData = await tagRes.json();
            const raw = (tagData.result as string).replace(/<[^>]*>/g, "").trim();
            const tags = raw.split(",").map(t => t.trim()).filter(t => t.length > 0 && t.length < 40);
            setAutoTags(tags);
          }
        } catch (tagErr) {
          console.warn("[Auto Blog] Tag extraction failed:", tagErr);
        }
      }

      setAutoBlogProgress("");
    } catch (err) {
      console.error("[Auto Blog] Fatal error:", err);
      setAutoBlogProgress("⚠️ Auto Blog başarısız oldu.");
    } finally {
      setAutoBlogLoading(false);
    }
  }, [editor, autoBlogIncludeImages, selectedPersona]);

  // ─── Blog Ready: format existing content into blog structure ─────────────
  const generateBlogReady = useCallback(async (
    slug: string,
    language: "tr" | "en",
    onCoverImage?: (url: string) => void,
    onSetTitle?: (title: string) => void,
    onSetCategory?: (cat: string) => void,
    onSetSlug?: (slug: string) => void,
    onSetMetaDescription?: (text: string) => void,
  ) => {
    if (!editor) return;
    const existingContent = editor.getHTML();
    if (!existingContent || existingContent === "<p></p>") {
      setAutoBlogProgress("⚠️ Editörde içerik yok.");
      return;
    }

    setAutoBlogLoading(true);
    setAutoBlogProgress("İçerik blog formatına dönüştürülüyor...");
    setAiOpen(true);
    setAutoTags([]);

    try {
      // 1. Send existing content through blog_ready formatting
      const textRes = await fetch("/api/v1/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "blog_ready",
          content: existingContent,
          language,
          persona: selectedPersona,
        }),
      });

      if (!textRes.ok) {
        console.error("[Blog Ready] Format failed:", textRes.status);
        setAutoBlogProgress("⚠️ İçerik formatlanamadı.");
        setAutoBlogLoading(false);
        return;
      }

      const textData = await textRes.json();
      let html: string = textData.result || "";
      const groundingChunks: { url: string; title: string }[] = textData.groundingChunks || [];

      // 2. Extract metadata from XML (V3) with regex fallback (V2)
      const xmlCategory = extractXMLTag(html, 'category');
      const xmlSlug = extractXMLTag(html, 'slug');
      const xmlMeta = extractXMLTag(html, 'meta_description');
      const xmlKeywords = extractXMLTag(html, 'keywords');
      // ★ Extract ref_links BEFORE stripping XML wrappers (stripXMLWrappers removes them)
      const xmlRefLinks = extractXMLTag(html, 'ref_links');

      const catMatch = html.match(/\[CATEGORY:\s*([^\]]+)\]/i);
      const aiCategory = xmlCategory
        || (catMatch ? catMatch[1].trim().toLowerCase().replace(/\s+/g, "_") : "");
      if (aiCategory && onSetCategory) onSetCategory(aiCategory);

      // Strip XML wrappers
      html = stripXMLWrappers(html);
      html = html.replace(/\[CATEGORY:\s*[^\]]+\]/gi, "");

      // 3. Extract title
      setAutoBlogProgress("Başlık ve slug oluşturuluyor...");
      const titleMatch = html.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
      const articleTitle = titleMatch
        ? titleMatch[1].replace(/<[^>]*>/g, "").trim()
        : "Untitled Article";

      if (onSetTitle) onSetTitle(articleTitle);

      // 3b. Slug: XML first, then local generation
      if (onSetSlug) {
        if (xmlSlug && xmlSlug.length > 3) {
          const cleanSlug = xmlSlug.toLowerCase()
            .replace(/<[^>]*>/g, "").trim()
            .replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
          if (cleanSlug.length > 3) onSetSlug(cleanSlug);
        } else {
          const fallbackSlug = articleTitle.toLowerCase()
            .replace(/[çÇ]/g, "c").replace(/[ğĞ]/g, "g").replace(/[ıİ]/g, "i")
            .replace(/[öÖ]/g, "o").replace(/[üÜ]/g, "u").replace(/[şŞ]/g, "s")
            .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
            .replace(/^-|-$/g, "").slice(0, 60);
          if (fallbackSlug.length > 3) onSetSlug(fallbackSlug);
        }
      }

      // 4. Parse sources from pre-extracted XML <ref_links> or old [SOURCES] block
      const sourcesMatch = html.match(/\[SOURCES\]([\s\S]*?)\[\/SOURCES\]/i);
      const sourceText = xmlRefLinks || (sourcesMatch ? sourcesMatch[1] : "");
      const parsedSources: { title: string; url: string }[] = [];
      if (sourceText) {
        const sourceLines = sourceText.trim().split("\n").filter(l => l.trim());
        for (const line of sourceLines) {
          const clean = line.replace(/^\d+\.\s*/, "").trim();
          const pipeMatch = clean.match(/^(.+?)\s*\|\s*(https?:\/\/\S+)/);
          if (pipeMatch) {
            parsedSources.push({ title: pipeMatch[1].trim(), url: pipeMatch[2].trim() });
            continue;
          }
          const urlMatch = clean.match(/(https?:\/\/\S+)/);
          if (urlMatch) {
            const title = clean.replace(urlMatch[0], "").replace(/[—–|\-]\s*$/g, "").trim() || urlMatch[0];
            parsedSources.push({ title, url: urlMatch[0] });
          }
        }
        html = html.replace(/\[SOURCES\][\s\S]*?\[\/SOURCES\]/i, "");
      }

      // Merge grounding chunks
      const seenUrls = new Set(parsedSources.map(s => s.url));
      for (const chunk of groundingChunks) {
        if (chunk.url && !seenUrls.has(chunk.url)) {
          parsedSources.push({ title: chunk.title || chunk.url, url: chunk.url });
          seenUrls.add(chunk.url);
        }
      }

      // Verify URLs
      if (parsedSources.length > 0) {
        setAutoBlogProgress("Kaynak linkleri doğrulanıyor...");
        const verifiedSources: { title: string; url: string; alive: boolean }[] = [];
        for (const src of parsedSources) {
          try {
            const r = await fetch(`/api/v1/admin/verify-url?url=${encodeURIComponent(src.url)}`, { signal: AbortSignal.timeout(5000) });
            const d = await r.json();
            verifiedSources.push({ ...src, alive: d.alive ?? false });
          } catch { verifiedSources.push({ ...src, alive: false }); }
        }
        const sourceItems = verifiedSources.map(s =>
          s.alive
            ? `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title}</a></li>`
            : `<li><span style="text-decoration:line-through;opacity:0.5">${s.title}</span> <span style="font-size:11px">⚠️ erişilemez</span></li>`
        );
        html += `<footer class="article-references" style="margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid var(--color-border)"><h3 style="font-size:16px;font-weight:600;margin-bottom:0.75rem">📚 Kaynaklar</h3><ol style="font-size:14px;line-height:1.8;padding-left:1.2rem;color:var(--color-secondary)">${sourceItems.join("\n")}</ol></footer>`;
      }

      // 5. Generate images from placeholders
      const placeholderRegex = /\[IMAGE:\s*([^\]|]+?)(?:\s*\|\s*SIZE:\s*(landscape|square|portrait))?\s*\]/gi;
      const placeholders: { full: string; desc: string; size: string }[] = [];
      const defaultSizes = ["landscape", "square", "portrait", "landscape"];
      let match;
      while ((match = placeholderRegex.exec(html)) !== null) {
        const size = match[2]?.toLowerCase() || defaultSizes[placeholders.length % defaultSizes.length];
        placeholders.push({ full: match[0], desc: match[1].trim(), size });
      }

      if (placeholders.length > 0) {
        let firstImageUrl: string | null = null;
        for (let i = 0; i < placeholders.length; i++) {
          setAutoBlogProgress(`Görsel üretiliyor (${i + 1}/${placeholders.length})...`);
          try {
            const imgRes = await fetch("/api/v1/admin/ai-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: placeholders[i].desc,
                articleSlug: slug || "untitled",
                aspectRatio: placeholders[i].size,
                articleTitle,
                articleContext: `Image ${i + 1} for blog-ready article "${articleTitle}". Maintain visual consistency.`,
              }),
            });
            if (imgRes.ok) {
              const imgData = await imgRes.json();
              if (imgData.url) {
                setGeneratedImages(prev => [imgData.url, ...prev]);
                const imgTag = buildImageHtml(imgData.url, placeholders[i].desc, placeholders[i].size, i);
                html = html.replace(placeholders[i].full, imgTag);
                if (!firstImageUrl) firstImageUrl = imgData.url;
              } else {
                html = html.replace(placeholders[i].full, "");
              }
            } else {
              html = html.replace(placeholders[i].full, "");
            }
          } catch {
            html = html.replace(placeholders[i].full, "");
          }
        }

        // Set first as cover
        if (firstImageUrl && onCoverImage) {
          setAutoBlogProgress("Kapak görseli ayarlanıyor...");
          onCoverImage(firstImageUrl);
        }
      } else {
        html = html.replace(/\[IMAGE:[^\]]*\]/gi, "");
      }

      // 6. Apply to editor
      html = html.replace(/<\/article>|$/, '<div style="clear:both"></div>');
      setAutoBlogProgress("Editöre uygulanıyor...");
      editor.commands.setContent(html);

      // 7. SEO Meta: XML first, fallback to AI
      if (xmlMeta && xmlMeta.length > 10) {
        const cleanMeta = xmlMeta.replace(/<[^>]*>/g, "").trim().slice(0, 160);
        setSeoMeta(cleanMeta);
        if (onSetMetaDescription) onSetMetaDescription(cleanMeta);
      } else {
        setAutoBlogProgress("SEO meta üretiliyor...");
        try {
          const metaRes = await fetch("/api/v1/admin/ai-assist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "custom", content: html, title: articleTitle, language,
              prompt: "Bu makale için Google SEO meta açıklaması yaz. Maksimum 155 karakter. Sadece açıklamayı döndür.",
            }),
          });
          if (metaRes.ok) {
            const metaData = await metaRes.json();
            const cleanMeta = (metaData.result as string).replace(/<[^>]*>/g, "").trim().slice(0, 160);
            setSeoMeta(cleanMeta);
            if (onSetMetaDescription) onSetMetaDescription(cleanMeta);
          }
        } catch { /* silent */ }
      }

      // 8. Keywords: XML first, fallback to AI
      if (xmlKeywords && xmlKeywords.length > 3) {
        const tags = xmlKeywords.replace(/<[^>]*>/g, "").split(",").map(t => t.trim()).filter(t => t.length > 0 && t.length < 40);
        setAutoTags(tags);
      } else {
        setAutoBlogProgress("Anahtar kelimeler çıkarılıyor...");
        try {
          const tagRes = await fetch("/api/v1/admin/ai-assist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "custom", content: html, title: articleTitle, language,
              prompt: "Bu makale için 5-8 adet SEO anahtar kelime/tag çıkar. Virgülle ayırarak sadece kelimeleri döndür.",
            }),
          });
          if (tagRes.ok) {
            const tagData = await tagRes.json();
            const raw = (tagData.result as string).replace(/<[^>]*>/g, "").trim();
            const tags = raw.split(",").map(t => t.trim()).filter(t => t.length > 0 && t.length < 40);
            setAutoTags(tags);
          }
        } catch { /* silent */ }
      }

      setAutoBlogProgress("");
    } catch (err) {
      console.error("[Blog Ready] Fatal error:", err);
      setAutoBlogProgress("⚠️ Blog Hazırla başarısız oldu.");
    } finally {
      setAutoBlogLoading(false);
    }
  }, [editor, selectedPersona]);

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
    // Persona
    selectedPersona, setSelectedPersona,
    // Auto Blog
    autoBlogLoading, autoBlogProgress, autoBlogIncludeImages,
    setAutoBlogIncludeImages, generateAutoBlog,
    // Blog Ready
    generateBlogReady,
    autoTags, setAutoTags,
  };
}
