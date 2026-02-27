"use client";

import {
  BookOpen, PenTool, Languages, Sparkles, Search, Eye,
  Maximize2, Shield, Save, FileText, ImagePlus, Type,
  Bold, List, AlignLeft,
  Link2, Quote, Minus, Keyboard, ChevronDown, Wand2,
  LetterText, Globe, MessageSquare, Monitor,
  Music, ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Section Data ─── */
interface GuideSection {
  id: string;
  icon: typeof BookOpen;
  title: string;
  content: React.ReactNode;
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-7 h-7 rounded-full bg-charcoal text-pure-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
        {n}
      </div>
      <div className="text-[13px] text-body leading-relaxed flex-1">{children}</div>
    </div>
  );
}

function Shortcut({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-b-0">
      <span className="text-[12px] text-secondary">{label}</span>
      <kbd className="px-2 py-0.5 text-[11px] font-mono bg-surface-raised border border-border rounded text-heading">
        {keys}
      </kbd>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: typeof Sparkles; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-pure-white">
      <Icon size={16} className="text-charcoal shrink-0 mt-0.5" />
      <div>
        <div className="text-[13px] font-bold text-heading">{title}</div>
        <div className="text-[12px] text-secondary mt-0.5">{desc}</div>
      </div>
    </div>
  );
}

