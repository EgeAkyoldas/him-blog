"use client";

import { X, FileText, Newspaper, Music2 } from "lucide-react";
import { motion } from "framer-motion";

const TEMPLATES: {
  id: string;
  title: string;
  description: string;
  Icon: typeof FileText;
  html: string;
}[] = [
  {
    id: "blank",
    title: "Boş Makale",
    description: "Temiz bir başlangıç",
    Icon: FileText,
    html: "<p></p>",
  },
  {
    id: "news",
    title: "Haber / Duyuru",
    description: "Müzik dünyasından haberler",
    Icon: Newspaper,
    html: `<h2>Haber Başlığı</h2>
<p><strong>Giriş:</strong> Haberin özeti tek cümlede burada yer alır. En önemli bilgiyi öne çıkarın.</p>
<h3>Detaylar</h3>
<p>Haberin detayları, arka planı ve bağlamı buraya gelir.</p>
<h3>Uzman Görüşü</h3>
<blockquote><p>Müzik eğitimcisi veya sanatçının görüşü buraya gelir.</p></blockquote>
<h3>Sonuç</h3>
<p>Haberin müzik öğrencileri için önemi ve sonraki adımlar.</p>`,
  },
  {
    id: "lesson",
    title: "Müzik Dersi / Analiz",
    description: "Eğitici makale şablonu",
    Icon: Music2,
    html: `<h2>Konu Başlığı</h2>
<p><strong>Özet:</strong> Bu dersin amacı ve öğrenci kazanımları kısaca açıklanır.</p>
<h3>Temel Kavramlar</h3>
<p>Konuyla ilgili teori ve temel bilgiler burada açıklanır.</p>
<h3>Uygulama ve Örnekler</h3>
<p>Pratik alıştırmalar ve müzikal örnekler sunulur.</p>
<ul>
  <li>Birinci alıştırma</li>
  <li>İkinci alıştırma</li>
  <li>Üçüncü alıştırma</li>
</ul>
<h3>Pratik İpuçları</h3>
<p>Öğrenciler için faydalı çalışma önerileri ve ipuçları paylaşılır.</p>
<h3>Özet</h3>
<p>Dersin ana noktaları ve bir sonraki adımlar özetlenir.</p>`,
  },
];

interface TemplateSelectorProps {
  show: boolean;
  onSelect: (html: string) => void;
  onClose: () => void;
}

export function TemplateSelector({ show, onSelect, onClose }: TemplateSelectorProps) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-pure-white card-boutique p-8 w-full max-w-[560px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="label text-muted mb-1">ŞABLON SEÇ</div>
            <h2
              className="text-deep-navy text-[22px]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Nereden başlamak istersiniz?
            </h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-body transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.html)}
              className="group flex items-start gap-4 p-4 border border-border micro-radius text-left hover:border-deep-navy hover:bg-soft-cream/40 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-soft-cream flex items-center justify-center shrink-0 group-hover:bg-deep-navy/10 transition-colors">
                <t.Icon size={18} className="text-secondary group-hover:text-deep-navy transition-colors" />
              </div>
              <div>
                <div className="font-bold text-deep-navy text-[14px]" style={{ fontFamily: "var(--font-heading)" }}>
                  {t.title}
                </div>
                <div className="text-[12px] text-secondary mt-0.5">{t.description}</div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-muted text-center mt-6">
          Daha sonra istediğiniz zaman değiştirebilirsiniz
        </p>
      </motion.div>
    </motion.div>
  );
}
