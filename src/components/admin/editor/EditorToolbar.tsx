"use client";

import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, Type,
  List, ListOrdered, Quote, Code,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Minus, Link2, ImagePlus, ImageIcon,
  Youtube, Video, AudioLines, Upload, Link as LinkIcon, X,
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { ColorPicker } from "./ColorPicker";
import { ArticleLinkPicker } from "./ArticleLinkPicker";

// ─── Toolbar button helper ───────────────────────────────────
function TB({
  icon: Icon,
  action,
  active = false,
  disabled = false,
  title: btnTitle,
}: {
  icon: typeof Bold;
  action: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        action();
      }}
      disabled={disabled}
      title={btnTitle}
      className={`p-1.5 micro-radius transition-all ${
        active
          ? "ring-1 ring-heading/30"
          : "text-secondary hover:bg-surface-raised hover:text-heading"
      } disabled:opacity-30`}
      style={active ? { backgroundColor: "var(--color-surface-raised)", color: "var(--color-heading)", boxShadow: "inset 0 0 0 1px var(--color-border)" } : {}}
    >
      <Icon size={14} strokeWidth={active ? 2.4 : 1.8} />
    </button>
  );
}

const Sep = () => <div className="w-px h-5 bg-muted-slate/30 mx-0.5" />;

// ─── Inline URL Popover ──────────────────────────────────────
function URLPopover({
  open,
  onClose,
  onSubmit,
  placeholder,
  label,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  placeholder: string;
  label: string;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setValue("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full mt-1.5 z-50 bg-pure-white border border-border rounded-lg shadow-lg p-3 min-w-[300px]"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-heading tracking-wider uppercase">{label}</span>
        <button onClick={onClose} className="text-muted hover:text-heading transition-colors">
          <X size={12} />
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) {
            onSubmit(value.trim());
            onClose();
          }
        }}
        className="flex gap-1.5"
      >
        <input
          ref={inputRef}
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-2.5 py-1.5 text-[12px] border border-border micro-radius bg-surface text-heading placeholder:text-muted outline-none focus:border-heading transition-colors"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="px-3 py-1.5 text-[11px] font-bold micro-radius bg-deep-navy text-pure-white hover:bg-charcoal transition-colors disabled:opacity-40"
        >
          Ekle
        </button>
      </form>
    </div>
  );
}

// ─── Media Button (URL popover + upload option) ──────────────
function MediaButton({
  icon: Icon,
  title,
  label,
  placeholder,
  onURL,
  onUpload,
}: {
  icon: typeof Bold;
  title: string;
  label: string;
  placeholder: string;
  onURL: (url: string) => void;
  onUpload?: () => void;
}) {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          setShowPopover((v) => !v);
        }}
        title={title}
        className={`p-1.5 micro-radius transition-all ${
          showPopover
            ? "ring-1 ring-heading/30"
            : "text-secondary hover:bg-surface-raised hover:text-heading"
        }`}
        style={showPopover ? { backgroundColor: "var(--color-surface-raised)", color: "var(--color-heading)", boxShadow: "inset 0 0 0 1px var(--color-border)" } : {}}
      >
        <Icon size={14} strokeWidth={showPopover ? 2.4 : 1.8} />
      </button>

      {showPopover && (
        <MediaPopover
          label={label}
          placeholder={placeholder}
          onURL={(url) => { onURL(url); setShowPopover(false); }}
          onUpload={onUpload ? () => { onUpload(); setShowPopover(false); } : undefined}
          onClose={() => setShowPopover(false)}
        />
      )}
    </div>
  );
}

// ─── Media Popover (URL input + Upload button) ──────────────
function MediaPopover({
  label,
  placeholder,
  onURL,
  onUpload,
  onClose,
}: {
  label: string;
  placeholder: string;
  onURL: (url: string) => void;
  onUpload?: () => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full mt-1.5 z-50 bg-pure-white border border-border rounded-lg shadow-lg p-3 min-w-[320px]"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-bold text-heading tracking-wider uppercase">{label}</span>
        <button onClick={onClose} className="text-muted hover:text-heading transition-colors">
          <X size={12} />
        </button>
      </div>

      {/* URL input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) onURL(value.trim());
        }}
        className="flex gap-1.5 mb-2"
      >
        <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 border border-border micro-radius bg-surface focus-within:border-heading transition-colors">
          <LinkIcon size={11} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 text-[12px] text-heading placeholder:text-muted outline-none bg-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={!value.trim()}
          className="px-3 py-1.5 text-[11px] font-bold micro-radius bg-deep-navy text-pure-white hover:bg-charcoal transition-colors disabled:opacity-40"
        >
          Ekle
        </button>
      </form>

      {/* Upload option */}
      {onUpload && (
        <button
          onClick={onUpload}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-bold micro-radius border border-dashed border-border text-secondary hover:text-heading hover:border-heading hover:bg-surface transition-all"
        >
          <Upload size={12} />
          Dosya Yükle
        </button>
      )}
    </div>
  );
}

