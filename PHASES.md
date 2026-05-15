# Nexus Bank AI Assistant — Geliştirme Fazları

PRD v2.0 (WebRTC Edition) üzerinden çıkarılmış faz ve alt-görev listesi. Her görev tamamlandıkça `[ ]` yerine `[x]` işaretle.

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

## ✅ Faz 3 — React Frontend (Tamamlandı)

Amaç: Login + Dashboard + Chat UI'ını ayağa kaldırmak.

- [x] **3.1** `frontend/` Vite + React 18 + TailwindCSS kurulumu (`package.json`, `vite.config.js`, `tailwind.config.js`)
- [x] **3.2** Tailwind tema: PRD §2 renkleri (`primary #1A1F36`, `accent #4F46E5`, vb.) + Inter + JetBrains Mono fontları
- [x] **3.3** `frontend/Dockerfile` (`node:20-alpine`) + `docker-compose.yml`'a frontend servisi (port 3000)
- [x] **3.4** `src/api/client.js` — Axios instance, JWT interceptor, 401 → login redirect
- [x] **3.5** Zustand store'ları:
    - [x] **3.5.1** `authStore.js` — user, token, login/logout
    - [x] **3.5.2** `chatStore.js` — messages, session_id, loading, sendMessage
    - [x] **3.5.3** `accountStore.js` — accounts, transactions, tickets
    - [x] **3.5.4** `voiceStore.js` — connection status, transcript, audio state (iskelet)
