# 🤖 AI Blog Sistemi — Teknik Dokümantasyon

Bu doküman, blog sistemimizdeki AI entegrasyonunun tam teknik haritasıdır.  
Prompt yapılarını, data flow'u, fonksiyonları ve pipeline'ları detaylı açıklar.

---

## 📁 Dosya Haritası

```
src/
├── config/
│   └── ai-prompts.yaml          ← TÜM AI promptları (metin + görsel)
├── lib/
│   └── ai-prompts.ts            ← YAML loader + {variable} interpolation
├── app/api/v1/admin/
│   ├── ai-assist/route.ts       ← Metin AI endpoint (Gemini API)
│   ├── ai-image/route.ts        ← Görsel AI endpoint (Gemini Image)
│   └── verify-url/route.ts      ← URL doğrulama (HEAD/GET request)
├── components/admin/
│   ├── hooks/
│   │   └── useAIAssistant.ts    ← Tüm AI logic — 3 ana pipeline
│   ├── editor/
│   │   ├── AIPanel.tsx          ← AI sidebar UI (butonlar, sonuçlar)
│   │   └── constants.ts         ← aiActions dizisi (buton listesi)
│   └── ArticleEditor.tsx        ← Ana editor — her şeyi birbirine bağlar
└── types/index.ts               ← AIAction type tanımı
```

---

## 🔧 Altyapı Katmanı

### `ai-prompts.ts` — YAML Loader

```typescript
loadAIPrompts()    → YAML dosyasını okur, parse eder, cache'ler
interpolate(template, vars)  → {key} pattern'lerini değerlerle değiştirir
```

**Cache**: `_cached` değişkeni — bir kez okunur, process boyunca aynı kalır.  
**Sorun**: Hot reload sırasında prompt değişiklikleri yansımaz (server restart gerekir).

### `ai-assist/route.ts` — Metin AI Endpoint

```
POST /api/v1/admin/ai-assist
Body: { action, content?, title?, language?, prompt?, seoIssues? }
```

**Çalışma prensibi:**
1. `buildPrompt(body)` → action'a göre YAML template'i seçer
2. `interpolate()` ile değişkenleri doldurur
3. Gemini API'ye gönderir: `system_instruction` + `prompt`
4. `auto_blog` ve `blog_ready` action'larında `googleSearch` tool etkinleşir
5. Grounding metadata varsa `groundingChunks` olarak döner

**Gemini Config:**
```json
{
  "temperature": 0.7,
  "topP": 0.9,
  "maxOutputTokens": 8192
}
```

### `ai-image/route.ts` — Görsel AI Endpoint

```
POST /api/v1/admin/ai-image
Body: { prompt, articleSlug, aspectRatio, articleTitle?, articleContext? }
```

**Çalışma prensibi:**
1. `image_prompt` YAML template'ini yükler
2. `{prompt}`, `{article_title}`, `{article_context}`, `{dimension}` ile interpolate eder
3. Gemini `responseModalities: ["TEXT", "IMAGE"]` ile çağırır
4. Base64 image → Supabase Storage'a upload → public URL döner

### `verify-url/route.ts` — Link Doğrulama

```
GET /api/v1/admin/verify-url?url=https://...
Response: { alive: boolean, status?: number }
```

HEAD request (4s timeout) → 405/403 ise GET fallback.

---

## 📋 YAML Prompt Yapısı

### Genel Bölümler

| Bölüm | Amaç |
|-------|------|
| `persona` | AI karakteri tanımı (isim, rol, uzmanlık) — şu an kullanılmıyor |
| `system_instruction` | Her Gemini çağrısına eklenen system prompt |
| `actions.*` | Metin action promptları (9 adet) |
| `image_prompt` | Görsel üretim prompt template'i |

### `system_instruction`

Her API çağrısında `system_instruction` olarak Gemini'ye gönderilir.  
İçerik: müzik eğitimi editörü kimliği, HTML formatı kuralları, ton yönergeleri.

