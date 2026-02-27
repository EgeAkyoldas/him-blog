"use client";

import { useState } from "react";
import { Tag, Calendar, ArrowLeft, Monitor, Smartphone, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Editor } from "@tiptap/react";
import { categoryLabels } from "./constants";

type Viewport = "desktop" | "mobile";

interface SitePreviewProps {
  title: string;
  thumbnail: string | null;
  category: string;
  editor: Editor;
  onBack: () => void;
}

// Simulated phone frame dimensions
const PHONE_W = 375;
const PHONE_H = 780;

function ArticleContent({
  title,
  thumbnail,
  category,
  html,
  isMobile,
  wordCount,
  readingTimeMin,
}: {
  title: string;
  thumbnail: string | null;
  category: string;
  html: string;
  isMobile: boolean;
  wordCount: number;
  readingTimeMin: number;
}) {
  return (
    <article
      className="mx-auto"
      style={{
        maxWidth: isMobile ? "100%" : "800px",
        padding: isMobile ? "24px 20px" : "64px 24px",
      }}
    >
      {thumbnail && (
        <div
          className="w-full overflow-hidden mb-8"
          style={{
            height: isMobile ? "200px" : "350px",
            borderRadius: isMobile ? "8px" : "12px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt={title || "Kapak görseli"}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span
            className="text-muted bg-soft-cream px-2.5 py-1 flex items-center gap-1.5"
            style={{
              fontSize: isMobile ? "9px" : "10px",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <Tag size={isMobile ? 9 : 10} />
            {categoryLabels[category] ?? category}
          </span>
          <span
            className="flex items-center gap-1 text-muted"
            style={{ fontSize: isMobile ? "11px" : "13px" }}
          >
            <Calendar size={isMobile ? 11 : 12} />
            {new Date().toLocaleDateString("tr-TR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span
            className="flex items-center gap-1 text-muted"
            style={{ fontSize: isMobile ? "11px" : "13px" }}
          >
            <Clock size={isMobile ? 11 : 12} />
            {wordCount} kelime · ~{readingTimeMin} dk okuma
          </span>
        </div>
        <h1
          className="text-deep-navy leading-tight"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: isMobile ? "22px" : "42px",
          }}
        >
          {title || "Başlıksız Makale"}
        </h1>
      </header>

      <div
        className="article-content max-w-none text-body"
        style={{
          fontFamily: "var(--font-body)",
          lineHeight: isMobile ? "1.7" : "1.9",
          fontSize: isMobile ? "14px" : "16px",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}

export function SitePreview({
  title,
  thumbnail,
  category,
  editor,
  onBack,
}: SitePreviewProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const html = editor.getHTML();
  const textContent = html.replace(/<[^>]*>/g, "").trim();
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#f5f5f5]">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-pure-white border-b border-muted-slate/20 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-secondary hover:text-deep-navy transition-colors text-[12px] font-bold tracking-wider"
        >
          <ArrowLeft size={14} />
          Editöre Dön
        </button>

        {/* Viewport toggle — centered */}
        <div className="absolute left-1/2 -translate-x-1/2 flex micro-radius overflow-hidden border border-border bg-soft-cream">
          {(
            [
              { key: "desktop", Icon: Monitor, label: "Desktop" },
              { key: "mobile", Icon: Smartphone, label: "Mobil" },
            ] as const
          ).map(({ key, Icon, label }) => (
            <button
              key={key}
              onClick={() => setViewport(key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold tracking-wider transition-all ${
                viewport === key
                  ? "bg-deep-navy text-pure-white"
                  : "text-secondary hover:text-deep-navy"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold text-muted tracking-widest">
            SİTE ÖNİZLEME
          </span>
        </div>
      </div>

      {/* ── Preview Area ── */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {viewport === "desktop" ? (
            /* Desktop — full width scroll */
            <motion.div
              key="desktop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-pure-white min-h-full"
            >
              <ArticleContent
                title={title}
                thumbnail={thumbnail}
                category={category}
                html={html}
                isMobile={false}
                wordCount={wordCount}
                readingTimeMin={readingTimeMin}
              />
            </motion.div>
          ) : (
            /* Mobile — phone frame centered */
            <motion.div
              key="mobile"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="flex items-start justify-center py-10"
            >
              {/* Phone shell */}
              <div
                className="relative bg-[#1a1a1a] rounded-[44px] shadow-2xl"
                style={{ width: PHONE_W + 24, padding: "12px" }}
              >
                {/* Notch */}
                <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-[#1a1a1a] rounded-full z-10" />

                {/* Screen */}
                <div
                  className="bg-pure-white rounded-[36px] overflow-hidden relative"
                  style={{ width: PHONE_W, height: PHONE_H }}
                >
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-6 pt-3 pb-1 bg-pure-white sticky top-0 z-20">
                    <span className="text-[11px] font-semibold text-body">
                      {new Date().toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-[2px] items-end h-3">
                        {[3, 5, 7, 9].map((h, i) => (
                          <div
                            key={i}
                            className="w-[3px] bg-charcoal/70 rounded-sm"
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>
                      <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
                        <rect x="0.5" y="0.5" width="12" height="10" rx="1.5" stroke="#1a1a1a" strokeWidth="1" />
                        <rect x="2" y="2" width="9" height="7" rx="0.5" fill="#1a1a1a" />
                        <rect x="13" y="3.5" width="1.5" height="4" rx="0.75" fill="#1a1a1a" />
                      </svg>
                    </div>
                  </div>

                  {/* Scrollable content */}
                  <div className="overflow-y-auto" style={{ height: PHONE_H - 36 }}>
                    {/* Mini nav bar */}
                    <div className="px-4 py-2 border-b border-muted-slate/20 flex items-center justify-between bg-pure-white sticky top-0 z-10">
                      <div className="text-[10px] font-bold text-deep-navy tracking-widest">
                        SAYAR<span className="text-muted">.LEGAL</span>
                      </div>
                      <div className="w-5 h-5 flex flex-col justify-center gap-1">
                        <div className="w-full h-px bg-deep-navy" />
                        <div className="w-3/4 h-px bg-deep-navy" />
                        <div className="w-full h-px bg-deep-navy" />
                      </div>
                    </div>

                    <ArticleContent
                      title={title}
                      thumbnail={thumbnail}
                      category={category}
                      html={html}
                      isMobile={true}
                      wordCount={wordCount}
                      readingTimeMin={readingTimeMin}
                    />

                    {/* Bottom padding for home indicator */}
                    <div className="h-8" />
                  </div>

                  {/* Home indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-1 bg-charcoal/30 rounded-full" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
