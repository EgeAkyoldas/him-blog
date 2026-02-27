# 🎵 Müzik Blog — Editör Rehberi

Bu rehber, blog yönetim panelini kullanarak makale yazmak, düzenlemek ve yayınlamak isteyen içerik editörleri için hazırlanmıştır.

---

## İçindekiler

1. [Giriş ve Genel Bakış](#1-giriş-ve-genel-bakış)
2. [Makale Listesi](#2-makale-listesi)
3. [Yeni Makale Oluşturma](#3-yeni-makale-oluşturma)
4. [Şablon Seçici](#4-şablon-seçici)
5. [Makale Bilgileri Alanı](#5-makale-bilgileri-alanı)
   - 5.1 Dil Seçimi (TR / EN)
   - 5.2 Başlık
   - 5.3 Slug (URL)
   - 5.4 Kategori
   - 5.5 Kapak Görseli
6. [Metin Editörü (TipTap)](#6-metin-editörü-tiptap)
   - 6.1 Araç Çubuğu
   - 6.2 Biçimlendirme
   - 6.3 Başlık Seviyeleri
   - 6.4 Listeler ve Blok Elemanlar
   - 6.5 Metin Hizalama
   - 6.6 Link Ekleme
   - 6.7 Görsel Ekleme
   - 6.8 AI Görsel Ekleme
   - 6.9 Sürükle-Bırak Görsel
   - 6.10 Görsel Boyutlandırma
7. [Görünüm Modları](#7-görünüm-modları)
   - 7.1 Editör Modu
   - 7.2 Önizleme Modu
   - 7.3 Site Önizleme
8. [Odak Modu](#8-odak-modu)
9. [Bul ve Değiştir](#9-bul-ve-değiştir)
10. [AI Asistan Paneli](#10-ai-asistan-paneli)
    - 10.1 İyileştir
    - 10.2 Özetle
    - 10.3 Genişlet
    - 10.4 Çevir
    - 10.5 Üret (Başlıktan Yaz)
    - 10.6 İki Dil (TR + EN)
    - 10.7 Özel Komut
    - 10.8 AI Görsel Üretme
    - 10.9 SEO Meta Açıklama Üretme
11. [Kaydetme ve Yayınlama](#11-kaydetme-ve-yayınlama)
12. [SEO Paneli](#12-seo-paneli)
    - 12.1 SEO Skoru
    - 12.2 SEO Kontroller
    - 12.3 AI ile SEO Optimizasyonu
13. [İstatistikler](#13-istatistikler)
14. [Klavye Kısayolları](#14-klavye-kısayolları)
15. [Kategoriler](#15-kategoriler)
16. [Public Blog Sayfaları](#16-public-blog-sayfaları)

---

## 1. Giriş ve Genel Bakış

Müzik Blog, müzik eğitimi alanında Türkçe ve İngilizce makale yazmak için tasarlanmış bir içerik yönetim sistemidir.

**Ne yapabilirsiniz:**
- Zengin metin editörü ile profesyonel makaleler yazabilirsiniz
- AI destekli içerik üretme, çeviri ve SEO optimizasyonu yapabilirsiniz
- Türkçe ve İngilizce içerik aynı makalede ayrı ayrı yönetilir
- AI ile otomatik kapak görseli ve içerik görseli üretebilirsiniz
- SEO analizi ile Google'da daha iyi sıralama için içeriğinizi optimize edebilirsiniz

**Erişim:**
- Ana panel: `/admin/articles`
- Yeni makale: `/admin/articles/new`
- Public blog: `/articles`

---

## 2. Makale Listesi

`/admin/articles` adresinden tüm makalelerinizi görebilirsiniz.

**Listede gördükleriniz:**
- Makale başlığı
- Kategori etiketi
- Oluşturulma tarihi
- **TR durumu**: Taslak veya Yayında
- **EN durumu**: Taslak veya Yayında

**Yapabilecekleriniz:**
- **Düzenle**: Bir makaleye tıklayarak düzenleme sayfasına gidin
- **Sil**: Çöp kutusu ikonuna tıklayarak makaleyi silin (onay alınır)
- **Yeni Makale**: Sağ üstteki "Yeni Makale" butonuna tıklayın

---

## 3. Yeni Makale Oluşturma

`/admin/articles/new` adresine gidin veya sidebar'dan "Yeni Makale" linkine tıklayın.

İlk açılışta şablon seçici karşınıza çıkar.

---

## 4. Şablon Seçici

Yeni makale oluşturduğunuzda otomatik olarak açılır. Üç seçenek sunar:

| Şablon | Açıklama |
|--------|----------|
| **Boş Makale** | Sıfırdan temiz bir başlangıç |
| **Haber / Duyuru** | 5N1K yapısı: Giriş (Lede), Gelişme, Alıntı, Sonuç bölümleri |
| **Analiz** | Bölümlü yapı: Özet, Arka Plan, Değerlendirme, Pratik Sonuçlar, Sonuç |

Bir şablon seçtikten sonra editöre o yapı otomatik olarak yüklenir. İstediğiniz zaman içeriği silip baştan yazabilirsiniz.

> 💡 Şablonu kapatmak için dışına tıklayın veya X butonuna basın.

---

## 5. Makale Bilgileri Alanı

Editörün üst kısmındaki kart, makalenin temel bilgilerini içerir.

### 5.1 Dil Seçimi (TR / EN)

Editörün sol üstünde **TR** ve **EN** butonları bulunur.

- **TR'ye tıklayın**: Türkçe başlık, içerik ve kapak görseli düzenlersiniz
- **EN'ye tıklayın**: İngilizce başlık, içerik ve kapak görseli düzenlersiniz

Her dil için ayrı içerik, ayrı başlık, ayrı kapak görseli ve ayrı meta açıklaması girilir. Diller birbirinden bağımsızdır — birini yayınlayıp diğerini taslak olarak tutabilirsiniz.

> 💡 Dil değiştirdiğinizde editör otomatik olarak o dilin kaydedilmiş içeriğini yükler.

### 5.2 Başlık

"Makale başlığı..." yazan alana makalenizin başlığını girin.

- Başlığı yazarken **slug otomatik oluşur** (URL-friendly format)
- SEO açısından **50-60 karakter arası** ideal uzunluktur
- Her dil için farklı başlık girebilirsiniz

### 5.3 Slug (URL)

Başlık yazıldığında otomatik oluşur. Örnek:
- Başlık: "Piyano Çalışma Teknikleri" → Slug: `piyano-calisma-teknikleri`

Manuel olarak da değiştirebilirsiniz. Slug, makalenizin URL'sini belirler:
`/articles/piyano-calisma-teknikleri`

### 5.4 Kategori

Açılır menüden makalenizin kategorisini seçin. Seçenekler:

| Kategori | Açıklama |
|----------|----------|
| Müzik Teorisi | Nota okuma, armoni, akor yapıları |
| Enstrüman | Piyano, gitar, keman ve diğer enstrümanlar |
| Kulak Eğitimi | Aralık tanıma, dikte, işitsel beceriler |
| Deşifre | İlk bakışta nota okuma teknikleri |
| Performans | Sahne performansı, konser hazırlığı |
| Sınav Hazırlık | ABRSM, Trinity ve diğer sınav süreçleri |
| Genel | Yukarıdaki kategorilere girmeyen konular |

### 5.5 Kapak Görseli

Her dil için ayrı kapak görseli yüklenebilir. Aktif dil etiketi görselin üstünde gösterilir.

**Görsel yükleme yolları:**
1. **Manuel yükleme**: "Kapak görseli yükle" alanına tıklayın, bilgisayarınızdan bir görsel seçin
2. **AI ile üretme**: AI Panelini açın → "Kapak" butonuna tıklayın (bkz. AI Asistan bölümü)

**Yüklenen görselle yapabilecekleriniz:**
- **Değiştir**: Görselin üzerine gelin → "Değiştir" butonu belirir
- **Kaldır**: Görselin üzerine gelin → "Kaldır" butonu belirir

---

## 6. Metin Editörü (TipTap)

Alt kısımdaki büyük alan zengin metin editörüdür. Microsoft Word benzeri bir deneyim sunar.

### 6.1 Araç Çubuğu

Editörün üstünde sabit duran araç çubuğu şu butonları içerir (soldan sağa):

### 6.2 Biçimlendirme

| Buton | İşlev | Kısayol |
|-------|-------|---------|
| **B** | Kalın yazı | `Ctrl+B` |
| *I* | İtalik yazı | `Ctrl+I` |
| **U** | Altı çizili | `Ctrl+U` |
| ~~S~~ | Üstü çizili | — |

Metni seçin, ardından ilgili butona tıklayın veya kısayolu kullanın.

### 6.3 Başlık Seviyeleri

| Buton | İşlev |
|-------|-------|
| H1 | Ana başlık (sayfada bir tane olmalı) |
| H2 | Alt başlık (bölüm başlıkları) |
| H3 | Alt-alt başlık |
| ¶ | Normal paragraf (başlığı paragrafa çevirmek için) |

> ⚠️ SEO için sayfada **sadece 1 adet H1** kullanmanız önerilir. Bölüm ayırmak için H2 kullanın.

### 6.4 Listeler ve Blok Elemanlar

| Buton | İşlev |
|-------|-------|
| • Liste | Madde işaretli liste |
| 1. Liste | Numaralı liste |
| " Alıntı | Blockquote — vurgulamak istediğiniz alıntılar için |
| `<>` Kod | Kod bloğu — teknik içerik paylaşmak için |

### 6.5 Metin Hizalama

| Buton | İşlev |
|-------|-------|
| Sol | Sola hizala (varsayılan) |
| Orta | Ortala |
| Sağ | Sağa hizala |
| İki Yana | Her iki tarafa hizala (justify) |

### 6.6 Link Ekleme

1. Linke dönüştürmek istediğiniz metni seçin
2. Araç çubuğundaki 🔗 Link ikonuna tıklayın
3. Açılan pencereye URL'yi yapıştırın
4. Tamam'a tıklayın

### 6.7 Görsel Ekleme (Dosyadan)

Araç çubuğundaki **Görsel** (📷) ikonuna tıkladığınızda bilgisayarınızdan bir görsel seçebilirsiniz. Görsel otomatik olarak Supabase'e yüklenir ve içeriğe eklenir.

### 6.8 AI Görsel Ekleme

Araç çubuğundaki **AI Görsel** (🖼️) ikonuna tıklayın. Açılan prompt barına istediğiniz görselin açıklamasını yazın ve boyut seçin (16:9, 1:1, 9:16). "Oluştur" butonuna basın. AI otomatik olarak görsel üretir ve editöre ekler.

### 6.9 Sürükle-Bırak Görsel

Bilgisayarınızdan bir görsel dosyasını doğrudan editör alanının üzerine sürükleyip bırakabilirsiniz. Otomatik olarak yüklenir ve eklenir.

### 6.10 Görsel Boyutlandırma

Editöre eklenen görseller boyutlandırılabilir:
- Görselin üzerine tıklayın (mavi çerçeve belirir)
- Sağ alt köşedeki tutamağı sürükleyerek boyutunu ayarlayın

---

## 7. Görünüm Modları

Sağ üstteki **Editör / Önizleme / Site** butonları ile görünüm değiştirilir.

### 7.1 Editör Modu

Varsayılan mod. İçeriği düzenleme yapabilirsiniz. Araç çubuğu görünür.

### 7.2 Önizleme Modu

İçeriği son haliyle görüntüleyin. Düzenleme yapılamaz ama nasıl görüneceğini kontrol edebilirsiniz.

### 7.3 Site Önizleme

Makalelerinizin gerçek sitede nasıl görüneceğini simüle eder. İki cihaz seçeneği sunar:

- **Masaüstü**: Tam genişlikte tarayıcı görünümü
- **Mobil**: iPhone boyutunda telefon çerçevesi içinde görünüm

> 💡 Bu mod ile makalenizin mobilde nasıl göründüğünü kontrol etmeniz önerilir.

Geri dönmek için sol üstteki "← Editöre Dön" butonuna tıklayın.

---

## 8. Odak Modu

Sağ üstteki **⛶** (genişlet) ikonuna tıklayın veya **F11** tuşuna basın.

Odak modu:
- Tüm ekranı editöre ayırır
- Sidebar, meta alanları ve diğer UI elemanları gizlenir
- Sadece yazma alanı kalır — dikkat dağıtıcı unsurlar yok
- Maksimum 720px genişlikle rahat okuma deneyimi

Çıkmak için **Esc** tuşuna basın.

---

## 9. Bul ve Değiştir

`Ctrl+H` kısayolu ile açın. Alanlar:

| Alan | İşlev |
|------|-------|
| **Bul** | Aranacak metni girin. Eşleşme sayısı gösterilir. |
| **Değiştir** | Yerine yazılacak metni girin |
| **Birini Değiştir** | İlk eşleşmeyi değiştirir |
| **Tümünü Değiştir** | Tüm eşleşmeleri tek seferde değiştirir |
| **Aa Büyük/küçük harf** | Büyük-küçük harf duyarlı arama açar/kapar |

Eşleşme bulunamazsa "Eşleşme bulunamadı" uyarısı çıkar.

Kapatmak için **X** ikonuna veya **Esc** tuşuna basın.

---

## 10. AI Asistan Paneli

Sağ üstteki **✨ AI** butonuna tıklayarak açın.

Masaüstünde sağ tarafta 340px genişliğinde bir panel olarak, mobilde ise sayfanın altında açılır.

### 10.1 İyileştir
Editördeki mevcut içeriği profesyonelleştirir. Dil bilgisi düzeltmeleri yapar, tonlamayı iyileştirir.

### 10.2 Özetle
Uzun içeriği kısa ve öz bir özete dönüştürür.

### 10.3 Genişlet
Kısa içeriği daha fazla detay ve açıklama ekleyerek genişletir.

### 10.4 Çevir
İçeriği aktif dilden diğer dile çevirir (TR→EN veya EN→TR).

### 10.5 Üret (Başlıktan Yaz)
Sadece başlığı girin, AI başlığa uygun tam bir makale içeriği üretir.

### 10.6 İki Dil (TR + EN)
Hem Türkçe hem İngilizce çıktı üretir. Her iki dilin sonucu ayrı ayrı gösterilir. "Uygula" butonlarıyla istediğiniz dil versiyonunu editöre aktarabilirsiniz.

### 10.7 Özel Komut
Panellin altındaki metin kutusuna serbest bir talimat girin. Örnek:
- "Bu metni daha samimi bir dille yeniden yaz"
- "Başlangıç cümlesini çarpıcı yap"
- "Son paragrafı özet olarak düzenle"

Enter tuşu veya ✨ butonuyla gönderin.

### 10.8 AI Görsel Üretme

AI Panelinde görsel üretme bölümü:

1. **Boyut seçin**: 16:9 (yatay), 1:1 (kare), 9:16 (dikey)
2. **Açıklama yazın**: "Piyano çalan bir çocuk, sıcak tonlarda" gibi
3. **İki buton**:
   - **Kapak**: Üretilen görsel doğrudan kapak görseli olarak ayarlanır
   - **İçerik Görseli**: Üretilen görsel editöre eklenir

**Üretilen Görseller Galerisi**: Üretilen tüm görseller panelde listelenir. Her görsel için:
- **İçeriğe Ekle**: Görseli editöre ekler
- **Kapak Yap**: Görseli kapak olarak ayarlar
- **İndir**: Görseli bilgisayarınıza indirir

### 10.9 SEO Meta Açıklama Üretme

AI Panelinde "SEO Meta" bölümü:

1. **Meta Açıklama Üret** butonuna tıklayın
2. AI, başlığa uygun 120-155 karakter arası bir meta description üretir
3. Üretilen metni:
   - **Düzenle**: Manuel olarak değiştirebilirsiniz
   - **Yenile**: Yeni bir versiyon üretin
   - **Kaydet**: Makaleye uygulayın
   - **Kopyala**: Panoya kopyalayın
   - **Sil**: Metni kaldırın

> ⚠️ 155 karakteri geçen meta açıklamalar Google'da kesilir. Karakter sayacı kırmızıya döner.

---

## 11. Kaydetme ve Yayınlama

Editörün alt kısmında iki kaydetme butonu bulunur:

| Buton | İşlev |
|-------|-------|
| **Taslak** | Makaleyi kaydeder ama yayınlamaz. Sadece admin panelde görünür. |
| **Yayınla** | Makaleyi kaydeder ve yayınlar. Public blog sayfasında görünür hale gelir. |

**Oto-kayıt**: Makale düzenlerken otomatik kayıt sistemi çalışır. Son kayıt zamanı alt barda gösterilir.

**Kayıt durumları:**
- ✓ "Oto-kayıt 14:32" — Son kayıt zamanı
- ⚠ "Kaydedilmemiş değişiklikler" — Henuz kaydedilmemiş düzenlemeler var
- Hata mesajı kırmızı renkte gösterilir

> 💡 `Ctrl+S` kısayolu ile hızlıca taslak olarak kaydedebilirsiniz.

---

## 12. SEO Paneli

Editörün en altında bulunan çıkarılabilir bölüm. Makalenizin arama motoru optimizasyonunu analiz eder.

### 12.1 SEO Skoru

Alt barda **SEO İyi / Orta / Zayıf** olarak genel skor gösterilir.

| Durum | Renk | Anlamı |
|-------|------|--------|
| ✅ İyi | Yeşil | SEO kriterleri karşılanıyor |
| ⚠️ Orta | Turuncu | İyileştirme önerileri var |
| ❌ Zayıf | Kırmızı | Ciddi eksikler var |

### 12.2 SEO Kontroller

Paneli açarak detaylı kontrol listesini görün. Her kontrol:
- ✅ Yeşil ikon: Kriter karşılanıyor
- ⚠️ Turuncu ikon: Uyarı, iyileştirme önerisi
- ❌ Kırmızı ikon: Hata, düzeltilmeli
- 💡 İpucu: Her kontrol için önerilen düzeltme

**Kontrol edilen kriterler:**

| Kontrol | İyi | Uyarı | Hata |
|---------|-----|-------|------|
| **Başlık uzunluğu** | 30-70 karakter | Çok kısa / uzun | Başlık yok |
| **Meta açıklama** | 100-155 karakter | Çok kısa / uzun | Eksik |
| **İçerik uzunluğu** | 600+ kelime | 300-600 kelime | 300'den az |
| **H1 başlık** | 1 adet | 2+ adet var | — |
| **H2 alt başlıklar** | 2+ adet | 0-1 adet | — |
| **Okunabilirlik** | Ortalama ≤25 kelime/cümle | >25 kelime/cümle | — |

### 12.3 AI ile SEO Optimizasyonu

SEO panelinde düzeltilebilir sorunlar varsa, sağ tarafta **"AI ile Optimize Et"** butonu belirir.

Bu butona tıkladığınızda:
1. AI tüm sorunları analiz eder
2. İçeriğinizi otomatik olarak iyileştirir (cümleleri kısaltır, alt başlıklar ekler, vb.)
3. İyileştirilmiş içerik AI Panelinde gösterilir
4. "Uygula" butonuyla editöre aktarabilirsiniz

> 💡 Hangi sorunların AI ile düzeltilebileceği her kontrolün yanındaki ✨ AI ikonuyla belirtilir.

---

## 13. İstatistikler

Editörün alt barında canlı olarak güncellenen istatistikler:

| İstatistik | Açıklama |
|------------|----------|
| **Karakter** | Toplam karakter sayısı |
| **Kelime** | Toplam kelime sayısı |
| **Okuma süresi** | Tahmini okuma süresi (200 kelime/dakika) |
| **SEO Skoru** | Başlık + içerik uzunluğuna göre 0-100 arası puan |

---

## 14. Klavye Kısayolları

Sağ üstteki ⌨ ikonuna veya `?` tuşuna basarak kısayol listesini görün.

| Kısayol | İşlev |
|---------|-------|
| `Ctrl+B` | Kalın yazı |
| `Ctrl+I` | İtalik yazı |
| `Ctrl+U` | Altı çizili |
| `Ctrl+Z` | Geri al |
| `Ctrl+H` | Bul ve Değiştir |
| `Ctrl+S` | Kaydet (taslak) |
| `F11` | Odak modu aç/kapa |
| `?` | Kısayollar penceresini aç |
| `Esc` | Odak modundan çık / Paneli kapat |

---

## 15. Kategoriler

Makaleleri konusuna göre sınıflandırın:

| Kategori | Ne Yazılır |
|----------|------------|
| **Müzik Teorisi** | Nota okuma, armoni, akor yapıları, müzik kuramı |
| **Enstrüman** | Piyano, gitar, keman, flüt, çalışma teknikleri |
| **Kulak Eğitimi** | Aralık tanıma, melodik dikte, ritmik dikte |
| **Deşifre** | İlk bakışta nota okuma, sightreading teknikleri |
| **Performans** | Sahne korkusu, konser hazırlığı, performans tecrübeleri |
| **Sınav Hazırlık** | ABRSM, Trinity sınavları, grade hazırlık, sınav ipuçları |
| **Genel** | Müzik dünyası haberleri, duyurular, genel konular |

---

## 16. Public Blog Sayfaları

Yayınlanan makaleler iki sayfada görünür:

### Makale Listesi (`/articles`)
- Yayınlanmış tüm makalelerin listesi
- Kategori etiketi, tarih ve okuma süresi gösterilir
- Tıklayarak makale detayına gidilir

### Makale Detay (`/articles/[slug]`)
- Makalenin tam içeriği
- Başlık, kapak görseli, kategori, tarih
- İçerik alanı (görseller, başlıklar, listeler, alıntılar ile zenginleştirilmiş)
- "Tüm makalelere dön" linki

---

## Hızlı İpuçları

1. **İlk makale yazarken**: Başlığı girin → AI Panelinden "Üret" butonuna basın → İçerik otomatik oluşturulur → Düzenleyin → Yayınlayın
2. **Çift dilli içerik**: TR'de yazın → AI "İki Dil" butonuyla EN versiyonunu otomatik üretin → EN'ye geçip doğrulayın
3. **SEO için**: Her makale en az 600 kelime olsun, başlık 50-60 karakter olsun, 2+ H2 başlık kullanın, meta description ekleyin
4. **Hızlı görsel**: Araç çubuğundaki AI Görsel butonu ile başlığa uygun görsel bir tıkla oluşturup ekleyin
5. **Dikkat dağıtmayan yazma**: F11 ile odak moduna geçin, sadece yazıya konsantre olun
