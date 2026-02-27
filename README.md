# 🎵 HIM Blog — Müzik Eğitimi İçerik Yönetim Sistemi

AI destekli, çift dilli (TR/EN) müzik eğitimi blog platformu. Zengin metin editörü, otomatik SEO analizi, AI içerik üretimi ve görsel oluşturma özellikleriyle donatılmış modern bir CMS.

---

## ✨ Özellikler

- **AI Destekli Editör** — Gemini API ile içerik üretme, iyileştirme, çeviri, özetleme ve SEO optimizasyonu
- **Çift Dilli İçerik** — Her makale bağımsız Türkçe ve İngilizce versiyonlarla yönetilir
- **Zengin Metin Editörü** — TipTap tabanlı, Word benzeri düzenleme deneyimi
- **AI Görsel Üretimi** — Imagen API ile kapak ve içerik görseli oluşturma
- **SEO Verifier** — Gerçek zamanlı SEO analizi ve otomatik optimizasyon
- **Site Önizleme** — Masaüstü ve mobil görünümde canlı önizleme
- **Odak Modu** — Dikkat dağıtmayan yazma ortamı (F11)
- **Şablon Sistemi** — Boş makale, haber/duyuru ve analiz şablonları
- **Sürükle-Bırak** — Doğrudan editöre görsel sürükleme desteği
- **Boyutlandırılabilir Görseller** — Editör içinde görsel boyutlandırma
- **Bul ve Değiştir** — Gelişmiş arama ve değiştirme (Ctrl+H)
- **Oto-Kayıt** — Otomatik taslak kaydetme sistemi
- **YAML Tabanlı AI Config** — AI karakter ve prompt yapılandırması dosya üzerinden yönetilir

---

## 🛠 Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| **Framework** | Next.js 16 |
| **UI** | React 19, Tailwind CSS v4 |
| **Editör** | TipTap v3 (ProseMirror) |
| **Backend** | Supabase (Auth, Storage, Database) |
| **ORM** | Drizzle ORM |
| **AI** | Google Gemini API, Imagen API |
| **Animasyon** | Framer Motion |
| **İkonlar** | Lucide React |
| **Bildirimler** | Sonner |
| **Validasyon** | Zod v4 |
| **Dil** | TypeScript 5 |

---

## 📁 Proje Yapısı

```
src/
├── app/
│   ├── admin/           # Admin panel sayfaları
│   │   └── articles/    # Makale yönetimi (liste, yeni, düzenle)
│   ├── api/v1/          # REST API endpoint'leri
│   │   ├── admin/       # Admin API (auth, articles CRUD)
│   │   └── articles/    # Public articles API
│   └── articles/        # Public blog sayfaları
├── components/
│   ├── admin/           # Admin bileşenleri
│   │   ├── editor/      # Editör bileşenleri
│   │   │   ├── AIPanel.tsx              # AI asistan paneli
│   │   │   ├── EditorToolbar.tsx        # Araç çubuğu
│   │   │   ├── SEOVerifier.tsx          # SEO analiz paneli
│   │   │   ├── SitePreview.tsx          # Site önizleme
│   │   │   ├── ColorPicker.tsx          # Renk seçici
│   │   │   ├── FindReplaceBar.tsx       # Bul ve değiştir
│   │   │   ├── TemplateSelector.tsx     # Şablon seçici
│   │   │   ├── ResizableImageView.tsx   # Boyutlandırılabilir görsel
│   │   │   ├── AIImagePromptBar.tsx     # AI görsel prompt barı
│   │   │   └── EditorFooter.tsx         # Alt bilgi çubuğu
│   │   ├── hooks/       # Custom React hook'ları
│   │   ├── ArticleEditor.tsx            # Ana editör bileşeni
│   │   └── ArticlesList.tsx             # Makale listesi
│   └── articles/        # Public makale bileşenleri
├── config/
│   └── ai-prompts.yaml  # AI karakter & prompt yapılandırması
├── lib/
│   ├── supabase.ts      # Supabase client
│   ├── auth.ts          # Auth yardımcıları
│   ├── ai-prompts.ts    # YAML prompt loader
│   └── db/              # Drizzle veritabanı şeması
└── types/               # TypeScript tip tanımları
```

---

## 🚀 Kurulum

### Ön Gereksinimler

- Node.js 18+
- npm veya yarn
- Supabase hesabı
- Google Gemini API anahtarı

### Adımlar

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Ortam değişkenlerini ayarla
cp .env.example .env.local

# 3. Geliştirme sunucusunu başlat
npm run dev
```

### Ortam Değişkenleri

`.env.local` dosyasında aşağıdaki değişkenleri tanımlayın:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
ADMIN_PASSWORD=your_admin_password
```

---

## 📖 Kullanım

Detaylı kullanım kılavuzu için [GUIDE.md](./GUIDE.md) dosyasına bakınız.

### Hızlı Başlangıç

1. `http://localhost:3000` adresine gidin (otomatik olarak admin paneline yönlendirilir)
2. Admin şifresiyle giriş yapın
3. **Yeni Makale** butonuna tıklayın
4. Şablon seçin veya boş başlayın
5. Başlığı girin → AI ile içerik üretin veya manuel yazın
6. **Yayınla** butonuyla makaleyi canlıya alın

### Klavye Kısayolları

| Kısayol | İşlev |
|---------|-------|
| `Ctrl+B` | Kalın |
| `Ctrl+I` | İtalik |
| `Ctrl+U` | Altı çizili |
| `Ctrl+S` | Kaydet |
| `Ctrl+H` | Bul ve Değiştir |
| `F11` | Odak Modu |
| `Esc` | Modu kapat |

---

## 🔌 API Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/v1/admin/login` | Admin girişi |
| `GET` | `/api/v1/admin/articles` | Tüm makaleleri listele |
| `POST` | `/api/v1/admin/articles` | Yeni makale oluştur |
| `PUT` | `/api/v1/admin/articles/[id]` | Makale güncelle |
| `DELETE` | `/api/v1/admin/articles/[id]` | Makale sil |
| `GET` | `/api/v1/articles` | Public makale listesi |
| `GET` | `/api/v1/articles/[slug]` | Tekil makale |

---

## 🤖 AI Yapılandırması

AI karakter ve prompt yapılandırması `src/config/ai-prompts.yaml` dosyasından yönetilir. Bu dosyayı düzenleyerek:

- AI asistanın kişiliğini ve uzmanlık alanını değiştirebilirsiniz
- Farklı aksiyonlar için prompt şablonlarını özelleştirebilirsiniz
- Görsel üretme prompt'larını güncelleyebilirsiniz

---

## 📜 Lisans

Bu proje özel kullanım için geliştirilmiştir.
