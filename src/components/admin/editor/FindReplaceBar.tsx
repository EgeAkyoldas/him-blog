"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Replace, X, ChevronUp, ChevronDown } from "lucide-react";
import type { Editor } from "@tiptap/react";
import { AnimatePresence, motion } from "framer-motion";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Simple find & replace using browser selection + execCommand-free approach via ProseMirror */
function findMatches(html: string, term: string): number {
  if (!term) return 0;
  try {
    const regex = new RegExp(escapeRegex(term), "gi");
    return (html.match(regex) ?? []).length;
  } catch { return 0; }
}

interface FindReplaceBarProps {
  editor: Editor | null;
  show: boolean;
  onClose: () => void;
}

export function FindReplaceBar({ editor, show, onClose }: FindReplaceBarProps) {
  const [findTerm, setFindTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const findInputRef = useRef<HTMLInputElement>(null);

  // Count matches whenever term or editor content changes
  useEffect(() => {
    if (!editor || !findTerm) { setMatchCount(0); setCurrentMatch(0); return; }
    const html = editor.getText(); // plain text for counting
    try {
      const flags = caseSensitive ? "g" : "gi";
      const regex = new RegExp(escapeRegex(findTerm), flags);
      const count = (html.match(regex) ?? []).length;
      setMatchCount(count);
      setCurrentMatch(count > 0 ? 1 : 0);
    } catch { setMatchCount(0); }
  }, [findTerm, editor, caseSensitive]);

  // Focus input when shown
  useEffect(() => {
    if (show) setTimeout(() => findInputRef.current?.focus(), 100);
  }, [show]);

  // Keyboard: Esc closes, Enter next match
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!show) return;
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [show, onClose]);

  const replaceOne = useCallback(() => {
    if (!editor || !findTerm) return;
    const html = editor.getHTML();
    const flags = caseSensitive ? "" : "i";
    try {
      const regex = new RegExp(escapeRegex(findTerm), flags);
      const newHtml = html.replace(regex, replaceTerm);
      editor.commands.setContent(newHtml);
      setMatchCount((m) => Math.max(0, m - 1));
    } catch { /* ignore */ }
  }, [editor, findTerm, replaceTerm, caseSensitive]);

  const replaceAll = useCallback(() => {
    if (!editor || !findTerm) return;
    const html = editor.getHTML();
    const flags = caseSensitive ? "g" : "gi";
    try {
      const regex = new RegExp(escapeRegex(findTerm), flags);
      const count = (html.match(regex) ?? []).length;
      const newHtml = html.replace(regex, replaceTerm);
      editor.commands.setContent(newHtml);
      setMatchCount(0);
      setCurrentMatch(0);
      // brief toast
      alert(`${count} eşleşme değiştirildi.`);
    } catch { /* ignore */ }
  }, [editor, findTerm, replaceTerm, caseSensitive]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="border border-border bg-pure-white shadow-md rounded-lg p-3 mb-3"
        >
          <div className="flex items-start gap-3 flex-wrap">
            {/* Find */}
            <div className="flex-1 min-w-[160px]">
              <div className="flex items-center gap-1.5 mb-1">
                <Search size={11} className="text-muted" />
                <span className="text-[10px] font-bold text-muted tracking-wider">BUL</span>
              </div>
              <div className="flex gap-1">
                <input
                  ref={findInputRef}
                  type="text"
                  value={findTerm}
                  onChange={(e) => setFindTerm(e.target.value)}
                  placeholder="Metin ara..."
                  className="input-boutique text-[12px] flex-1"
                />
                {matchCount > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-secondary px-2 border border-border micro-radius whitespace-nowrap">
                    {currentMatch}/{matchCount}
                  </span>
                )}
              </div>
            </div>

            {/* Replace */}
            <div className="flex-1 min-w-[160px]">
              <div className="flex items-center gap-1.5 mb-1">
                <Replace size={11} className="text-muted" />
                <span className="text-[10px] font-bold text-muted tracking-wider">DEĞİŞTİR</span>
              </div>
              <input
                type="text"
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                placeholder="Değiştir..."
                className="input-boutique text-[12px] w-full"
              />
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-1 pt-5">
              <div className="flex gap-1">
                <button
                  onClick={replaceOne}
                  disabled={!findTerm || matchCount === 0}
                  className="px-2.5 py-1.5 text-[10px] font-bold bg-soft-cream hover:bg-deep-navy/10 text-body hover:text-deep-navy micro-radius transition-colors disabled:opacity-30"
                >
                  Birini Değiştir
                </button>
                <button
                  onClick={replaceAll}
                  disabled={!findTerm || matchCount === 0}
                  className="px-2.5 py-1.5 text-[10px] font-bold bg-deep-navy text-pure-white micro-radius hover:bg-charcoal transition-colors disabled:opacity-30"
                >
                  Tümünü Değiştir
                </button>
              </div>
              {/* Case sensitive toggle */}
              <button
                onClick={() => setCaseSensitive((v) => !v)}
                className={`text-[9px] font-bold tracking-wider px-2 py-1 micro-radius transition-colors ${
                  caseSensitive
                    ? "bg-deep-navy/10 text-deep-navy"
                    : "text-muted hover:text-body"
                }`}
              >
                Aa Büyük/küçük harf
              </button>
            </div>

            <button onClick={onClose} className="text-muted hover:text-body mt-0.5 pt-5">
              <X size={14} />
            </button>
          </div>

          {findTerm && matchCount === 0 && (
            <p className="text-[10px] text-rose-400 mt-2">Eşleşme bulunamadı.</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