**Kullanıldığı yer:** `ai-assist/route.ts` → `geminiBody.system_instruction`

---

## 🎬 Action Promptları (9 Adet)

Her biri `useAIAssistant.ts → callAI()` fonksiyonu üzerinden çağrılır:

### 1. `improve`
**Tetikleyen:** AIPanel → "İyileştir" butonu → `callAI("improve")`  
**Değişkenler:** `{language}`, `{content}`  
**İş:** Mevcut metni iyileştirir — dil, terminoloji, akış düzeltir  
**Sonuç:** `aiResult` state'ine yazılır → kullanıcı "Uygula" der

### 2. `expand`
**Tetikleyen:** AIPanel → "Genişlet" butonu → `callAI("expand")`  
**Değişkenler:** `{language}`, `{content}`  
**İş:** Metni detaylandırır, örnekler ekler  

### 3. `summarize`
**Tetikleyen:** AIPanel → "Özetle" butonu → `callAI("summarize")`  
**Değişkenler:** `{language}`, `{content}`  
**İş:** 2-3 paragraf özet çıkarır  

### 4. `translate`
**Tetikleyen:** AIPanel → "Çevir" butonu → `callAI("translate")`  
**Değişkenler:** `{target_language}`, `{content}`  
**İş:** Diğer dile çeviri yapar  

### 5. `generate`
**Tetikleyen:** AIPanel → "Üret" butonu → `callAI("generate")`  
**Değişkenler:** `{title}`, `{language}`  
**İş:** Başlıktan sıfırdan makale yazar  

### 6. `bilingual`
**Tetikleyen:** AIPanel → "İki Dil" butonu → `callAI("bilingual")`  
**Değişkenler:** `{title}`  
**İş:** TR + EN JSON döner → `bilingualResult` state'ine yazılır  
**Format:** `{"tr": "<html>", "en": "<html>"}`

### 7. `seo_optimize`
**Tetikleyen:** `handleSEOOptimize()` → SEO panel "otomatik düzelt"  
**Değişkenler:** `{seo_issues}`, `{content}`  
**İş:** Tespit edilen SEO sorunlarını düzeltir  

### 8. `blog_ready` ⭐
**Tetikleyen:** AIPanel → "Blog Hazırla" butonu → `generateBlogReady()`  
**Değişkenler:** `{language}`, `{content}`  
**Google Search:** ✅ Etkin  
**İş:** Mevcut metin içeriğini DEĞİŞTİRMEDEN blog yapısına dönüştürür  
**Prompt talimatları:**
- h2/h3 başlık yapısı ekle
- Paragrafları `<p>` ile sar  
- Önemli terimleri `<strong>` ile vurgula
- Web'den kaynak ara, `<sup>[1]</sup>` ile referans ekle
- `[SOURCES]` bloğu oluştur (Title | URL formatı)
- `[CATEGORY: ...]` etiketi koy
- `[IMAGE: desc | SIZE: boyut]` placeholder'ları ekle

**Post-processing pipeline** (aşağıda detaylı):