const sections: GuideSection[] = [
  {
    id: "getting-started",
    icon: BookOpen,
    title: "Başlarken",
    content: (
      <div>
        <p className="text-[13px] text-body mb-4">
          Müzik Blog, müzik eğitimi alanında Türkçe ve İngilizce makale yazmak,
          AI ile içerik üretmek ve SEO optimizasyonu yapmak için tasarlanmış bir içerik yönetim sistemidir.
        </p>
        <Step n={1}>
          Sol menüden <strong>Makaleler</strong>&apos;e tıklayarak mevcut makaleleri görüntüleyin.
        </Step>
        <Step n={2}>
          <strong>Yeni Makale</strong>&apos;ye tıklayarak yeni bir makale oluşturun.
        </Step>
        <Step n={3}>
          Açılan şablon seçiciden bir başlangıç şablonu seçin veya boş başlayın.
        </Step>
        <Step n={4}>
          Başlığı ve kategoriyi girin, içeriğinizi yazın, ardından <strong>Yayınla</strong> butonuna basın.
        </Step>
      </div>
    ),
  },
  {
    id: "article-info",
    icon: FileText,
    title: "Makale Bilgileri",
    content: (
      <div>
        <p className="text-[13px] text-body mb-4">
          Editörün üst kısmındaki kart, makalenin temel bilgilerini içerir:
        </p>
        <div className="space-y-3 mb-4">
          <FeatureCard icon={Type} title="Başlık"
            desc="Makalenizin başlığı. SEO için 50-60 karakter arası ideal. Slug (URL) otomatik oluşur." />
          <FeatureCard icon={List} title="Kategori"
            desc="Müzik Teorisi, Enstrüman, Kulak Eğitimi, Deşifre, Performans, Sınav Hazırlık veya Genel." />
          <FeatureCard icon={ImagePlus} title="Kapak Görseli"
            desc="Her dil için ayrı kapak görseli yüklenebilir. Dosyadan yükleme veya AI ile üretme." />
        </div>
        <p className="text-[12px] text-muted">
          💡 Slug (URL adresi) başlıktan otomatik oluşur, ancak manuel olarak da düzenlenebilir.
        </p>
      </div>
    ),
  },
  {
    id: "languages",
    icon: Languages,
    title: "Çift Dilli İçerik (TR / EN)",
    content: (
      <div>
        <p className="text-[13px] text-body mb-4">
          Her makale Türkçe ve İngilizce olarak ayrı ayrı yazılabilir.
        </p>
        <Step n={1}>
          Editörün sol üstündeki <strong>TR</strong> veya <strong>EN</strong> butonuna tıklayarak dil seçin.
        </Step>
        <Step n={2}>
          Seçtiğiniz dilde başlık, içerik ve kapak görseli girin. Her dil bağımsızdır.
        </Step>
        <Step n={3}>
          Bir dili yayınlayıp diğerini taslak olarak tutabilirsiniz.
        </Step>
        <Step n={4}>
          AI &ldquo;İki Dil&rdquo; butonuyla tek tıkla her iki dilde içerik üretebilirsiniz.
        </Step>
        <p className="text-[12px] text-muted">
          💡 Dil değiştirdiğinizde editör otomatik olarak o dilin kaydedilmiş içeriğini yükler.
        </p>
      </div>
    ),
  },
  {
    id: "editor",
    icon: PenTool,
    title: "Metin Editörü",
    content: (
      <div>
        <p className="text-[13px] text-body mb-4">
          Zengin metin editörü ile profesyonel makaleler yazabilirsiniz. Araç çubuğundaki butonlar:
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <FeatureCard icon={Bold} title="Biçimlendirme" desc="Kalın, İtalik, Altı Çizili, Üstü Çizili" />
          <FeatureCard icon={Type} title="Başlıklar" desc="H1 (ana), H2 (bölüm), H3 (alt bölüm), Paragraf" />
          <FeatureCard icon={List} title="Listeler" desc="Madde işaretli ve numaralı listeler" />
          <FeatureCard icon={AlignLeft} title="Hizalama" desc="Sol, Orta, Sağ, İki Yana (Justify)" />
          <FeatureCard icon={Quote} title="Blok Elemanlar" desc="Alıntı (blockquote) ve Kod bloğu" />
          <FeatureCard icon={Link2} title="Link" desc="Metni seçin → Link butonuna tıklayın → URL girin" />
          <FeatureCard icon={ImagePlus} title="Görsel Yükleme" desc="Dosyadan yükle veya sürükle-bırak" />
          <FeatureCard icon={Minus} title="Ayırıcı Çizgi" desc="Bölümler arasına yatay çizgi ekler" />
        </div>
        <p className="text-[12px] text-muted">
          💡 Görselleri boyutlandırmak için görsele tıklayın ve sağ alt köşedeki tutamağı sürükleyin.
        </p>
      </div>
    ),
  },
  {
    id: "views",
    icon: Eye,
    title: "Görünüm Modları",
    content: (
      <div>
        <p className="text-[13px] text-body mb-4">
          Sağ üstteki butonlarla üç farklı görünüm arasında geçiş yapın:
        </p>
        <div className="space-y-3">
          <FeatureCard icon={PenTool} title="Editör"
            desc="Varsayılan mod. İçeriği düzenleyebilirsiniz. Araç çubuğu görünür." />
          <FeatureCard icon={Eye} title="Önizleme"
            desc="İçeriği son haliyle görüntüleyin. Düzenleme yapılamaz." />
          <FeatureCard icon={Monitor} title="Site Önizleme"
            desc="Makalenizin gerçek sitede nasıl görüneceğini simüle eder. Masaüstü ve mobil (iPhone) görünüm seçenekleri sunar." />
        </div>
        <p className="text-[12px] text-muted mt-3">
          💡 Site Önizleme&apos;de mobil görünümü kontrol edin — okuyucuların büyük kısmı mobilden gelir.
        </p>
      </div>
    ),
  },
  {
    id: "focus",
    icon: Maximize2,
    title: "Odak Modu",
    content: (
      <div>
        <p className="text-[13px] text-body mb-4">
          Dikkat dağıtıcı unsurları kaldırarak yalnızca yazmaya odaklanın.
        </p>
        <Step n={1}>
          Sağ üstteki <strong>⛶</strong> ikonuna tıklayın veya <strong>F11</strong> tuşuna basın.
        </Step>
        <Step n={2}>
          Sidebar, meta alanları ve tüm UI elemanları gizlenir. Sadece yazma alanı kalır.
        </Step>
        <Step n={3}>
          Çıkmak için <strong>Esc</strong> tuşuna basın.
        </Step>
        <p className="text-[12px] text-muted">
          💡 Maksimum 720px genişlikte, rahat bir okuma ve yazma deneyimi sunar.
        </p>
      </div>
    ),
  },
  {
    id: "find-replace",
    icon: Search,
    title: "Bul ve Değiştir",
    content: (
      <div>
        <p className="text-[13px] text-body mb-4">
          İçerik içinde metin arama ve toplu değiştirme yapın.
        </p>
        <Step n={1}>
          <strong>Ctrl+H</strong> kısayolu ile Bul ve Değiştir panelini açın.
        </Step>
        <Step n={2}>
          <strong>Bul</strong> alanına aranacak metni girin. Eşleşme sayısı otomatik gösterilir.
        </Step>
        <Step n={3}>
          <strong>Değiştir</strong> alanına yerine yazılacak metni girin.
        </Step>
        <Step n={4}>
          <strong>Birini Değiştir</strong> ile ilk eşleşmeyi, <strong>Tümünü Değiştir</strong> ile hepsini değiştirin.
        </Step>
        <p className="text-[12px] text-muted">
          💡 &ldquo;Aa Büyük/küçük harf&rdquo; butonu ile büyük-küçük harf duyarlı arama yapabilirsiniz.
        </p>
      </div>
    ),
  },
  {
    id: "ai-panel",
    icon: Sparkles,
    title: "AI Asistan",
    content: (
      <div>
        <p className="text-[13px] text-body mb-4">
          Sağ üstteki <strong>✨ AI</strong> butonuyla AI asistanı açın. 7 hazır aksiyon + özel komut:
        </p>
        <div className="space-y-2 mb-4">
          <FeatureCard icon={Wand2} title="İyileştir"
            desc="Mevcut içeriği profesyonelleştirir. Dil bilgisi düzeltmeleri, ton iyileştirmesi yapar." />
          <FeatureCard icon={FileText} title="Özetle"
            desc="Uzun içeriği 2-3 paragraflık kısa bir özete dönüştürür." />
          <FeatureCard icon={LetterText} title="Genişlet"
            desc="Kısa içeriğe detay, alıştırma önerileri ve müzikal örnekler ekler." />
          <FeatureCard icon={Languages} title="Çevir"
            desc="İçeriği aktif dilden diğer dile profesyonelce çevirir." />
          <FeatureCard icon={Sparkles} title="Üret"
            desc="Sadece başlığı girin — AI tam bir makale yazar." />
          <FeatureCard icon={Globe} title="İki Dil"
            desc="Hem TR hem EN'de makale üretir. Her birini ayrı ayrı uygulayabilirsiniz." />
          <FeatureCard icon={MessageSquare} title="Özel Komut"
            desc="Serbest talimat girin: Tonu daha samimi yap, İlk cümleyi çarpıcı yaz gibi." />
        </div>
        <p className="text-[12px] text-muted">
          💡 AI sonucunu beğendiyseniz &ldquo;Uygula&rdquo; butonu ile editöre aktarın. Beğenmediyseniz tekrar deneyin.
        </p>
      </div>
    ),
  },
  {
    id: "ai-images",
    icon: ImagePlus,
    title: "AI Görsel Üretme",
    content: (
      <div>
        <p className="text-[13px] text-body mb-4">
          AI Panelinden veya araç çubuğundan AI ile görsel oluşturun.
        </p>
        <Step n={1}>
          <strong>Boyut seçin</strong>: 16:9 (yatay), 1:1 (kare), 9:16 (dikey)
        </Step>
        <Step n={2}>
          <strong>Açıklama yazın</strong>: &ldquo;Piyano çalan bir çocuk, sıcak aydınlatma&rdquo; gibi.
        </Step>
        <Step n={3}>
          <strong>Kapak</strong> butonu: Görseli kapak görseli olarak ayarlar.
          <br />
          <strong>İçerik</strong> butonu: Görseli editöre ekler.
        </Step>
        <Step n={4}>
          Tüm üretilen görseller panelde listelenir. Her biri için:
          İçeriğe ekle / Kapak yap / İndir seçenekleri.
        </Step>
      </div>
    ),
  },
  {
    id: "seo",
    icon: Shield,
    title: "SEO Analizi",
    content: (
      <div>
        <p className="text-[13px] text-body mb-4">
          Editörün altındaki SEO paneli makalenizi otomatik analiz eder ve puan verir.
        </p>
        <div className="space-y-2 mb-4">
          <div className="text-[12px] p-2 rounded bg-surface-raised border border-border">
            <strong>Başlık uzunluğu:</strong> 50-60 karakter ideal. Çok kısa veya uzun olmamalı.
          </div>
          <div className="text-[12px] p-2 rounded bg-surface-raised border border-border">
            <strong>Meta açıklama:</strong> 120-155 karakter ideal. AI ile otomatik üretilebilir.
          </div>
          <div className="text-[12px] p-2 rounded bg-surface-raised border border-border">
            <strong>İçerik uzunluğu:</strong> Minimum 300 kelime, ideal 600+ kelime.
          </div>
          <div className="text-[12px] p-2 rounded bg-surface-raised border border-border">
            <strong>Başlık yapısı:</strong> Sayfada 1 H1, 2+ H2 alt başlık önerilir.
          </div>
          <div className="text-[12px] p-2 rounded bg-surface-raised border border-border">
            <strong>Okunabilirlik:</strong> Cümleler ortalama 20 kelimeyi geçmemeli.
          </div>
        </div>
        <Step n={1}>
          Paneli açmak için alt bardaki <strong>SEO İyi/Orta/Zayıf</strong> etiketine tıklayın.
        </Step>
        <Step n={2}>
          Düzeltilebilir sorunlar varsa <strong>&ldquo;AI ile Optimize Et&rdquo;</strong> butonu belirir. Tıklayın — AI otomatik düzeltir.
        </Step>
      </div>
    ),
  },
  {
    id: "saving",
    icon: Save,
    title: "Kaydetme ve Yayınlama",
    content: (
      <div>
        <p className="text-[13px] text-body mb-4">
          Alt bardaki iki butonla içeriğinizi kaydedin veya yayınlayın:
        </p>
        <div className="space-y-3 mb-4">
          <FeatureCard icon={Save} title="Taslak"
            desc="Makaleyi kaydeder ama yayınlamaz. Sadece admin panelde görünür. Yayına hazır olmayan içerikler için." />
          <FeatureCard icon={ArrowRight} title="Yayınla"
            desc="Makaleyi kaydeder ve yayınlar. Public blog sayfasında okuyuculara görünür hale gelir." />
        </div>
        <p className="text-[12px] text-muted mb-2">
          ⏱️ <strong>Oto-kayıt:</strong> Makale düzenlerken otomatik kayıt sistemi çalışır.
          Son kayıt zamanı alt barda gösterilir.
        </p>
        <p className="text-[12px] text-muted">
          💡 <strong>Ctrl+S</strong> ile hızlıca taslak olarak kaydedebilirsiniz.
        </p>
      </div>
    ),
  },
  {
    id: "shortcuts",
    icon: Keyboard,
    title: "Klavye Kısayolları",
    content: (
      <div className="space-y-0">
        <Shortcut keys="Ctrl+B" label="Kalın yazı" />
        <Shortcut keys="Ctrl+I" label="İtalik yazı" />
        <Shortcut keys="Ctrl+U" label="Altı çizili" />
        <Shortcut keys="Ctrl+Z" label="Geri al" />
        <Shortcut keys="Ctrl+Y" label="İleri al" />
        <Shortcut keys="Ctrl+H" label="Bul ve Değiştir" />
        <Shortcut keys="Ctrl+S" label="Taslak olarak kaydet" />
        <Shortcut keys="F11" label="Odak modu aç/kapa" />
        <Shortcut keys="Esc" label="Odak modundan / panelden çık" />
      </div>
    ),
  },
];

