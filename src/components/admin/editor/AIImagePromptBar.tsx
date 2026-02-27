"use client";

import { ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIImagePromptBarProps {
  show: "toolbar" | "panel" | null;
  promptText: string;
  onPromptChange: (v: string) => void;
  onSubmit: (prompt: string) => void;
  onClose: () => void;
  loading: boolean;
  imageSize: "landscape" | "portrait" | "square";
  onSizeChange: (s: "landscape" | "portrait" | "square") => void;
}

const sizes = [
  { key: "landscape" as const, label: "16:9" },
  { key: "square" as const, label: "1:1" },
  { key: "portrait" as const, label: "9:16" },
];

export function AIImagePromptBar({
  show,
  promptText,
  onPromptChange,
  onSubmit,
  onClose,
  loading,
  imageSize,
  onSizeChange,
}: AIImagePromptBarProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 border border-t-0 rounded-b-none" style={{ backgroundColor: "var(--color-brand-surface)", borderColor: "var(--color-brand-border)" }}>
            <ImageIcon size={14} className="text-heading shrink-0" />

            {/* Size selector */}
            <div className="flex micro-radius overflow-hidden border shrink-0" style={{ borderColor: "var(--color-brand-border)" }}>
              {sizes.map((s) => (
                <button
                  key={s.key}
                  onClick={() => onSizeChange(s.key)}
                  className={`px-2 py-1 text-[10px] font-bold tracking-wider transition-colors ${
                    imageSize === s.key
                      ? "text-heading"
                      : "bg-surface text-muted hover:text-heading"
                  }`}
                  style={imageSize === s.key ? { backgroundColor: "var(--color-brand-primary)", color: "var(--color-brand-primary-text)" } : {}}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={promptText}
              onChange={(e) => onPromptChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && promptText.trim()) {
                  onSubmit(promptText);
                  onClose();
                }
                if (e.key === "Escape") onClose();
              }}
              placeholder="Görsel açıklaması yazın..."
              className="flex-1 bg-surface border border-muted-slate px-3 py-1.5 text-[13px] micro-radius focus:outline-none focus:border-gold-accent"
              autoFocus
            />
            <button
              onClick={() => {
                if (promptText.trim()) {
                  onSubmit(promptText);
                  onClose();
                }
              }}
              disabled={!promptText.trim() || loading}
              className="px-3 py-1.5 text-[11px] font-bold tracking-wider micro-radius transition-colors disabled:opacity-40"
              style={{ backgroundColor: "var(--color-brand-primary)", color: "var(--color-brand-primary-text)" }}
            >
              {loading ? "Üretiliyor..." : "Üret"}
            </button>
            <button
              onClick={onClose}
              className="px-2 py-1.5 text-[11px] font-bold text-charcoal/40 hover:text-charcoal/70 transition-colors"
            >
              İptal
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
