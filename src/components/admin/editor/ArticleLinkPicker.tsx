"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, Search, X, Loader2 } from "lucide-react";
import type { Editor } from "@tiptap/react";

interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
}

const categoryLabels: Record<string, string> = {
  theory: "Teori",
  instrument: "Enstrüman",
  ear_training: "Kulak",
  sight_reading: "Deşifre",
  performance: "Performans",
  exam_prep: "Sınav",
  other: "Genel",
};

export function ArticleLinkPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Fetch articles on open
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/v1/articles?locale=tr");
        const data = await res.json();
        if (!cancelled) {
          setArticles(data.articles ?? []);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) setLoaded(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [open]);

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const insertLink = (article: Article) => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    const linkText = selectedText || article.title;

    if (selectedText) {
      // Wrap selected text with link
      editor.chain().focus().setLink({ href: `/blog/${article.slug}` }).run();
    } else {
      // Insert linked text at cursor
      editor
        .chain()
        .focus()
        .insertContent(`<a href="/blog/${article.slug}">${linkText}</a>`)
        .run();
    }

    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
        title="Makale Linki Ekle"
        className={`p-1.5 micro-radius transition-all ${
          open
            ? "ring-1 ring-heading/30"
            : "text-secondary hover:bg-surface-raised hover:text-heading"
        }`}
        style={open ? {
          backgroundColor: "var(--color-surface-raised)",
          color: "var(--color-heading)",
          boxShadow: "inset 0 0 0 1px var(--color-border)",
        } : {}}
      >
        <BookOpen size={14} strokeWidth={open ? 2.4 : 1.8} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-[320px] card-boutique shadow-lg z-50"
          style={{ backgroundColor: "var(--color-pure-white)" }}
        >
          {/* Search */}
          <div className="p-2 flex items-center gap-1.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <Search size={12} className="text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Makale ara..."
              className="flex-1 text-[12px] bg-transparent outline-none text-body"
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-muted hover:text-secondary">
                <X size={10} />
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[240px] overflow-y-auto">
            {!loaded ? (
              <div className="flex items-center justify-center gap-2 py-6 text-muted text-[12px]">
                <Loader2 size={14} className="animate-spin" /> Yükleniyor...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-6 text-center text-muted text-[12px]">
                {articles.length === 0 ? "Yayınlanmış makale yok" : "Sonuç bulunamadı"}
              </div>
            ) : (
              filtered.map((article) => (
                <button
                  key={article.id}
                  onClick={() => insertLink(article)}
                  className="w-full text-left px-3 py-2 hover:bg-surface-raised transition-colors flex items-center gap-2"
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-heading font-medium truncate">
                      {article.title}
                    </p>
                    <p className="text-[10px] text-muted truncate">
                      /blog/{article.slug}
                    </p>
                  </div>
                  <span
                    className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 micro-radius shrink-0"
                    style={{ backgroundColor: "var(--color-surface-overlay)", color: "var(--color-text-muted)" }}
                  >
                    {categoryLabels[article.category] ?? article.category}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="px-3 py-1.5 text-[10px] text-muted" style={{ borderTop: "1px solid var(--color-border)" }}>
            💡 Seçili metni varsa, o metin link olarak sarılır
          </div>
        </div>
      )}
    </div>
  );
}
