# Altinbas AI Assistant — Frontend

A modern chat interface for the Altinbas University RAG assistant.
Built with **Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui**.

> This is the frontend for the [altinbas-rag](https://github.com/evginayd/altinbas-rag)
> backend. The backend runs on Railway; the frontend deploys to Vercel.

**Live**: deployed via Vercel (see your project's dashboard for the URL)

---

## Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screens](#screens)
- [Local Setup](#local-setup)
- [Deploy to Vercel](#deploy-to-vercel)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Key Behaviours](#key-behaviours)
- [Troubleshooting](#troubleshooting)

---

## Features

### Chat
- **Modern chat UI** — ChatGPT/Claude-style, fast and clean
- **Altinbas brand palette** — crimson red (#e32845) + navy (#111d5e)
- **Light + dark mode** — system preference auto-detected via `next-themes`
- **Conversation persistence** — messages stored in `localStorage`, preserved
  across page reloads
- **Conversation history in API calls** — the last 6 messages are sent to
  the backend so follow-up questions ("and the electives?", "continue")
  keep context
- **Bilingual (TR ⇄ EN)** — language toggle in the header; all UI strings
  translate, and the backend answers in whichever language is selected
- **Source citations** — every answer has an expandable "Sources" accordion;
  every link opens in a new tab with PDF/web icons
- **Clarification flow** — when the backend asks a clarifying question,
  it's rendered in an accent style with sources hidden
- **Typewriter effect** — assistant responses reveal word by word
- **Copy button** — one-click copy for any answer
- **Responsive** — works on desktop and mobile
- **Suggestion chips** — four example questions on the empty state,
  localized per language
- **"New Chat"** — confirm dialog before clearing the current conversation

### Admin panel (`/admin`)
Bearer-token protected area for managing the Qdrant corpus directly:

- **Login** (`/admin/login`) — token entry, verified against the backend
- **Dashboard** (`/admin`) — 4 stat cards: total chunks, URLs, web pages,
  PDF docs. Cards are clickable and deep-link to the URL list with a
  type filter applied.
- **URL management** (`/admin/urls`) — paginated list (10 per page) with:
  - All / Web / PDF tabs
  - Debounced search (350 ms)
  - Add new URL with immediate ingestion (spinner shows progress)
  - Per-row **reingest** (force re-embed) and **delete** actions
  - Delete confirmation dialog ("cannot be undone" warning)
  - Toast notifications for every action (success / info / error)
  - URL state persisted in query params (`?page=5&type=pdf&q=burs`) so
    browser back/forward and link sharing all behave correctly
- **Auto-logout** on any 401/403 response
- **Back-to-chat** link everywhere

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn/ui (Base UI under the hood) |
| State | Zustand + `persist` middleware |
| Theme | `next-themes` |
| Markdown | `react-markdown` + `remark-gfm` |
| Icons | `lucide-react` |
| Hosting | Vercel |

---

## Screens

- **Chat** — `/` — the main assistant interface
- **Admin login** — `/admin/login` — token entry (no auth required to view)
- **Admin dashboard** — `/admin` — stats overview
- **Admin URLs** — `/admin/urls` — URL management (supports `?page`, `?type`, `?q` query params)

---

## Local Setup

### Prerequisites

- Node.js 20+
- A running backend (the [altinbas-rag](https://github.com/evginayd/altinbas-rag)
  service, either deployed on Railway or running locally on port 8000)

### Steps

```bash
# 1. Clone
git clone https://github.com/evginayd/altinbas-rag-frontend.git
cd altinbas-rag-frontend

# 2. Install dependencies
npm install

# 3. Environment
cp .env.example .env.local
# Edit .env.local → set NEXT_PUBLIC_API_URL to your backend's URL

# 4. Dev server
npm run dev
```

Open `http://localhost:3000`.

### Production build

```bash
npm run build
npm run start
```

---

## Deploy to Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New → Project** and select this repository.
3. Framework preset: **Next.js** (auto-detected).
4. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | your backend URL (e.g. `https://altinbas-rag-production.up.railway.app`) |

5. Click **Deploy**. Vercel gives you a public URL such as
   `altinbas-rag-frontend.vercel.app`.

### Backend CORS

The backend's `app/main.py` sets `allow_origins=["*"]` so Vercel domains
work out of the box.

### Admin token

The `ADMIN_TOKEN` is **never** embedded in the frontend — admins paste it
manually on the login page. It's stored in `localStorage` after login and
sent in the `Authorization: Bearer ...` header from the browser. So there
is **no admin-related environment variable** to set on Vercel.

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend URL (protocol included, no trailing slash) | ✅ |

The `NEXT_PUBLIC_` prefix is required — Next.js only exposes variables
with this prefix to the browser.

---

## Project Structure

```
altinbas-rag-frontend/
├── app/
│   ├── layout.tsx              # Root layout (theme, toast, i18n sync)
│   ├── page.tsx                # Main chat page
│   ├── globals.css             # Tailwind v4 + Altinbas theme tokens
│   ├── favicon.ico
│   └── admin/
│       ├── layout.tsx          # Auth guard + admin nav
│       ├── page.tsx            # Admin dashboard (stat cards)
│       ├── login/page.tsx      # Admin token entry
│       └── urls/page.tsx       # Paginated URL management
├── components/
│   ├── chat/
│   │   ├── chat-container.tsx  # Main chat orchestrator
│   │   ├── message-list.tsx    # Message list + auto-scroll
│   │   ├── message-bubble.tsx  # User/assistant bubble + markdown
│   │   ├── sources-accordion.tsx
│   │   ├── input-bar.tsx       # Auto-resize textarea
│   │   ├── empty-state.tsx     # Welcome + suggestion chips
│   │   ├── loading-dots.tsx
│   │   └── new-chat-button.tsx
│   ├── admin/
│   │   ├── admin-nav.tsx       # Top nav for admin area
│   │   ├── pagination.tsx      # Prev/Next + numbered pages
│   │   └── delete-url-dialog.tsx
│   ├── header.tsx              # Chat header (logo + admin badge)
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx        # Light/dark switch
│   ├── language-toggle.tsx     # TR/EN switch
│   ├── html-lang-sync.tsx      # Syncs <html lang="..."> with store
│   └── ui/                     # shadcn/ui primitives + toast
├── lib/
│   ├── api.ts                  # Chat endpoint client
│   ├── admin-api.ts            # Admin endpoint client + typed errors
│   ├── store.ts                # Zustand store + useT() hook
│   ├── i18n.ts                 # TR/EN translation tables
│   ├── types.ts                # Message, ChatResponse, Source types
│   ├── typewriter.ts           # Word-by-word reveal hook
│   └── utils.ts                # cn() helper
├── public/
├── .env.example
├── .gitignore
├── tsconfig.json
├── next.config.ts
├── package.json
└── README.md
```

---

## Key Behaviours

### Conversation persistence
- All messages are saved in `localStorage` under the key
  `altinbas-chat-store`
- Messages, current language, and the admin token are persisted;
  loading state and errors are session-scoped
- Only the **New Chat** button (after confirming) clears the conversation

### Links
- Every link inside assistant responses and the sources accordion opens
  with `target="_blank" rel="noopener noreferrer"`
- Users stay on the chat page; the back button is never broken

### Clarification flow
When the backend returns `needs_clarification: true`:
- The answer is rendered in an accent-tinted bubble
- Sources are hidden (no retrieval happened)
- The user can reply with a more specific question

### Admin auth
- Tokens are verified against `/admin/stats` at login (a cheap probe)
- A verified token is stored in `localStorage` and sent on every admin
  request
- Any 401/403 response from the backend clears the token and redirects
  to `/admin/login`

### Language handling
- UI language is a user toggle (TR/EN), persisted in `localStorage`
- Chat requests include `language` so the backend always matches the
  user's preference, even when the query contains Turkish proper nouns
  (e.g. asking in English: "which campus is closest to Şişli")

### URL state (admin panel)
The URL management page stores its filter state in query params:

```
/admin/urls?page=3&type=pdf&q=burs
```

Browser navigation, refreshes, and link sharing all work naturally as a
result. Dashboard cards that link here include the type filter
automatically (`?type=web`, `?type=pdf`).

---

## Troubleshooting

### "API URL is not defined"
Check that `NEXT_PUBLIC_API_URL` is set in `.env.local` (local) or in
Vercel **Environment Variables** (production). Restart the dev server
after editing `.env.local`.

### Build fails
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Backend connection issues
Sanity-check the backend directly:
```bash
curl https://<your-railway-url>/health
```

### Resetting local chat state
From the browser console:
```js
localStorage.removeItem('altinbas-chat-store')
```

### Admin panel "503" on login
The server-side `ADMIN_TOKEN` is empty. See the backend README for how
to configure it on Railway.

### Admin panel keeps kicking me back to login
Your token is invalid or the server-side token was rotated. Get the
current token from your Railway Variables tab and paste it again.

---

## Related

- Backend: [altinbas-rag](https://github.com/evginayd/altinbas-rag)
- Demo video / screenshots: see the project submission

---

## License

Developed as a final year project for educational purposes.
