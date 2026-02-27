"use client";

import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, Type,
  List, ListOrdered, Quote, Code,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Minus, Link2, ImagePlus, ImageIcon,
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import { ColorPicker } from "./ColorPicker";

// Toolbar button helper
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

interface EditorToolbarProps {
  editor: Editor;
  imageRef: React.RefObject<HTMLInputElement | null>;
  onAIImageClick: () => void;
  aiImageLoading: boolean;
}

export function EditorToolbar({
  editor,
  imageRef,
  onAIImageClick,
  aiImageLoading,
}: EditorToolbarProps) {
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
      <TB
        icon={Link2}
        action={() => {
          const url = window.prompt("URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        active={editor.isActive("link")}
        title="Link"
      />
      <TB icon={ImagePlus} action={() => imageRef.current?.click()} title="Görsel" />
      <TB
        icon={ImageIcon}
        action={onAIImageClick}
        disabled={aiImageLoading}
        title="AI Görsel Ekle"
      />

      <Sep />

      {/* Color & Highlight */}
      <ColorPicker editor={editor} />
    </div>
  );
}