- [x] **3.6** React Router v6: `/login`, `/dashboard`, `/voice` + protected route guard
- [x] **3.7** `components/NexusLogo.jsx` — SVG logo komponenti
- [x] **3.8** `pages/LoginPage.jsx` — logo, email/şifre formu, "Sign In", "Connect to Voice Assistant" butonu
- [x] **3.9** `pages/DashboardPage.jsx` — Header (Welcome back, [Ad] + logout + Switch to Voice) + 30/70 split layout
- [x] **3.10** `components/AccountPanel.jsx` — `AccountSummary` + `TransactionList` + `TicketList` (login sonrası fetch)
- [x] **3.11** `components/ChatPanel.jsx`:
    - [x] **3.11.1** `MessageList` + `MessageBubble` (kullanıcı/asistan, tool badge, RAG kaynak chip'leri)
    - [x] **3.11.2** `TypingIndicator`
    - [x] **3.11.3** `MessageInput` (Enter ile gönder, multiline shift+enter)
    - [x] **3.11.4** Otomatik en alta scroll davranışı
- [x] **3.12** Browser test: login → dashboard → mesaj gönder → tool badge ve cevap görünüyor

---

## Faz 4 — Voice Agent / WebRTC (Gün 7-8)

Amaç: Türkçe gerçek-zamanlı sesli asistan — WebRTC + ephemeral token mimarisi (PRD v2.0).
Ses trafiği **doğrudan** tarayıcı ↔ OpenAI arasında akar; backend yalnızca token basar ve tool çağrılarını çalıştırır.
Görüşme başlamadan önce asistan **kimlik doğrulaması** yapar (baba adı + doğum yeri).

### Ön Koşul — DB & Seed Güncellemesi

- [ ] **4.0** `customers` tablosuna `father_name` ve `birth_place` alanları ekle:
    - [ ] **4.0.1** `backend/database/models.py` — `Customer` modeline `father_name: Mapped[str | None]` ve `birth_place: Mapped[str | None]` alanları ekle
    - [ ] **4.0.2** Alembic migration: `alembic revision --autogenerate -m "add_identity_fields"` → `alembic upgrade head`
    - [ ] **4.0.3** `backend/database/seed.py` — demo müşteri `Ahmet Yılmaz`'a sabit değer ata (`father_name="Mehmet"`, `birth_place="Ankara"`), rastgele müşterilere Faker ile Türkçe isim + şehir ata

### Backend

- [ ] **4.1** `backend/agent/tools.py` — `verify_customer_identity` tool'u ekle (7. tool):
    - Input: `customer_id: str`, `father_name: str`, `birth_place: str`
    - PostgreSQL'den `customers` tablosunu sorgula, case-insensitive + strip karşılaştırma yap
    - Output: `"verified"` veya `"verification_failed"` (ayrıntı verme)
    - `all_tools` listesine ekle
- [ ] **4.2** `backend/agent/prompts.py` — `VOICE_SYSTEM_PROMPT`'u güncelle:
    - Görüşmeye başlamadan önce kimlik doğrulaması zorunlu kural ekle
    - Baba adı ve doğum yeri sor, her ikisini aldıktan sonra `verify_customer_identity` çağır
    - Tool çağrısından önce "Bilgilerinizi kontrol ediyorum, bir moment lütfen..." söyle (bekleme hissi)
    - Doğrulama başarısızsa görüşmeyi sonlandır, 3 haktan sonra eskalasyon
- [ ] **4.3** `backend/voice/token.py` — `POST /api/voice/token` endpoint'i:
    - JWT decode → `customer_id`, `customer_name` al
    - Session config oluştur: model `gpt-realtime`, `modalities: ["audio","text"]`, `voice: alloy`, güncel Türkçe sistem promptu, **7 LangGraph tool tanımı** (verify dahil), `turn_detection: server_vad`
    - `POST https://api.openai.com/v1/realtime/sessions` — header: `Authorization: Bearer OPENAI_API_KEY`, `OpenAI-Safety-Identifier: sha256(customer_id)`
    - `{ client_secret, session_id }` döndür
- [ ] **4.4** `backend/voice/tool.py` — `POST /api/voice/tool` endpoint'i:
    - Body: `{ session_id, name, arguments }` (JWT auth)
    - JWT'den `customer_id` al → ilgili LangGraph tool'unu çalıştır (`verify_customer_identity` dahil)
    - `{ result }` döndür
- [ ] **4.5** `backend/voice/persist.py` — `POST /api/voice/end` endpoint'i:
    - Body: `{ session_id, transcript: [{role, content}] }`
    - `conversations` tablosuna `mode=voice` satırı yaz + `messages` tablosuna transcript kayıt

### Frontend

- [ ] **4.6** `voiceStore.js` güncellemesi — WebRTC bağlantı durumu, transcript listesi, audio state, ephemeral token (WebSocket state'lerini kaldır)
- [ ] **4.7** `src/lib/webrtc.js` — `RTCPeerConnection` yardımcı fonksiyonları:
    - `createPeerConnection()` — mic track ekle (`getUserMedia`), remote track'i `<audio>` elementine bağla (`ontrack`)
    - `exchangeSDP(pc, clientSecret)` — SDP offer oluştur → OpenAI Realtime'a POST → remote answer set et
    - `createDataChannel(pc)` — `"oai-events"` data channel
- [ ] **4.8** `pages/VoicePage.jsx`:
    - Mount'ta `POST /api/voice/token` çağır → `client_secret`, `session_id` al
    - `webrtc.js` aracılığıyla `RTCPeerConnection` kur + SDP exchange yap
    - Data channel `onmessage` ile `transcript_delta` ve `function_call` event'lerini dinle
    - Session kapanınca `POST /api/voice/end` ile transcript'i backende gönder
    - "Back to Chat" butonu — dashboard'a yönlendir
- [ ] **4.9** `components/VoiceOrb.jsx` — remote stream üzerinde `AnalyserNode` ile ses seviyesine bağlı animasyon
- [ ] **4.10** `StatusLabel` komponenti — `Listening` / `Speaking` / `Processing` / `Verifying` durumları
- [ ] **4.11** `TranscriptPanel` — `transcript_delta` event'lerinden biriken kaydırılabilir metin
- [ ] **4.12** Tool call dispatcher (VoicePage içinde):
    - `response.done` event'inden `function_call` parse et
    - `POST /api/voice/tool` → sonucu al
    - Data channel üzerinden `conversation.item.create` (function_call_output) + `response.create` gönder
- [ ] **4.13** Uçtan uca test:
    - Türkçe konuş → asistan baba adı + doğum yeri sor → "Bilgilerinizi kontrol ediyorum..." desin → tool çağrısı gitsin → doğrulama başarılı → bakiyeyi okusun, ticket oluştursun
    - Hatalı bilgi verince doğrulama başarısız → eskalasyon akışı

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
- [ ] **5.2** Frontend hata/yükleme durumları:
    - [ ] **5.2.1** Ephemeral token alınamadı → voice sayfasında hata mesajı, session başlatma engeli
    - [ ] **5.2.2** WebRTC ICE negotiation başarısız → "Bağlantı kurulamadı, tekrar dene" butonu
    - [ ] **5.2.3** Data channel mid-session koptu → reconnect girişimi; başarısızsa manuel retry
    - [ ] **5.2.4** `/api/voice/tool` POST hatası → data channel'a error result gönder, model gracefully devam etsin
    - [ ] **5.2.5** Login fail mesajı, network hatası toast'ı, boş state'ler (no transactions, no tickets)
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
