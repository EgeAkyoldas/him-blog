"use client";

import { Save, LetterText, Clock, Shield } from "lucide-react";
import { Loader2 } from "lucide-react";
import { SEOVerifier } from "./SEOVerifier";

function getSEOScore(title: string, words: number): { score: number; label: string; color: string } {
  let score = 0;
  const t = title.trim();

  // Title length: ideal 50-60 chars
  if (t.length >= 30 && t.length <= 70) score += 30;
  else if (t.length > 0) score += 15;

  // Word count: 300+ words passes, 600+ ideal
  if (words >= 600) score += 40;
  else if (words >= 300) score += 25;
  else if (words >= 100) score += 10;

  // Has a heading keyword (simple proxy)
  if (t.split(" ").length >= 4) score += 15;

  // Freshness bonus if there's content
  if (words > 0) score += 15;

  if (score >= 75) return { score, label: "İyi", color: "text-emerald-500" };
  if (score >= 45) return { score, label: "Orta", color: "text-amber-500" };
  return { score, label: "Zayıf", color: "text-rose-500" };
}

interface EditorFooterProps {
  characters: number;
  words: number;
  title: string;
  saving: boolean;
  lastSavedAt: Date | null;
  isDirty: boolean;
  saveError: string | null;
  metaDescription: string | null;
  content: string;
  language: "tr" | "en";
  onAIOptimize?: (issues: string) => Promise<void>;
  onDraft: () => void;
  onPublish: () => void;
}

export function EditorFooter({
  characters,
  words,
  title,
  saving,
  lastSavedAt,
  isDirty,
  saveError,
  metaDescription,
  content,
  language,
  onAIOptimize,
  onDraft,
  onPublish,
}: EditorFooterProps) {
  const readingMins = Math.max(1, Math.ceil(words / 200));
  const { score, label, color } = getSEOScore(title, words);

  const lastSavedLabel = lastSavedAt
    ? lastSavedAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <>
    <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
      {/* Left: stats */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="flex items-center gap-1 text-[11px] text-charcoal/30">
          <LetterText size={11} />
          {characters.toLocaleString("tr-TR")} karakter
        </span>
        <span className="text-[11px] text-charcoal/30">
          {words.toLocaleString("tr-TR")} kelime
        </span>
        <span className="flex items-center gap-1 text-[11px] text-charcoal/30">
          <Clock size={11} />
          ~{readingMins} dk okuma
        </span>

        {/* SEO score pill */}
        <span
          className={`flex items-center gap-1 text-[11px] font-bold ${color}`}
          title={`SEO Skoru: Başlık ve içerik uzunluğuna göre ${score}/100`}
        >
          <Shield size={11} />
          SEO {label}
          <span className="text-[9px] opacity-60 ml-0.5">({score})</span>
        </span>

        {/* Auto-save indicator */}
        {lastSavedLabel && (
          <span className="text-[10px] text-charcoal/25 flex items-center gap-1">
            <Save size={10} />
            {isDirty ? "Kaydedilmemiş değişiklikler" : `Oto-kayıt ${lastSavedLabel}`}
          </span>
        )}
      </div>

      {/* Right: error + save buttons */}
      <div className="flex items-center gap-2">
        {saveError && (
          <span className="text-[11px] text-rose-500 font-semibold">{saveError}</span>
        )}
        <button
          onClick={onDraft}
          disabled={saving}
          className="btn-secondary text-[12px] flex items-center gap-1.5"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Taslak
        </button>
        <button
          onClick={onPublish}
          disabled={saving}
          className="btn-primary text-[12px] flex items-center gap-1.5"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Yayınla
        </button>
      </div>
    </div>

    {/* SEO Verifier — below the footer bar */}
    <SEOVerifier
      title={title}
      metaDescription={metaDescription}
      content={content}
      language={language}
      onAIOptimize={onAIOptimize}
    />
    </>
  );
}
