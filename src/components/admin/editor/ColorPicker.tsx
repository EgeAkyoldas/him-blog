"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, Highlighter, X } from "lucide-react";
import type { Editor } from "@tiptap/react";

const TEXT_COLORS = [
  { label: "Varsayılan", value: "" },
  { label: "Siyah", value: "#1a1a1a" },
  { label: "Koyu Gri", value: "#4a4a4a" },
  { label: "Gri", value: "#8a8a8a" },
  { label: "Kırmızı", value: "#dc2626" },
  { label: "Turuncu", value: "#ea580c" },
  { label: "Sarı", value: "#ca8a04" },
  { label: "Yeşil", value: "#16a34a" },
  { label: "Mavi", value: "#2563eb" },
  { label: "Mor", value: "#9333ea" },
  { label: "Pembe", value: "#db2777" },
  { label: "Turkuaz", value: "#0891b2" },
];

const HIGHLIGHT_COLORS = [
  { label: "Yok", value: "" },
  { label: "Sarı", value: "#fef08a" },
  { label: "Yeşil", value: "#bbf7d0" },
  { label: "Mavi", value: "#bfdbfe" },
  { label: "Mor", value: "#ddd6fe" },
  { label: "Pembe", value: "#fbcfe8" },
  { label: "Turuncu", value: "#fed7aa" },
  { label: "Kırmızı", value: "#fecaca" },
];

function ColorDot({ color, active, onClick, label }: {
  color: string;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-5 h-5 rounded-full border transition-all hover:scale-110 ${
        active ? "ring-2 ring-heading ring-offset-1" : ""
      }`}
      style={{
        backgroundColor: color || "var(--color-body)",
        borderColor: active ? "var(--color-heading)" : "var(--color-border)",
      }}
    >
      {!color && (
        <X size={10} className="mx-auto text-muted" />
      )}
    </button>
  );
}

interface ColorPickerProps {
  editor: Editor;
}

export function ColorPicker({ editor }: ColorPickerProps) {
  const [showText, setShowText] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowText(false);
        setShowHighlight(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentColor = editor.getAttributes("textStyle").color || "";
  const currentHighlight = editor.getAttributes("highlight").color || "";

  return (
    <div ref={ref} className="relative flex items-center gap-0.5">
      {/* Text Color Button */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          setShowText(!showText);
          setShowHighlight(false);
        }}
        className={`p-1.5 micro-radius transition-all ${
          currentColor
            ? "ring-1 ring-heading/30"
            : "text-secondary hover:bg-surface-raised hover:text-heading"
        }`}
        style={currentColor ? {
          backgroundColor: "var(--color-surface-raised)",
          color: currentColor,
          boxShadow: "inset 0 0 0 1px var(--color-border)",
        } : {}}
        title="Yazı Rengi"
      >
        <Palette size={14} strokeWidth={currentColor ? 2.4 : 1.8} />
      </button>

      {/* Highlight Button */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          setShowHighlight(!showHighlight);
          setShowText(false);
        }}
        className={`p-1.5 micro-radius transition-all ${
          currentHighlight
            ? "ring-1 ring-heading/30"
            : "text-secondary hover:bg-surface-raised hover:text-heading"
        }`}
        style={currentHighlight ? {
          backgroundColor: currentHighlight,
          color: "var(--color-heading)",
          boxShadow: "inset 0 0 0 1px var(--color-border)",
        } : {}}
        title="Vurgulama"
      >
        <Highlighter size={14} strokeWidth={currentHighlight ? 2.4 : 1.8} />
      </button>

      {/* Text Color Popup */}
      {showText && (
        <div
          className="absolute top-full left-0 mt-1 p-2.5 micro-radius shadow-lg z-30 min-w-[180px]"
          style={{
            backgroundColor: "var(--color-pure-white)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="text-[9px] font-bold text-muted tracking-wider mb-2">YAZI RENGİ</div>
          <div className="grid grid-cols-6 gap-1.5">
            {TEXT_COLORS.map((c) => (
              <ColorDot
                key={c.value || "default"}
                color={c.value}
                label={c.label}
                active={currentColor === c.value || (!currentColor && !c.value)}
                onClick={() => {
                  if (c.value) {
                    editor.chain().focus().setColor(c.value).run();
                  } else {
                    editor.chain().focus().unsetColor().run();
                  }
                  setShowText(false);
                }}
              />
            ))}
          </div>
          {/* Custom color input */}
          <div className="mt-2 pt-2 flex items-center gap-2" style={{ borderTop: "1px solid var(--color-border)" }}>
            <input
              type="color"
              value={currentColor || "#1a1a1a"}
              onChange={(e) => {
                editor.chain().focus().setColor(e.target.value).run();
              }}
              className="w-6 h-6 rounded cursor-pointer border-0 p-0"
              title="Özel renk seç"
            />
            <span className="text-[10px] text-muted font-medium">Özel renk</span>
          </div>
        </div>
      )}

      {/* Highlight Popup */}
      {showHighlight && (
        <div
          className="absolute top-full left-0 mt-1 p-2.5 micro-radius shadow-lg z-30 min-w-[160px]"
          style={{
            backgroundColor: "var(--color-pure-white)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="text-[9px] font-bold text-muted tracking-wider mb-2">VURGULAMA</div>
          <div className="grid grid-cols-4 gap-1.5">
            {HIGHLIGHT_COLORS.map((c) => (
              <ColorDot
                key={c.value || "none"}
                color={c.value}
                label={c.label}
                active={currentHighlight === c.value || (!currentHighlight && !c.value)}
                onClick={() => {
                  if (c.value) {
                    editor.chain().focus().toggleHighlight({ color: c.value }).run();
                  } else {
                    editor.chain().focus().unsetHighlight().run();
                  }
                  setShowHighlight(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
