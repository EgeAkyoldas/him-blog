"use client";

import { motion } from "framer-motion";
import { FileText, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Article {
  id: string;
  slug: string;
  category: string;
  created_at: string;
  title: string;
  status: string;
}

const categoryLabels: Record<string, string> = {
  theory: "Müzik Teorisi",
  instrument: "Enstrüman",
  ear_training: "Kulak Eğitimi",
  sight_reading: "Deşifre",
  performance: "Performans",
  exam_prep: "Sınav Hazırlık",
  other: "Genel",
};

export function ArticlesContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/articles");
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles ?? []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="section-pad bg-surface">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="label mb-3">
            MAKALELER
          </div>
          <h1
            className="text-heading text-[40px] md:text-[52px]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Makaleler
          </h1>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="text-muted text-center py-20">
            Yükleniyor...
          </div>
        ) : articles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card-boutique p-16 text-center"
          >
            <FileText
              size={36}
              className="text-muted mx-auto mb-4"
              strokeWidth={1}
            />
            <p className="text-secondary text-[16px]">Henüz yayınlanmış makale yok.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="card-boutique p-8 no-underline group hover:border-deep-navy dark:hover:border-gold-accent transition-all"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="label text-muted text-[10px] bg-surface-raised dark:bg-surface px-2 py-0.5 micro-radius">
                    {categoryLabels[article.category] ?? article.category}
                  </span>
                </div>

                <h2
                  className="text-heading text-[20px] mb-3 line-clamp-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {article.title}
                </h2>

                <div className="flex items-center justify-between mt-6">
                  <span className="flex items-center gap-1.5 text-[12px] text-muted">
                    <Calendar size={12} />
                    {new Date(article.created_at).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-2 text-muted group-hover:text-deep-navy dark:group-hover:text-gold-accent transition-colors">
                    <span className="text-[12px]">Devamını Oku</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
