# Altınbaş AI Asistanı — Frontend

Altınbaş Üniversitesi RAG asistanı için modern chat arayüzü. Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui ile geliştirilmiştir.

> Bu, [altinbas-rag](https://github.com/evginayd/altinbas-rag) backend projesinin önyüzüdür. Backend Railway'de canlı, frontend Vercel'e deploy edilir.

---

## Özellikler

- 💬 **Modern chat arayüzü** — ChatGPT/Claude tarzı, sade ve hızlı
- 🎨 **Altınbaş kurumsal renk paleti** — crimson red (#e32845) + navy (#111d5e)
- 🌓 **Light + Dark mode** — sistem tercihi otomatik algılanır
- 💾 **Konuşma kalıcılığı** — localStorage ile sayfa yenilense bile mesajlar kaybolmaz
- 🔄 **Yeni Sohbet** — confirm dialog ile mevcut konuşmayı temizle
- 📚 **Kaynak gösterimi** — her cevapta expandable sources accordion, linkler yeni sekmede açılır
- 🤔 **Akıllı clarification** — backend belirsiz soruları yakalayıp netleştirici soru sorar
- ⌨️ **Typewriter efekti** — AI cevapları kelime kelime yazılır
- 📋 **Kopyala butonu** — her AI cevabı kolayca kopyalanır
- 📱 **Responsive** — desktop ve mobil uyumlu
- 🎯 **Suggestion chips** — boş ekranda 4 örnek soru

---

## Teknoloji Stack'i

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Base UI tabanlı) |
| State | Zustand + persist middleware |
| Theme | next-themes |
| Markdown | react-markdown + remark-gfm |
| Icons | lucide-react |
| Deploy | Vercel |

---

## Yerel Kurulum

### Ön Gereksinimler

- Node.js 20+
- Backend'in çalıştığı bir URL ([altinbas-rag](https://github.com/evginayd/altinbas-rag))

### Adımlar

```bash
# 1. Repoyu klonla
git clone https://github.com/evginayd/altinbas-rag-frontend.git
cd altinbas-rag-frontend

# 2. Bağımlılıkları kur
npm install

# 3. Environment dosyasını oluştur
cp .env.example .env.local
# .env.local içine kendi backend URL'inizi yazın

# 4. Dev sunucusu
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini aç.

### Production Build

```bash
npm run build
npm run start
```

---

## Vercel'e Deploy

1. [vercel.com](https://vercel.com) → GitHub ile giriş yap
2. **New Project** → bu repoyu seç
3. Framework: **Next.js** (otomatik algılanır)
4. **Environment Variables** ekle:
   - `NEXT_PUBLIC_API_URL` → backend Railway URL'in (örn: `https://altinbas-rag-production.up.railway.app`)
5. **Deploy**'a bas

Vercel size bir public URL verir (örn: `altinbas-rag-frontend.vercel.app`).

### Backend CORS

Backend'in `app/main.py` içinde `allow_origins=["*"]` zaten ayarlı, yani Vercel domain'inden istek atmak sorunsuz olmalı.

---

## Ortam Değişkenleri

| Değişken | Açıklama | Zorunlu |
|---------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend (Railway) URL'i — protokol dahil, sondaki `/` hariç | ✅ |

---

## Proje Yapısı

```
altinbas-rag-frontend/
├── app/
│   ├── layout.tsx              # Root layout (theme provider, fonts)
│   ├── page.tsx                # Ana chat sayfası
│   ├── globals.css             # Tailwind v4 + Altınbaş tema
│   └── favicon.ico
├── components/
│   ├── chat/
│   │   ├── chat-container.tsx  # Ana chat layout + state orchestration
│   │   ├── message-list.tsx    # Mesaj listesi + auto-scroll
│   │   ├── message-bubble.tsx  # User/assistant mesaj bubble
│   │   ├── sources-accordion.tsx # Expandable kaynaklar
│   │   ├── input-bar.tsx       # Auto-resize textarea + send
│   │   ├── empty-state.tsx     # Hoş geldin + suggestion chips
│   │   ├── loading-dots.tsx    # 3-nokta yüklenme animasyonu
│   │   └── new-chat-button.tsx # Yeni sohbet (confirm dialog)
│   ├── header.tsx              # Logo + theme toggle + new chat
│   ├── theme-provider.tsx      # next-themes wrapper
│   ├── theme-toggle.tsx        # Light/dark switch
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── api.ts                  # Backend client (chat fonksiyonu)
│   ├── store.ts                # Zustand chat store + localStorage persist
│   ├── types.ts                # Message, ChatResponse types
│   ├── typewriter.ts           # Word-by-word reveal hook
│   └── utils.ts                # cn() helper
├── public/
├── .env.example                # Env template
├── .gitignore
├── tsconfig.json
├── next.config.ts
├── package.json
└── README.md
```

---

## Önemli Davranışlar

### Konuşma Kalıcılığı
- Tüm mesajlar `localStorage`'da `altinbas-chat-store` anahtarıyla saklanır
- Sayfa yenilense (F5) veya tarayıcı kapansa bile konuşma korunur
- Sadece **"Yeni Sohbet"** butonu (confirm sonrası) konuşmayı siler

### Linkler
- AI cevaplarındaki ve sources içindeki tüm linkler `target="_blank" rel="noopener noreferrer"` ile yeni sekmede açılır
- Kullanıcı ana chat sayfasından çıkmaz, geri tuşu sorunu yaşamaz

### Belirsiz Sorular
Backend `needs_clarification: true` döndüğünde:
- Cevap, normalden farklı bir bubble stilinde gösterilir (accent renk)
- Sources gizlenir (clarification için kaynak yok)
- Kullanıcı netleştirici cevap verip devam edebilir

---

## Sorun Giderme

### "API URL tanımlı değil" hatası
`.env.local` dosyasında `NEXT_PUBLIC_API_URL` tanımlı mı kontrol et. Dev sunucuyu yeniden başlatman gerekebilir.

### Build hatası
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Backend bağlantısı yok
Railway URL'inizin sağlık testini yapın:
```bash
curl https://<your-railway-url>/health
```

### Mesajları sıfırlamak
Tarayıcı konsolunda:
```js
localStorage.removeItem('altinbas-chat-store')
```

---

## Yapılacaklar (Faz 4b)

- [ ] Admin panel (`/admin` route)
- [ ] Source ekleme/silme/yönetim
- [ ] Crawl jobs sayfası
- [ ] Dashboard (metrics + charts)
- [ ] Auth (admin paneli için)
- [ ] PDF upload form

---

## Lisans

Bu proje bir bitirme projesi olup eğitim amaçlı geliştirilmiştir.