/* ─── Expandable Section Component ─── */
function SectionItem({ section, isOpen, onToggle }: {
  section: GuideSection;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = section.icon;
  return (
    <div className="card-boutique overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface-overlay transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center shrink-0">
          <Icon size={16} className="text-charcoal" />
        </div>
        <span className="flex-1 text-[14px] font-bold text-heading">{section.title}</span>
        <ChevronDown
          size={16}
          className={`text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-border">
              {section.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Page ─── */
export default function GuidePage() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["getting-started"]));

  const toggle = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenSections(new Set(sections.map((s) => s.id)));
  const collapseAll = () => setOpenSections(new Set());

  return (
    <div className="max-w-[760px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-charcoal flex items-center justify-center">
            <Music size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-heading text-[24px] font-bold tracking-tight">Editör Rehberi</h1>
            <p className="text-[13px] text-muted">Adım adım nasıl kullanılır</p>
          </div>
        </div>
        <p className="text-[14px] text-secondary leading-relaxed mb-4">
          Bu rehber, blog panelinin tüm özelliklerini adım adım açıklar. Bir bölüme tıklayarak
          detayları görüntüleyin.
        </p>
        <div className="flex gap-2">
          <button onClick={expandAll}
            className="text-[11px] font-bold text-secondary hover:text-charcoal px-3 py-1.5 border border-border rounded-md transition-colors">
            Tümünü Aç
          </button>
          <button onClick={collapseAll}
            className="text-[11px] font-bold text-secondary hover:text-charcoal px-3 py-1.5 border border-border rounded-md transition-colors">
            Tümünü Kapat
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <SectionItem
            key={section.id}
            section={section}
            isOpen={openSections.has(section.id)}
            onToggle={() => toggle(section.id)}
          />
        ))}
      </div>

      {/* Quick tips footer */}
      <div className="mt-8 p-5 card-boutique bg-surface-raised/50">
        <h3 className="text-[13px] font-bold text-heading mb-3">⚡ Hızlı İpuçları</h3>
        <ul className="space-y-2 text-[12px] text-secondary">
          <li>→ <strong>İlk makale:</strong> Başlığı gir → AI &ldquo;Üret&rdquo; butonuyla içerik oluştur → Düzenle → Yayınla</li>
          <li>→ <strong>Çift dilli:</strong> TR&apos;de yaz → AI &ldquo;İki Dil&rdquo; ile EN versiyonunu otomatik oluştur</li>
          <li>→ <strong>SEO:</strong> 600+ kelime, 50-60 char başlık, 2+ H2 başlık, meta description ekle</li>
          <li>→ <strong>Hızlı görsel:</strong> Araç çubuğundaki AI Görsel butonu ile tek tıkla oluştur</li>
          <li>→ <strong>Konsantrasyon:</strong> F11 ile odak moduna geç, sadece yazıya odaklan</li>
        </ul>
      </div>
    </div>
  );
}
