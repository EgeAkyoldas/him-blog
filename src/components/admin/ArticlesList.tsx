"use client";

import { motion } from "framer-motion";
import { FileText, Plus, Trash2, Edit3, Eye, Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Article {
  id: string;
  slug: string;
  category: string;
  created_at: string;
  tr_title: string | null;
  tr_status: string | null;
  en_title: string | null;
  en_status: string | null;
}

const categoryLabels: Record<string, string> = {
  theory: "Teori",
  instrument: "Enstrüman",
  ear_training: "Kulak Eğitimi",
  sight_reading: "Deşifre",
  performance: "Performans",
  exam_prep: "Sınav Haz.",
  other: "Diğer",
};

export function ArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const loadArticles = async () => {
    try {
      const res = await fetch("/api/v1/admin/articles");
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleDelete = (id: string, title: string) => {
    toast(
      `"${title}" makalesini silmek istediğinize emin misiniz?`,
      {
        duration: 8000,
        action: {
          label: "Evet, Sil",
          onClick: async () => {
            try {
              const res = await fetch(`/api/v1/admin/articles/${id}`, {
                method: "DELETE",
              });
              if (res.ok) {
                setArticles((prev) => prev.filter((a) => a.id !== id));
                toast.success("Makale başarıyla silindi");
              } else {
                toast.error("Silme işlemi başarısız oldu");
              }
            } catch {
              toast.error("Bir hata oluştu");
            }
          },
        },
        cancel: {
          label: "İptal",
          onClick: () => {},
        },
      }
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-10"
      >
        <div>
          <div className="label text-muted mb-1">İÇERİK YÖNETİMİ</div>
          <h1
            className="text-deep-navy text-[28px]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Makaleler
          </h1>
        </div>
        <Link
          href="/admin/articles/new"
          className="btn-primary no-underline flex items-center gap-2"
        >
          <Plus size={14} />
          Yeni Makale
        </Link>
      </motion.div>

      {loading ? (
        <div className="text-muted text-center py-20">Yükleniyor...</div>
      ) : articles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-boutique p-12 text-center"
        >
          <FileText size={32} className="text-muted-slate mx-auto mb-4" strokeWidth={1} />
          <p className="text-secondary text-[14px] mb-6">Henüz makale yok</p>
          <Link
            href="/admin/articles/new"
            className="btn-primary no-underline inline-flex items-center gap-2"
          >
            <Plus size={14} />
            İlk Makaleyi Oluştur
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-3"
        >
          {articles.map((article) => (
            <div
              key={article.id}
              className="card-boutique p-6 flex items-center justify-between group hover:border-deep-navy transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3
                    className="text-deep-navy text-[16px] truncate"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {article.tr_title ?? article.en_title ?? article.slug}
                  </h3>
                  <span className="label text-muted text-[10px] bg-soft-cream px-2 py-0.5 micro-radius shrink-0">
                    {categoryLabels[article.category] ?? article.category}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[12px] text-secondary">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={11} />
                    {new Date(article.created_at).toLocaleDateString("tr-TR")}
                  </span>
                  <span className="flex items-center gap-1">
                    🇹🇷
                    <span className={article.tr_status === "published" ? "text-emerald-600" : "text-amber-500"}>
                      {article.tr_status === "published" ? "Yayında" : article.tr_status ?? "—"}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    🇬🇧
                    <span className={article.en_status === "published" ? "text-emerald-600" : "text-amber-500"}>
                      {article.en_status === "published" ? "Published" : article.en_status ?? "—"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">
                <Link
                  href={`/blog/${article.slug}`}
                  target="_blank"
                  className="p-2 text-muted hover:text-deep-navy transition-colors no-underline"
                  title="Önizle"
                >
                  <Eye size={16} strokeWidth={1.5} />
                </Link>
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="p-2 text-muted hover:text-deep-navy transition-colors no-underline"
                  title="Düzenle"
                >
                  <Edit3 size={16} strokeWidth={1.5} />
                </Link>
                <button
                  onClick={() =>
                    handleDelete(
                      article.id,
                      article.tr_title ?? article.en_title ?? article.slug
                    )
                  }
                  className="p-2 text-muted hover:text-red-500 transition-colors"
                  title="Sil"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
