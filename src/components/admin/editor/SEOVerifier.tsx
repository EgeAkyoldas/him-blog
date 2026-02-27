"use client";

import { useMemo, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, XCircle, ChevronDown, Sparkles, Loader2 } from "lucide-react";

interface SEOCheck {
  id: string;
  label: string;
  status: "good" | "warn" | "error";
  message: string;
  tip?: string;
  /** If this check has an AI-fixable issue, this is the human-readable description of the problem */
  aiFixable?: string;
}

interface SEOVerifierProps {
  title: string;
  metaDescription: string | null;
  content: string; // HTML
  language: "tr" | "en";
  /** Called when user clicks AI optimize — receives the list of detected issues as a string */
  onAIOptimize?: (issues: string) => Promise<void>;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function extractH1(html: string): number {
  return (html.match(/<h1[\s>]/gi) || []).length;
}

function extractH2(html: string): number {
  return (html.match(/<h2[\s>]/gi) || []).length;
}

function avgSentenceLength(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  if (!sentences.length) return 0;
  const totalWords = sentences.reduce((acc, s) => acc + countWords(s), 0);
  return Math.round(totalWords / sentences.length);
}

export function SEOVerifier({ title, metaDescription, content, language, onAIOptimize }: SEOVerifierProps) {
  const [open, setOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const plainText = useMemo(() => stripHtml(content), [content]);
  const wordCount = useMemo(() => countWords(plainText), [plainText]);
  const h1Count = useMemo(() => extractH1(content), [content]);
  const h2Count = useMemo(() => extractH2(content), [content]);
  const avgSentLen = useMemo(() => avgSentenceLength(plainText), [plainText]);
  const metaLen = metaDescription?.length ?? 0;
  const titleLen = title.length;

  const checks: SEOCheck[] = useMemo(() => {
    const list: SEOCheck[] = [];

    // Title length
    if (titleLen === 0) {
      list.push({ id: "title", label: "Başlık", status: "error", message: "Başlık yok", tip: "50-60 karakter arası ideal" });
    } else if (titleLen < 30) {
      list.push({ id: "title", label: "Başlık uzunluğu", status: "warn", message: `${titleLen} karakter — çok kısa`, tip: "50-60 karakter arası ideal" });
    } else if (titleLen > 70) {
      list.push({ id: "title", label: "Başlık uzunluğu", status: "warn", message: `${titleLen} karakter — çok uzun (Google keser)`, tip: "Maksimum 60 karakter önerilir" });
    } else {
      list.push({ id: "title", label: "Başlık uzunluğu", status: "good", message: `${titleLen} karakter — ideal aralıkta` });
    }

    // Meta description
    if (metaLen === 0) {
      list.push({ id: "meta", label: "Meta açıklama", status: "error", message: "Meta açıklama eksik", tip: "AI Panel → Meta Açıklama Üret" });
    } else if (metaLen < 100) {
      list.push({ id: "meta", label: "Meta açıklama", status: "warn", message: `${metaLen} karakter — çok kısa`, tip: "120-155 karakter idealdir" });
    } else if (metaLen > 155) {
      list.push({ id: "meta", label: "Meta açıklama", status: "warn", message: `${metaLen} karakter — çok uzun (kesilir)`, tip: "155 karakteri geçmemeli" });
    } else {
      list.push({ id: "meta", label: "Meta açıklama", status: "good", message: `${metaLen} karakter — ideal` });
    }

    // Word count
    if (wordCount < 300) {
      list.push({ id: "words", label: "İçerik uzunluğu", status: "error", message: `${wordCount} kelime — yetersiz`, tip: "SEO için minimum 300 kelime gerekir", aiFixable: `İçerik çok kısa (${wordCount} kelime). SEO için en az 600 kelime olmalı. İçeriği genişlet ve detaylandır.` });
    } else if (wordCount < 600) {
      list.push({ id: "words", label: "İçerik uzunluğu", status: "warn", message: `${wordCount} kelime`, tip: "600+ kelime Google'da daha iyi sıralanır", aiFixable: `İçerik orta uzunlukta (${wordCount} kelime). 600+ kelime için daha fazla detay ekle.` });
    } else {
      list.push({ id: "words", label: "İçerik uzunluğu", status: "good", message: `${wordCount} kelime — güçlü içerik` });
    }

    // Headings
    if (h1Count > 1) {
      list.push({ id: "h1", label: "H1 başlık", status: "warn", message: `${h1Count} adet H1 var`, tip: "Bir sayfada sadece 1 H1 olmalı", aiFixable: `Sayfada ${h1Count} adet H1 başlık var, sadece 1 olmalı. Fazladan H1'leri H2'ye dönüştür.` });
    }
    if (h2Count === 0 && wordCount > 200) {
      list.push({ id: "h2", label: "Alt başlıklar", status: "warn", message: "H2 başlık yok", tip: "İçeriği bölümlere ayırmak okunabilirliği artırır", aiFixable: "İçerikte hiç H2 alt başlık yok. İçeriği mantıklı bölümlere ayır ve H2 başlıklar ekle." });
    } else if (h2Count >= 2) {
      list.push({ id: "h2", label: "Alt başlıklar", status: "good", message: `${h2Count} adet H2 başlık` });
    } else if (h2Count === 1) {
      list.push({ id: "h2", label: "Alt başlıklar", status: "warn", message: "Yalnızca 1 H2 var", tip: "2+ H2 başlık daha iyi yapı sağlar", aiFixable: "Sadece 1 H2 başlık var. İçeriği daha iyi yapılandırmak için ek H2 alt başlıklar ekle." });
    }

    // Readability
    if (avgSentLen > 25) {
      list.push({ id: "readability", label: "Okunabilirlik", status: "warn", message: `Ortalama cümle: ${avgSentLen} kelime`, tip: "Cümleler 20 kelimeyi geçmemeli", aiFixable: `Cümleler çok uzun (ortalama ${avgSentLen} kelime). Uzun cümleleri kısalt, paragrafları sadeleştir.` });
    } else if (wordCount > 0) {
      list.push({ id: "readability", label: "Okunabilirlik", status: "good", message: `Ortalama cümle: ${avgSentLen} kelime — akıcı` });
    }

    return list;
  }, [titleLen, metaLen, wordCount, h1Count, h2Count, avgSentLen]);

  const fixableIssues = checks.filter((c) => c.aiFixable);
  const errorCount = checks.filter((c) => c.status === "error").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const goodCount = checks.filter((c) => c.status === "good").length;

  const overallStatus = errorCount > 0 ? "error" : warnCount > 1 ? "warn" : "good";
  const overallLabel =
    overallStatus === "good" ? "SEO İyi" :
    overallStatus === "warn" ? "SEO Orta" : "SEO Zayıf";
  const overallColor =
    overallStatus === "good" ? "text-emerald-600 border-emerald-200 bg-emerald-50/60" :
    overallStatus === "warn" ? "text-amber-600 border-amber-200 bg-amber-50/60" :
    "text-rose-600 border-rose-200 bg-rose-50/60";

  const handleAIOptimize = useCallback(async () => {
    if (!onAIOptimize || fixableIssues.length === 0) return;
    setAiLoading(true);
    setOpen(true);
    try {
      const issueList = fixableIssues.map((c, i) => `${i + 1}. ${c.aiFixable}`).join("\n");
      await onAIOptimize(issueList);
    } finally {
      setAiLoading(false);
    }
  }, [onAIOptimize, fixableIssues]);

  const StatusIcon = ({ status }: { status: SEOCheck["status"] }) => {
    if (status === "good") return <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />;
    if (status === "warn") return <AlertCircle size={12} className="text-amber-500 shrink-0" />;
    return <XCircle size={12} className="text-rose-500 shrink-0" />;
  };

  const langLabel = language === "tr" ? "TR" : "EN";

  return (
    <div className="mt-3 border border-border micro-radius overflow-hidden">
      {/* Header — always visible */}
      <div className={`flex items-center border ${overallColor}`}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center gap-2 px-3 py-2 text-[11px] font-bold transition-colors text-left"
        >
          <span className="px-1.5 py-0.5 micro-radius border text-[9px] font-bold opacity-60">{langLabel}</span>
          {overallLabel}
          <span className="font-normal opacity-60">
            {goodCount} iyi · {warnCount} uyarı · {errorCount} hata
          </span>
          <ChevronDown size={12} className={`transition-transform ml-auto ${open ? "rotate-180" : ""}`} />
        </button>

        {/* AI Optimize button — only when there are fixable issues */}
        {fixableIssues.length > 0 && onAIOptimize && (
          <button
            onClick={handleAIOptimize}
            disabled={aiLoading}
            title={`${fixableIssues.length} sorunu AI ile düzelt`}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold border-l border-current/20 hover:bg-current/5 transition-colors disabled:opacity-50"
          >
            {aiLoading
              ? <Loader2 size={11} className="animate-spin" />
              : <Sparkles size={11} />
            }
            {aiLoading ? "Optimize ediliyor..." : "AI ile Optimize Et"}
          </button>
        )}
      </div>

      {/* Expanded checks */}
      {open && (
        <div className="bg-pure-white divide-y divide-muted-slate/40">
          {checks.map((check) => (
            <div key={check.id} className="flex items-start gap-2 px-3 py-2">
              <StatusIcon status={check.status} />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-body">{check.label}: </span>
                <span className="text-[11px] text-secondary">{check.message}</span>
                {check.tip && (
                  <p className="text-[10px] text-muted mt-0.5">💡 {check.tip}</p>
                )}
              </div>
              {/* Per-check AI fix indicator */}
              {check.aiFixable && (
                <span className="text-[9px] text-muted flex items-center gap-0.5 shrink-0">
                  <Sparkles size={9} /> AI
                </span>
              )}
            </div>
          ))}

          {/* Score bar + AI summary */}
          <div className="px-3 py-2 bg-stone-50/60 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted w-8">0</span>
              <div className="flex-1 h-1.5 bg-muted-slate rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    overallStatus === "good" ? "bg-emerald-500" :
                    overallStatus === "warn" ? "bg-amber-400" : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.round((goodCount / Math.max(checks.length, 1)) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-muted w-8 text-right">100</span>
            </div>
            {fixableIssues.length > 0 && (
              <p className="text-[10px] text-muted">
                ✨ <strong>{fixableIssues.length}</strong> sorun AI ile otomatik düzeltilebilir — yukarıdaki butona tıkla.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
