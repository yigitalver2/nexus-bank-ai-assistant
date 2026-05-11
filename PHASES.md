# Nexus Bank AI Assistant — Geliştirme Fazları

PRD v1.0 üzerinden çıkarılmış faz ve alt-görev listesi. Her görev tamamlandıkça `[ ]` yerine `[x]` işaretle.

---

## ✅ Faz 1 — Temel (Tamamlandı)

Amaç: Repo iskeletini, veritabanını, mock veriyi ve JWT auth'u ayağa kaldırmak.

- [x] **1.1** Repo'yu başlat: klasör yapısı (PRD §15), `.gitignore`, `.env.example`
- [x] **1.2** `docker-compose.yml` — `backend` + `postgres` servisleri (frontend Faz 3'te eklenecek)
- [x] **1.3** Backend `Dockerfile` (`python:3.11-slim`) + `requirements.txt` (FastAPI, SQLAlchemy, LangGraph, LangChain, python-jose, bcrypt, pydantic v2, chromadb, openai, faker, alembic)
- [x] **1.4** FastAPI iskelet (`backend/main.py`) + `GET /health` endpoint'i + CORS ayarları
- [x] **1.5** `backend/config.py` — environment variable yükleme (DB URL, JWT secret, OpenAI key)
- [x] **1.6** `backend/database/connection.py` — SQLAlchemy engine + session factory
- [x] **1.7** `backend/database/models.py` — 8 tablo: `customers`, `accounts`, `transactions`, `loans`, `credit_cards`, `support_tickets`, `conversations`, `messages` (PRD §5)
- [x] **1.8** `backend/database/schemas.py` — Pydantic v2 request/response şemaları
- [x] **1.9** Alembic kurulumu + ilk migration ("initial_schema")
- [x] **1.10** `backend/database/seed.py` — Faker ile 100 müşteri + 2-4 hesap + 20-50 transaction + 0-2 kredi + ~%60 kredi kartı + 5-10 ticket
- [x] **1.11** `backend/auth/utils.py` — bcrypt hash/verify, JWT encode/decode, `get_current_customer` dependency
- [x] **1.12** `backend/auth/router.py` — `POST /api/auth/login`, `GET /api/auth/me`
- [x] **1.13** Doğrulama: `docker compose up` → login token döndürüyor, `/api/auth/me` müşteri bilgilerini dönüyor

---

## ✅ Faz 2 — Agent Çekirdeği (Tamamlandı)

Amaç: LangGraph agent'ı, RAG bilgi tabanını ve chat endpoint'ini hazırlamak.

- [x] **2.1** `backend/knowledge/chroma_client.py` — Chroma embedded client + `nexus_bank_kb` koleksiyonu
- [x] **2.2** `backend/knowledge/docs/` altına kategori klasörleri (`faq/`, `products/`, `procedures/`, `security/`, `branch/`, `legal/`) ve içerik dokümanları (toplam 63 doküman, PRD §10)
- [x] **2.3** `backend/knowledge/ingest.py` (seed_kb) — dokümanları yükle, 300 token chunk + 50 overlap, `text-embedding-3-small` ile embed, metadata (`category`, `doc_id`, `title`, `language`)
- [x] **2.4** Container startup'ta koleksiyon boşsa otomatik ingest tetiklemesi
- [x] **2.5** `backend/agent/state.py` — `AgentState` TypedDict (`messages`, `customer_id`, `customer_name`, `tool_calls_made`, `session_id`)
- [x] **2.6** `backend/agent/prompts.py` — İngilizce sistem promptu (chat) + Türkçe sistem promptu (voice)
- [x] **2.7** `backend/agent/tools.py` — 6 tool tanımı:
    - [x] **2.7.1** `search_knowledge_base(query)` → Chroma
    - [x] **2.7.2** `get_account_info(customer_id)` → PostgreSQL
    - [x] **2.7.3** `get_transaction_history(customer_id, limit=10)` → PostgreSQL
    - [x] **2.7.4** `get_loan_status(customer_id)` → PostgreSQL
    - [x] **2.7.5** `create_support_ticket(customer_id, subject, description)` → PostgreSQL
    - [x] **2.7.6** `escalate_to_human(customer_id, reason)` → internal ref no
- [x] **2.8** `backend/agent/graph.py` — LangGraph: `agent_node` (GPT-4o) + `tools_node` + `should_continue` koşullu kenar + `MemorySaver` checkpointer
- [x] **2.9** `backend/routers/chat.py`:
    - [x] **2.9.1** `POST /api/chat` — mesaj gönder, agent yanıtı + `tool_used` döndür
    - [x] **2.9.2** `GET /api/chat/history/{session_id}` — checkpoint state'inden mesajları getir
    - [x] **2.9.3** `POST /api/chat/end` — session'ı `conversations` + `messages` tablolarına yaz
- [x] **2.10** `backend/routers/account.py` — `GET /api/account/{customer_id}`, `GET /api/transactions/{customer_id}`, `GET /api/tickets/{customer_id}` (hepsi JWT'den `customer_id` ile filtreli)
- [x] **2.11** `backend/routers/knowledge.py` — `POST /api/knowledge/ingest`, `GET /api/knowledge/search` (debug için)
- [x] **2.12** Postman/curl ile uçtan uca test: 6 tool da doğru veri dönüyor, agent doğru tool'u seçiyor

---

## Faz 3 — React Frontend (Gün 5-6)

Amaç: Login + Dashboard + Chat UI'ını ayağa kaldırmak.

- [ ] **3.1** `frontend/` Vite + React 18 + TailwindCSS kurulumu (`package.json`, `vite.config.js`, `tailwind.config.js`)
- [ ] **3.2** Tailwind tema: PRD §2 renkleri (`primary #1A1F36`, `accent #4F46E5`, vb.) + Inter + JetBrains Mono fontları
- [ ] **3.3** `frontend/Dockerfile` (`node:20-alpine`) + `docker-compose.yml`'a frontend servisi (port 3000)
- [ ] **3.4** `src/api/client.js` — Axios instance, JWT interceptor, 401 → login redirect
- [ ] **3.5** Zustand store'ları:
    - [ ] **3.5.1** `authStore.js` — user, token, login/logout
    - [ ] **3.5.2** `chatStore.js` — messages, session_id, loading, sendMessage
    - [ ] **3.5.3** `accountStore.js` — accounts, transactions, tickets
    - [ ] **3.5.4** `voiceStore.js` — connection status, transcript, audio state (iskelet)
- [ ] **3.6** React Router v6: `/login`, `/dashboard`, `/voice` + protected route guard
- [ ] **3.7** `components/NexusLogo.jsx` — SVG logo komponenti
- [ ] **3.8** `pages/LoginPage.jsx` — logo, email/şifre formu, "Sign In", "Connect to Voice Assistant" butonu
- [ ] **3.9** `pages/DashboardPage.jsx` — Header (Welcome back, [Ad] + logout + Switch to Voice) + 30/70 split layout
- [ ] **3.10** `components/AccountPanel.jsx` — `AccountSummary` + `TransactionList` + `TicketList` (login sonrası fetch)
- [ ] **3.11** `components/ChatPanel.jsx`:
    - [ ] **3.11.1** `MessageList` + `MessageBubble` (kullanıcı/asistan, tool badge, RAG kaynak chip'leri)
    - [ ] **3.11.2** `TypingIndicator`
    - [ ] **3.11.3** `MessageInput` (Enter ile gönder, multiline shift+enter)
    - [ ] **3.11.4** Otomatik en alta scroll davranışı
- [ ] **3.12** Browser test: login → dashboard → mesaj gönder → tool badge ve cevap görünüyor

---

## Faz 4 — Voice Agent (Gün 7-8)

Amaç: Türkçe gerçek-zamanlı sesli asistan (OpenAI Realtime API + WebSocket proxy).

- [ ] **4.1** `backend/voice/proxy.py` — `WS /api/voice/ws` endpoint'i, JWT query param ile auth
- [ ] **4.2** OpenAI Realtime API'ye sunucu-taraflı WebSocket bağlantısı
- [ ] **4.3** Session config gönderimi: `gpt-4o-realtime-preview`, `language: tr`, `voice: alloy`, 6 tool function definition, Türkçe sistem promptu
- [ ] **4.4** Audio bidi stream: client → backend → OpenAI ve OpenAI → backend → client
- [ ] **4.5** `function_call` event'lerini yakala → ilgili LangGraph tool'unu çağır → sonucu `function_call_output` ile session'a geri enjekte et
- [ ] **4.6** Transcript event'lerini client'a forward et (text görüntüleme için)
- [ ] **4.7** Voice session sonunda `conversations` + `messages` tablolarına transcript'i yaz
- [ ] **4.8** `pages/VoicePage.jsx` — büyük animasyonlu mikrofon butonu (orb)
- [ ] **4.9** `components/VoiceOrb.jsx` — ses dalgası animasyonu (Listening/Speaking/Processing state'lerine göre)
- [ ] **4.10** `StatusLabel` komponenti — anlık durum göstergesi
- [ ] **4.11** `TranscriptPanel` — kaydırılabilir konuşma metni
- [ ] **4.12** Browser AudioWorklet/PCM16 mikrofon yakalama + speaker'a playback
- [ ] **4.13** "Back to Chat" butonu (dashboard'a dön)
- [ ] **4.14** Uçtan uca test: Türkçe konuş → asistan bakiyeyi okusun, ticket oluştursun

---

## Faz 5 — Cilalama & Yayın (Gün 9-10)

Amaç: Hata yönetimi, dokümantasyon, demo hazırlığı.

- [ ] **5.1** Backend hata yönetimi (PRD §16):
    - [ ] **5.1.1** Tool boş sonuç → "bu bilgiyi bulamadım"
    - [ ] **5.1.2** PostgreSQL hatası → 500 + "geçici bir sorun"
    - [ ] **5.1.3** OpenAI timeout → 1 retry, sonra hata mesajı
    - [ ] **5.1.4** JWT expired → 401 (frontend redirect)
    - [ ] **5.1.5** Geçersiz `customer_id` → 403
    - [ ] **5.1.6** Agent max iterasyon → kısmi cevap + açıklama
- [ ] **5.2** Frontend hata/yükleme durumları: WebSocket drop için reconnect butonu, login fail mesajı, network hatası toast'ı, boş state'ler (no transactions, no tickets)
- [ ] **5.3** `.env.example` cleanup (tüm gerekli değişkenler, dummy değerler)
- [ ] **5.4** `README.md` — kurulum talimatları (Docker Compose), mimari özeti, demo kullanıcı bilgileri, ekran görüntüleri
- [ ] **5.5** `docs/architecture.png` — mimari diyagramı export'u
- [ ] **5.6** Portfolio için 4-5 ekran görüntüsü (login, dashboard chat, voice page, tool kullanımı)
- [ ] **5.7** Sıfırdan temiz build testi: `docker compose down -v && docker compose up --build`
- [ ] **5.8** GitHub remote'a push + repo description + topics

---

## Post-MVP (Opsiyonel)

- [ ] Geçmiş konuşmalar sayfası (arama dahil)
- [ ] Ticket bildirim email simülasyonu
- [ ] EN/TR dil toggle'ı (chat modu)
- [ ] Admin paneli (tüm konuşma ve ticket'lar)
- [ ] `slowapi` ile rate limiting
- [ ] Yapılandırılmış loglama (tool call, latency, error metrikleri)
- [ ] Demo modu (otomatik oynatılan örnek konuşma)