// ─── Main Toolbar ────────────────────────────────────────────
interface EditorToolbarProps {
  editor: Editor;
  imageRef: React.RefObject<HTMLInputElement | null>;
  videoRef: React.RefObject<HTMLInputElement | null>;
  audioRef: React.RefObject<HTMLInputElement | null>;
  onAIImageClick: () => void;
  aiImageLoading: boolean;
}

export function EditorToolbar({
  editor,
  imageRef,
  videoRef,
  audioRef,
  onAIImageClick,
  aiImageLoading,
}: EditorToolbarProps) {
  const [linkPopover, setLinkPopover] = useState(false);

  return (
    <div className="card-boutique border-b-0! rounded-b-none! px-2 py-1.5 flex items-center gap-0.5 flex-wrap sticky top-0 z-20" style={{ backgroundColor: "var(--color-pure-white)" }}>
      <TB icon={Bold} action={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Kalın" />
      <TB icon={Italic} action={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="İtalik" />
      <TB icon={UnderlineIcon} action={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Altı Çizili" />
      <TB icon={Strikethrough} action={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Üstü Çizili" />

      <Sep />

      <TB icon={Heading1} action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="H1" />
      <TB icon={Heading2} action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2" />
      <TB icon={Heading3} action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3" />
      <TB icon={Type} action={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph") && !editor.isActive("heading")} title="Paragraf" />

      <Sep />

      <TB icon={List} action={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Liste" />
      <TB icon={ListOrdered} action={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numaralı" />
      <TB icon={Quote} action={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Alıntı" />
      <TB icon={Code} action={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Kod" />

      <Sep />

      <TB icon={AlignLeft} action={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Sol" />
      <TB icon={AlignCenter} action={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Orta" />
      <TB icon={AlignRight} action={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Sağ" />
      <TB icon={AlignJustify} action={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify" />

      <Sep />

      <TB icon={Minus} action={() => editor.chain().focus().setHorizontalRule().run()} title="Çizgi" />

      {/* Link — inline popover instead of window.prompt */}
      <div className="relative">
        <TB
          icon={Link2}
          action={() => setLinkPopover((v) => !v)}
          active={editor.isActive("link")}
          title="Link"
        />
        <URLPopover
          open={linkPopover}
          onClose={() => setLinkPopover(false)}
          onSubmit={(url) => editor.chain().focus().setLink({ href: url }).run()}
          placeholder="https://example.com"
          label="Link Ekle"
        />
      </div>

      <TB icon={ImagePlus} action={() => imageRef.current?.click()} title="Görsel" />
      <TB
        icon={ImageIcon}
        action={onAIImageClick}
        disabled={aiImageLoading}
        title="AI Görsel Ekle"
      />
      <ArticleLinkPicker editor={editor} />

      <Sep />

      {/* Media: YouTube, Video, Audio — inline popover for URL, upload for file */}
      <MediaButton
        icon={Youtube}
        title="YouTube Video"
        label="YouTube Embed"
        placeholder="https://youtube.com/watch?v=..."
        onURL={(url) => editor.commands.setYoutubeVideo({ src: url })}
      />
      <MediaButton
        icon={Video}
        title="Video Ekle"
        label="Video"
        placeholder="https://example.com/video.mp4"
        onURL={(url) => editor.commands.setVideo({ src: url })}
        onUpload={() => videoRef.current?.click()}
      />
      <MediaButton
        icon={AudioLines}
        title="Ses Ekle"
        label="Ses / Müzik"
        placeholder="https://example.com/audio.mp3"
        onURL={(url) => editor.commands.setAudio({ src: url })}
        onUpload={() => audioRef.current?.click()}
      />

      <Sep />

      {/* Color & Highlight */}
      <ColorPicker editor={editor} />
    </div>
  );
}