### 9. `custom`
**Tetikleyen:** AIPanel → "Özel" butonu + serbest prompt → `callAI("custom")`  
**Değişkenler:** `{prompt}`, `{content}`  
**İş:** Kullanıcının yazdığı serbest prompt ile çağrı yapar  
**Ayrıca kullanılır:** SEO slug üretimi, SEO meta üretimi, keyword çıkarma (auto_blog/blog_ready pipeline'ından)

---

## 🚀 Pipeline: `auto_blog` (Tam Otomatik Blog)

**Tetikleyen:** AIPanel → "Auto Blog Üret" butonu → `generateAutoBlog(topic)`  
**YAML prompt:** `actions.auto_blog`  
**Google Search:** ✅ Etkin  

### Prompt Talimatları
- Verilen `{title}` konusunda 800-1200 kelime makale üret
- HTML formatı zorunlu
- İç link VERME (kendi bloglarına)
- `[SOURCES]` bloğu: Title | URL formatı, en az 3, en fazla 6
- `[CATEGORY: ...]` etiketi
- `[IMAGE: desc | SIZE: boyut]` placeholder'ları (3-4 adet)

### Post-Processing Adımları

```
1. AI metin üret (Gemini + Google Search grounding)
   ↓
2. [CATEGORY: value] → form.setCategory() + HTML'den temizle
   ↓
3. İlk <h1>/<h2> → form.setTitle() (başlık)
   ↓
4. AI'dan SEO slug üret (custom prompt ile ayrı çağrı)
   → "Sadece slug döndür, başka bir şey yazma"
   → cleanup: lowercase, Türkçe karakter sil, 3-6 kelime
   ↓
5. [SOURCES]...[/SOURCES] parse et
   → "Title | URL" formatı → parsedSources[]
   → Gemini groundingChunks[] ile merge (deduplicate by URL)
   ↓
6. Her kaynak URL'yi /api/v1/admin/verify-url ile kontrol et
   → alive=true → normal <a> link
   → alive=false → üstü çizili + ⚠️ uyarı
   → <footer class="article-references"> olarak HTML'e ekle
   ↓
7. [IMAGE: desc | SIZE: boyut] placeholder'ları bul
   → Her biri için /api/v1/admin/ai-image çağır
   → articleTitle + articleContext geçir (tutarlı görsel serisi için)
   → İlk görsel = landscape (kapak adayı)
   → Supabase'e upload, public URL al
   → Placeholder → <img> TAG ile değiştir (float layout)
   ↓
8. İlk görseli kapak olarak set et → images.setThumbnail()
   ↓
9. editor.commands.setContent(html) → editöre yaz
   ↓
10. SEO meta açıklama üret (custom prompt, max 155 karakter)
    → setSeoMeta() + form.setMetaDescription()
   ↓
11. Anahtar kelimeler çıkar (custom prompt, 5-8 tag)
    → setAutoTags()
```

**State değişkenleri:**
- `autoBlogLoading` → loading spinner
- `autoBlogProgress` → progress mesajı ("Görsel üretiliyor 2/4...")
- `autoBlogIncludeImages` → checkbox (görseller dahil mi?)

---

## 📝 Pipeline: `blog_ready` (İçeriği Blog Formatlama)

**Tetikleyen:** AIPanel → "Blog Hazırla" butonu → `generateBlogReady()`  
**YAML prompt:** `actions.blog_ready`  
**Google Search:** ✅ Etkin  

**Ana fark auto_blog'dan:** İçerik sıfırdan **üretilmez**, mevcut editör içeriği AI'ya gönderilir ve **yapısal olarak** formatlanır. İçeriğin anlamı korunur.

**Pipeline:** auto_blog ile **aynı post-processing adımları** (yukarıdaki 2-11):
- Kategori çıkarma
- Başlık çıkarma (ilk h2'den)
- SEO slug üretme
- Kaynak parse + URL doğrulama
- Görsel üretimi + kapak set
- SEO meta üretme
- Keyword çıkarma

---

## 🖼️ Görsel Üretimi

### `image_prompt` Template

```yaml
image_prompt: |
  ARTICLE CONTEXT:
  - Article: "{article_title}"
  - Theme: {article_context}

  VISUAL REQUIREMENTS:
  - The image must directly illustrate: {prompt}
  - Style: Clean editorial photography
  - Color palette: cream, amber, deep brown, muted gold
  - Mood: Educational, inviting, professional
  - NO text, NO watermarks, photorealistic only

  CONSISTENCY RULE:
  Same color temperature, same lighting style, same photographic approach.

  FORMAT: Generate in {dimension}.
```

### Görsel çağrı fonksiyonları (useAIAssistant.ts):

| Fonksiyon | Ne zaman | articleTitle | articleContext |
|-----------|----------|-------------|--------------|
| `generateAIImage()` | Kapak görseli | `title` param | Sabit: "article about {title}" |
| `insertAIImage()` | İçerik görseli | `imagePromptText` | Sabit: "about {prompt}" |
| auto_blog loop | Pipeline sırasında | Çıkarılan `articleTitle` | `"Image #{i} in article titled '{title}'"` |
| blog_ready loop | Pipeline sırasında | Çıkarılan `articleTitle` | `"Image #{i} for blog-ready article"` |

### Görsel yerleşim (buildImageHtml):
- **İlk görsel (i=0):** `<img>` tam genişlik, block
- **Sonraki görseller:** Float layout (sol/sağ dönüşümlü)
  - landscape/square: %45 genişlik
  - portrait: %35 genişlik

---

## 🔄 Basit AI Action Akışı (improve, expand, summarize, vb.)

```
Kullanıcı → AIPanel butonu tıklar
  → onCallAI(action)
    → ArticleEditor → ai.callAI(action, title, language)
      → useAIAssistant.callAI()
        → POST /api/v1/admin/ai-assist { action, content: editor.getHTML(), title, language }
          → buildPrompt() → YAML template + interpolate
            → Gemini API
              → response.result
                → setAiResult(text) → AIPanel'de gösterilir
                  → Kullanıcı "Uygula" → editor.commands.setContent(text)
```

---

## 📊 State Yönetimi (useAIAssistant Hook)

| State | Tip | Açıklama |
|-------|-----|----------|
| `aiOpen` | boolean | AI panel açık mı |
| `aiLoading` | boolean | Basit AI action loading |
| `aiResult` | string\|null | AI sonucu (improve, expand vb.) |
| `bilingualResult` | {tr, en}\|null | İki dil sonucu |
| `customPrompt` | string | Özel prompt metni |
| `aiImageLoading` | boolean | Görsel üretim loading |
| `imagePromptText` | string | Görsel prompt input değeri |
| `aiImageSize` | landscape\|portrait\|square | Seçili boyut |
| `generatedImages` | string[] | Üretilen görsel URL'leri galerisi |
| `seoMeta` | string\|null | Üretilen SEO meta açıklama |
| `seoLoading` | boolean | SEO meta loading |
| `autoBlogLoading` | boolean | Auto Blog / Blog Ready loading |
| `autoBlogProgress` | string | Pipeline ilerleme mesajı |
| `autoBlogIncludeImages` | boolean | Görsel dahil checkbox |
| `autoTags` | string[] | Çıkarılan keyword/tag listesi |

---

## ⚠️ Bilinen Kısıtlamalar ve İyileştirme Alanları

1. **Prompt cache**: YAML bir kez okunup cache'leniyor. Dev modda prompt değiştirince server restart gerekir.

2. **Sıralı görsel üretimi**: Görseller sıralı (sequential) üretiliyor — paralel olabilir.

3. **Source parsing kırılganlığı**: AI her zaman "Title | URL" formatında dönmüyor. Bazen URL'siz satırlar geliyor, bunlar atlanıyor.

4. **Context aktarımı**: `articleContext` genellikle sabit string — makale içeriğinden dinamik bir özet çıkarılabilir.

5. **system_instruction**: Tüm action'lar için aynı system instruction kullanılıyor. Action'a özel system prompt desteği yok.

6. **Temperature sabit**: 0.7 tüm action'lar için. Creative (generate) vs analytic (summarize) farklı olabilir.

7. **Grounding chunks**: Gemini'nin döndürdüğü `groundingChunks` ile AI içinde ürettiği `[SOURCES]` bloğu arasında sıklıkla çakışma oluyor. Dedup var ama bazen aynı kaynağın farklı URL'leri gelir.

8. **Hata kurtarma**: Pipeline'ın herhangi bir adımı başarısız olursa sonraki adımlar hâlâ çalışır ama hata sessizce loglanır.

9. **Token limiti**: `maxOutputTokens: 8192` — uzun makaleler kesiliyor olabilir.

10. **Görsel prompt dili**: Görsel prompt İngilizce ama blog Türkçe. AI bazen Türkçe kelimeler üretiyor, bu görsel kalitenizi etkiler.
