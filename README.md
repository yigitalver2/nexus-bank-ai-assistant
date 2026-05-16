# Nexus Bank AI Assistant

Nexus Bank müşterilerine hem metin tabanlı chat hem de gerçek zamanlı sesli asistan hizmeti sunan, yapay zeka destekli bankacılık müşteri hizmetleri uygulaması.

---

## İçindekiler

1. [Projeye Genel Bakış](#1-projeye-genel-bakış)
2. [Mimari](#2-mimari)
3. [Teknoloji Yığını](#3-teknoloji-yığını)
4. [Klasör Yapısı](#4-klasör-yapısı)
5. [Veritabanı Şeması](#5-veritabanı-şeması)
6. [AI Agent Sistemi](#6-ai-agent-sistemi)
7. [Bilgi Tabanı (RAG)](#7-bilgi-tabanı-rag)
8. [API Endpointleri](#8-api-endpointleri)
9. [Chat Modu — Akış](#9-chat-modu--akış)
10. [Ses Modu — Akış](#10-ses-modu--akış)
11. [Frontend Bileşenleri](#11-frontend-bileşenleri)
12. [Kimlik Doğrulama](#12-kimlik-doğrulama)
13. [Token ve Maliyet İzleme](#13-token-ve-maliyet-i̇zleme)
14. [Ortam Değişkenleri](#14-ortam-değişkenleri)
15. [Kurulum ve Çalıştırma](#15-kurulum-ve-çalıştırma)
16. [Mock Veri](#16-mock-veri)

---

## 1. Projeye Genel Bakış

Nexus Bank AI Assistant, bir bankanın müşteri hizmetleri kanalını yapay zeka ile güçlendirmek amacıyla geliştirilmiştir. Müşteriler iki farklı modda asistana erişebilir:

- **Chat Modu** — Tarayıcı üzerinden yazılı olarak soru sorma. GPT-4o modeliyle çalışan LangGraph agent'ı soruları yanıtlar, gerektiğinde veritabanı araçlarını çağırır.
- **Ses Modu** — OpenAI Realtime API üzerinden WebRTC bağlantısıyla gerçek zamanlı sesli görüşme. Asistan Türkçe konuşur, müşteriyi kimlik bilgileriyle doğrular, ardından hesap ve ürün sorularını yanıtlar.

Her iki modda da aynı araç (tool) seti paylaşılır: hesap sorgulama, işlem geçmişi, kredi durumu, destek talebi açma ve insan temsilciye aktarma.

---

## 2. Mimari

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (React + Vite)                                         │
│                                                                 │
│  LoginPage → DashboardPage ─────────────────────────────────┐  │
│                │                                             │  │
│                ├── AccountPanel   (hesap / işlem listesi)    │  │
│                ├── ChatPanel      (metin chat yan paneli)    │  │
│                └── VoicePage      (WebRTC ses oturumu)       │  │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP / WebRTC
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  FastAPI  (backend — port 8000)                                 │
│                                                                 │
│  /api/auth   → JWT login & me                                   │
│  /api/chat   → LangGraph agent (chat modu)                      │
│  /api/voice  → Realtime token + tool proxy + session end        │
│  /api/account, /api/transactions, /api/tickets                  │
│  /api/knowledge                                                 │
│                                                                 │
│  ┌──────────────────────────┐   ┌──────────────────────────┐   │
│  │  LangGraph Agent         │   │  OpenAI Realtime API      │   │
│  │  (GPT-4o + ToolNode)     │   │  (gpt-4o-realtime)        │   │
│  │  MemorySaver checkpointer│   │  WebRTC SDP exchange      │   │
│  └──────────┬───────────────┘   └──────────────────────────┘   │
│             │ tools                                             │
│  ┌──────────▼───────────────┐   ┌──────────────────────────┐   │
│  │  PostgreSQL               │   │  ChromaDB (embedded)      │   │
│  │  customers, accounts,     │   │  nexus_bank_kb            │   │
│  │  transactions, loans,     │   │  text-embedding-3-small   │   │
│  │  credit_cards, tickets,   │   │  63 belge / 6 kategori    │   │
│  │  conversations, messages  │   └──────────────────────────┘   │
│  └──────────────────────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Teknoloji Yığını

### Backend

| Katman | Teknoloji |
|---|---|
| Web framework | FastAPI 0.115+ |
| ASGI server | Uvicorn (standard) |
| AI / Agent | LangGraph 0.2+, LangChain 0.3+ |
| LLM | OpenAI GPT-4o (chat), GPT-4o-realtime (ses) |
| Embedding | OpenAI text-embedding-3-small |
| Vektör veritabanı | ChromaDB 0.5+ (embedded, disk'te kalıcı) |
| İlişkisel veritabanı | PostgreSQL 16 |
| ORM | SQLAlchemy 2.0 (mapped_column API) |
| Migrasyon | Alembic |
| Auth | python-jose (JWT), bcrypt |
| HTTP istemci | httpx |
| Mock veri | Faker |

### Frontend

| Katman | Teknoloji |
|---|---|
| Framework | React 18 |
| Build tool | Vite |
| Stil | Tailwind CSS |
| State yönetimi | Zustand |
| HTTP istemci | Axios |
| WebRTC | Tarayıcı yerel API (RTCPeerConnection) |
| Routing | React Router v6 |

### Altyapı

| Bileşen | Teknoloji |
|---|---|
| Konteynerleştirme | Docker + Docker Compose |
| DB yönetim arayüzü | Adminer (port 8080) |

---

## 4. Klasör Yapısı

```
nexus-bank-ai-assistant/
├── .env                        # Gerçek ortam değişkenleri (git'e eklenmez)
├── .env.example                # Şablon — tüm değişken açıklamaları
├── docker-compose.yml          # postgres + backend + frontend + adminer
│
├── backend/
│   ├── main.py                 # FastAPI uygulaması; startup'ta KB seed'i tetikler
│   ├── config.py               # Pydantic-settings ile env yükleme
│   ├── requirements.txt
│   ├── Dockerfile
│   │
│   ├── agent/
│   │   ├── graph.py            # LangGraph StateGraph tanımı
│   │   ├── state.py            # AgentState TypedDict
│   │   ├── tools.py            # 7 LangChain tool + embedding token sayacı
│   │   ├── prompts.py          # Chat (İngilizce) ve Voice (Türkçe) sistem promptları
│   │   └── pricing.py          # Token fiyatlandırma + maliyet loglama
│   │
│   ├── auth/
│   │   ├── router.py           # POST /api/auth/login, GET /api/auth/me
│   │   └── utils.py            # JWT encode/decode, bcrypt, get_current_customer
│   │
│   ├── database/
│   │   ├── connection.py       # SQLAlchemy engine + SessionLocal
│   │   ├── models.py           # 8 ORM modeli
│   │   ├── schemas.py          # Pydantic request/response şemaları
│   │   └── seed.py             # Faker ile demo veri üretimi
│   │
│   ├── knowledge/
│   │   ├── chroma_client.py    # ChromaDB koleksiyon yöneticisi
│   │   ├── ingest.py           # Belgeleri chunk'la, embed'le ve Chroma'ya yaz
│   │   └── docs/               # 63 düz metin belgesi
│   │       ├── faq/            # 22 SSS belgesi
│   │       ├── products/       # 14 ürün belgesi
│   │       ├── procedures/     # 10 prosedür belgesi
│   │       ├── security/       # 8 güvenlik belgesi
│   │       ├── branch/         # 5 şube / ATM belgesi
│   │       └── legal/          # 5 yasal belge
│   │
│   ├── routers/
│   │   ├── chat.py             # POST /api/chat, GET /api/chat/history, POST /api/chat/end
│   │   ├── voice.py            # POST /api/voice/token, /tool, /end
│   │   ├── account.py          # GET /api/account, /transactions, /tickets
│   │   └── knowledge.py        # POST /api/knowledge/ingest, GET /api/knowledge/search
│   │
│   └── alembic/                # Veritabanı migrasyon dosyaları
│
└── frontend/
    └── src/
        ├── App.jsx             # Router tanımları
        ├── main.jsx            # React entry point
        ├── index.css           # Tailwind + özel animasyonlar
        │
        ├── api/
        │   └── client.js       # Axios instance (baseURL + JWT header)
        │
        ├── lib/
        │   └── webrtc.js       # RTCPeerConnection + SDP exchange yardımcısı
        │
        ├── store/
        │   ├── authStore.js    # Oturum, JWT, müşteri bilgisi
        │   ├── accountStore.js # Hesaplar, işlemler, destek talepleri
        │   ├── chatStore.js    # Chat oturumu, mesaj geçmişi
        │   └── voiceStore.js   # Ses oturumu durumu, transkript
        │
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── DashboardPage.jsx
        │   └── VoicePage.jsx
        │
        └── components/
            ├── AccountPanel.jsx    # Sol kenar çubuğu: hesap detayları
            ├── ChatPanel.jsx       # Slayt açılan chat penceresi
            ├── MessageBubble.jsx   # Tek mesaj baloncuğu
            ├── NexusLogo.jsx       # SVG logo bileşeni
            ├── StatusLabel.jsx     # Ses durumu etiketi
            ├── TranscriptPanel.jsx # Ses transkript listesi
            ├── TypingIndicator.jsx # "..." yazıyor animasyonu
            └── VoiceOrb.jsx        # Ses modunda orb animasyonu
```

---

## 5. Veritabanı Şeması

Sekiz tablo PostgreSQL'de tutulur. Tüm birincil anahtarlar UUID'dir.

```
customers
  customer_id (PK, UUID)
  name, email (unique), password_hash
  phone, national_id
  father_name, birth_place       ← ses kimlik doğrulaması için
  created_at

accounts
  account_id (PK)
  customer_id (FK → customers)
  type: checking | savings | time_deposit | credit_card
  balance, currency (TRY varsayılan), iban
  status: active | frozen | closed

transactions
  transaction_id (PK)
  account_id (FK → accounts)
  type: credit | debit
  amount, description, category
  created_at

loans
  loan_id (PK)
  customer_id (FK)
  type: personal | mortgage | vehicle
  amount, interest_rate, monthly_payment, remaining_amount
  status: pending | approved | rejected | active | closed

credit_cards
  credit_card_id (PK)
  account_id (FK → accounts, 1-1)
  card_number_masked, credit_limit, available_limit
  billing_date, due_date
  status: active | blocked | expired

support_tickets
  ticket_id (PK)
  customer_id (FK)
  subject, description
  status: open | in_progress | resolved | closed
  priority: low | medium | high

conversations
  conversation_id (PK)
  customer_id (FK)
  mode: chat | voice
  started_at, ended_at

messages
  message_id (PK)
  conversation_id (FK)
  role: user | assistant
  content (TEXT)
  tool_used (VARCHAR, nullable)
  created_at
```

> Chat oturumları hafızada (LangGraph MemorySaver) tutulur. `POST /api/chat/end` çağrıldığında konuşma `conversations` ve `messages` tablolarına kalıcı olarak yazılır. Ses oturumları WebRTC tarafında son bulur; `/api/voice/end` endpoint'i transkripti alarak aynı tablolara yazar.

---

## 6. AI Agent Sistemi

### LangGraph Graf Yapısı (Chat Modu)

```
START → agent_node ──tool_calls var──► tools_node ──► agent_node
                   ──tool_calls yok──► END
```

`agent_node` GPT-4o'yu çağırır. Modelin yanıtında `tool_calls` varsa `tools_node` devreye girer ve ilgili tool çalıştırılır. Sonuç agent'a geri iletilir. Bu döngü model bir metin yanıtı üretene kadar devam eder.

`MemorySaver` her `thread_id` (session) için mesaj geçmişini RAM'de tutar. Bir sonraki çağrıda geçmiş otomatik olarak bağlama eklenir.

### Araçlar (Tools)

| Tool | Açıklama |
|---|---|
| `search_knowledge_base(query)` | ChromaDB'de vektör araması yapar, en yakın 5 chunk'ı döndürür |
| `get_account_info(customer_id)` | Müşterinin tüm aktif hesaplarını ve bakiyelerini listeler |
| `get_transaction_history(customer_id, limit, start_date, end_date)` | Filtrelenebilir işlem geçmişi |
| `get_loan_status(customer_id)` | Aktif ve bekleyen kredileri listeler |
| `create_support_ticket(customer_id, subject, description)` | Veritabanına yeni bir destek talebi açar |
| `escalate_to_human(customer_id, reason)` | İnsan temsilciye aktarım referans numarası üretir |
| `verify_customer_identity(customer_id, father_name, birth_place)` | Baba adı + doğum yeri eşleşmesini doğrular (ses modu için) |

### Sistem Promptları

**Chat (İngilizce):** Profesyonel ve kısa yanıtlar; araç kullanımında müşteriyi bilgilendirme; yetki dışı taleplerde destek talebi veya yönlendirme.

**Ses (Türkçe):** Katı bir kimlik doğrulama akışı tanımlar. Görüşme başladığında asistan önce baba adını, sonra doğum yerini sorar, ardından `verify_customer_identity` çağırır. 3 başarısız denemede insan temsilciye aktarır. Doğrulama geçilmeden hesap bilgisi paylaşılmaz.

---

## 7. Bilgi Tabanı (RAG)

ChromaDB, disk üzerinde kalıcı (`chroma_data/` dizini) bir vektör veritabanı olarak çalışır. Uygulama başlarken koleksiyon boşsa `seed_kb()` otomatik tetiklenir.

### Belge Kategorileri

| Kategori | Konu |
|---|---|
| `faq/` | Bakiye sorgulama, kart engelleme, şifre sıfırlama, transfer limitleri, döviz, vb. (22 belge) |
| `products/` | Vadesiz / vadeli mevduat, kredi kartları (Classic, Gold, Platinum), konut / taşıt / ihtiyaç kredisi, dijital cüzdan, yatırım hesabı, sigorta (14 belge) |
| `procedures/` | Hesap transferi, adres değişikliği, isim değişikliği, şikayet süreci, kart başvurusu, miras, vekaletname (10 belge) |
| `security/` | Dolandırıcılık önleme, kimlik avı uyarıları, 2FA, kart güvenliği, veri koruma (8 belge) |
| `branch/` | Şube saatleri, ATM konumları ve hizmetleri, randevu alma (5 belge) |
| `legal/` | Gizlilik politikası, KVKK aydınlatma metni, kullanım koşulları, çerez politikası, AML politikası (5 belge) |

### İşleme Hattı

1. Her `.txt` dosyasının başındaki `Title:`, `Category:`, `Doc-ID:` alanları metadata olarak ayrıştırılır.
2. `RecursiveCharacterTextSplitter` ile 2000 karakterlik chunk'lara bölünür (200 karakter örtüşme).
3. `text-embedding-3-small` modeli her chunk için vektör üretir.
4. Vektörler + ham metin + metadata ChromaDB koleksiyonuna yazılır.
5. Sorgulama sırasında kullanıcı sorusu da aynı modelle embed edilir ve en yakın 5 chunk döndürülür.

---

## 8. API Endpointleri

### Auth

| Method | Path | Açıklama |
|---|---|---|
| POST | `/api/auth/login` | `{email, password}` → `{access_token, customer}` |
| GET | `/api/auth/me` | Oturum açık müşteriyi döndürür |

### Chat

| Method | Path | Açıklama |
|---|---|---|
| POST | `/api/chat` | `{message, session_id?}` → `{response, session_id, tools_used}` |
| GET | `/api/chat/history/{session_id}` | Geçmiş mesajları getirir |
| POST | `/api/chat/end` | Oturumu kapatır ve veritabanına yazar |

### Ses

| Method | Path | Açıklama |
|---|---|---|
| POST | `/api/voice/token` | OpenAI Realtime session client secret'ı döndürür |
| POST | `/api/voice/tool` | Realtime API'nin tetiklediği tool'u çalıştırır |
| POST | `/api/voice/end` | Transkript + kullanım istatistiklerini kaydeder |

### Hesap

| Method | Path | Açıklama |
|---|---|---|
| GET | `/api/account/{customer_id}` | Hesaplar ve kredi kartları |
| GET | `/api/transactions/{customer_id}` | İşlem geçmişi |
| GET | `/api/tickets/{customer_id}` | Destek talepleri |

### Bilgi Tabanı (debug)

| Method | Path | Açıklama |
|---|---|---|
| POST | `/api/knowledge/ingest` | Belgeleri yeniden yükler |
| GET | `/api/knowledge/search` | Vektör araması yapar |

### Sistem

| Method | Path | Açıklama |
|---|---|---|
| GET | `/health` | `{status: "ok", env: "..."}` |

Tüm `/api/chat`, `/api/voice` ve `/api/account` endpointleri `Authorization: Bearer <token>` başlığı gerektirir.

---

## 9. Chat Modu — Akış

```
Müşteri yazar
     │
     ▼
POST /api/chat
     │  (session_id + JWT)
     ▼
chat.py router
     │  sistem promptu oluşturulur (customer_name + customer_id eklenir)
     │  LangGraph graph.invoke(input_state, config={thread_id})
     ▼
agent_node (GPT-4o)
     │
     ├── tool_calls var ──► tools_node ──► tool çalıştır ──► agent_node (döngü)
     │
     └── metin yanıt üretildi
          │
          ▼
     response + tools_used döndürülür
          │
          ▼
     Frontend ChatPanel mesajı ekler

Oturum kapatma (logout / sayfa kapatma):
POST /api/chat/end
     │
     ▼
MemorySaver state okunur → conversations + messages tablolarına yazılır
Token maliyeti hesaplanır ve sunucu loguna yazdırılır
```

---

## 10. Ses Modu — Akış

```
Müşteri "Connect to Voice Assistant" tıklar
     │
     ▼
POST /api/voice/token
     │  FastAPI → OpenAI /v1/realtime/client_secrets
     │  Sistem promptu + tool tanımları gönderilir
     │  client_secret + session_id döner
     ▼
webrtc.js — RTCPeerConnection oluşturulur
     │  Mikrofon akışı track olarak eklenir
     │  DataChannel açılır
     ▼
exchangeSDP — SDP offer → OpenAI Realtime endpoint → SDP answer
     │  ICE bağlantısı kurulur
     ▼
DataChannel açıldığında response.create gönderilir
     │  Asistan açılış metnini okumaya başlar
     ▼
Gerçek zamanlı olay döngüsü:
  conversation.item.input_audio_transcription.completed → kullanıcı transkript
  response.audio_transcript.delta / done               → asistan transkript
  response.done (function_call çıkışı varsa):
     │
     ▼
  POST /api/voice/tool
     │  FastAPI ilgili tool'u çalıştırır (DB veya ChromaDB)
     │  Sonuç döner
     ▼
  dc.send(conversation.item.create + function_call_output)
  dc.send(response.create) → asistan yanıtlamaya devam eder

Görüşme biter (Logo tıklanır):
POST /api/voice/end
     │  transkript + token kullanımı gönderilir
     │  conversations + messages tablolarına yazılır
     │  Maliyet hesaplanır ve loglanır
     ▼
Dashboard'a yönlendirilir

Ortam efektleri (Web Audio API):
  - Brown noise + telefon bandpass filtresi (çağrı merkezi atmosferi)
  - Rastgele aralıklarla DTMF tıklama sesleri
  - Rastgele aralıklarla telefon çalma efekti
```

---

## 11. Frontend Bileşenleri

### Sayfalar

**LoginPage** — E-posta ve şifre formu. Başarılı login'de JWT ve müşteri bilgisi `authStore`'a yazılır, `/dashboard`'a yönlendirilir.

**DashboardPage** — Ana ekran. Sol kenar çubuğunda hesap detayları (`AccountPanel`), orta alanda bakiye özeti / son işlemler / bilet sayacı, sağ altta açılır chat paneli (`ChatPanel`), sağ altta sabit ses butonu (→ VoicePage).

**VoicePage** — Tam ekran ses arayüzü. Oturum durumuna göre logo animasyonu (`logo-breathe` → `logo-morph` → `logo-pulse`) ve halka efektleri değişir. Ses görselleştirilmesi StatusLabel ile gösterilir. Transkript gerçek zamanlı olarak TranscriptPanel'e eklenir.

### Zustand Store'ları

| Store | Tutulan Veri |
|---|---|
| `authStore` | `customer`, `token`, `login()`, `logout()` |
| `accountStore` | `accounts`, `transactions`, `tickets`, `fetchAll()` |
| `chatStore` | `sessionId`, `messages`, `sendMessage()`, `endSession()` |
| `voiceStore` | `status`, `transcript`, `peerConnection`, `dataChannel`, `sessionId` |

---

## 12. Kimlik Doğrulama

**Web:** E-posta + şifre → JWT (HS256, varsayılan 8 saat geçerlilik). Token `authStore`'da tutulur, `client.js`'deki Axios interceptor her isteğe `Authorization: Bearer` başlığını ekler.

**API (backend):** `get_current_customer` FastAPI dependency'si her korumalı endpoint'te token'ı doğrular, geçerli `Customer` nesnesini döndürür. Geçersiz ya da süresi dolmuş token'da `401 Unauthorized` dönülür.

**Ses kimlik doğrulama:** Ses oturumu başladığında asistan, sistem promptundaki akışa göre müşteriden baba adını ve doğum yerini ister. `verify_customer_identity` tool'u bu bilgileri veritabanındaki `father_name` ve `birth_place` alanlarıyla karşılaştırır. Doğrulama geçilmeden hesap bilgisi paylaşılmaz; 3 başarısız denemede `escalate_to_human` çağrılır.

---

## 13. Token ve Maliyet İzleme

Her konuşma sonunda sunucu loguna detaylı bir maliyet raporu yazdırılır.

**Chat oturumu:**
- `prompt_tokens` ve `completion_tokens` her `agent_node` çağrısında kümülatif olarak `AgentState`'e eklenir.
- Embedding token sayısı `tools.py` içindeki `_embedding_tokens_accumulated` global sayacında toplanır.
- Oturum sonunda `calc_chat_cost("gpt-4o", ...)` ve `calc_embedding_cost(...)` hesaplanır.

**Ses oturumu:**
- Frontend her `response.done` event'inden `input_token_details` ve `output_token_details` toplar.
- `POST /api/voice/end` ile gönderilen token sayımları `calc_realtime_cost(...)` ile hesaplanır.

**Fiyatlandırma (Mayıs 2025, USD / 1M token):**

| Model | Input | Output |
|---|---|---|
| gpt-4o (chat) | $2.50 | $10.00 |
| gpt-4o-realtime (metin) | $5.00 | $20.00 |
| gpt-4o-realtime (ses) | $100.00 | $200.00 |
| text-embedding-3-small | $0.02 | — |

---

## 14. Ortam Değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun:

```bash
cp .env.example .env
```

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | SQLAlchemy bağlantı dizesi |
| `POSTGRES_USER / PASSWORD / DB` | Docker Compose'un postgres servisi için |
| `JWT_SECRET` | En az 32 karakter rastgele string (`openssl rand -hex 32`) |
| `JWT_EXPIRE_HOURS` | Token geçerlilik süresi (varsayılan: 8) |
| `OPENAI_API_KEY` | OpenAI API anahtarı |
| `OPENAI_CHAT_MODEL` | Chat modeli (varsayılan: `gpt-4o`) |
| `OPENAI_REALTIME_MODEL` | Ses modeli (varsayılan: `gpt-realtime`) |
| `OPENAI_REALTIME_VOICE` | Ses tonu (varsayılan: `alloy`) |
| `OPENAI_EMBEDDING_MODEL` | Embedding modeli (varsayılan: `text-embedding-3-small`) |
| `CHROMA_PERSIST_DIR` | ChromaDB veri dizini (varsayılan: `/app/chroma_data`) |
| `CHROMA_COLLECTION` | Koleksiyon adı (varsayılan: `nexus_bank_kb`) |
| `CORS_ORIGINS` | İzin verilen origin'ler, virgülle ayrılmış |
| `VITE_API_URL` | Frontend'in backend'e gönderdiği base URL |

---

## 15. Kurulum ve Çalıştırma

### Ön Koşullar

- Docker ve Docker Compose
- OpenAI API anahtarı (GPT-4o ve Realtime API erişimi)

### Docker Compose ile (Önerilen)

```bash
# 1. Depoyu klonlayın
git clone <repo-url>
cd nexus-bank-ai-assistant

# 2. Ortam değişkenlerini ayarlayın
cp .env.example .env
# .env dosyasını açarak OPENAI_API_KEY ve JWT_SECRET değerlerini doldurun

# 3. Servisleri başlatın
docker compose up --build
```

Servisler ayağa kalktığında:

| Adres | Servis |
|---|---|
| http://localhost:3000 | Frontend (React) |
| http://localhost:8000 | Backend API |
| http://localhost:8000/docs | Swagger UI |
| http://localhost:8080 | Adminer (PostgreSQL yönetimi) |

İlk başlatmada backend otomatik olarak:
1. PostgreSQL'in hazır olmasını bekler (healthcheck).
2. Alembic migrasyonlarını çalıştırır (tablo oluşturma).
3. `seed.py` ile 100 müşteri ve ilgili verileri yükler.
4. ChromaDB koleksiyonu boşsa 63 belgeyi embed ederek yükler.

### Yerel Geliştirme (Docker olmadan)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# PostgreSQL'in çalıştığından emin olun (docker compose up postgres)
uvicorn main:app --reload --port 8000

# Frontend (ayrı terminal)
cd frontend
npm install
npm run dev   # http://localhost:5173
```

### Veritabanı Migrasyonları

```bash
# Mevcut şemayı oluştur
docker compose exec backend alembic upgrade head

# Yeni migrasyon oluştur
docker compose exec backend alembic revision --autogenerate -m "açıklama"
```

---

## 16. Mock Veri

`database/seed.py` Faker kütüphanesiyle gerçekçi demo veritabanı oluşturur:

| Tablo | Miktar |
|---|---|
| Müşteri | 100 |
| Hesap | Müşteri başına 2–4 (vadesiz, mevduat, vadeli, kredi kartı) |
| İşlem | Hesap başına 20–50 |
| Kredi | Müşterilerin ~%60'ında 1–2 kredi |
| Kredi kartı | `credit_card` tipi hesaplara bağlı |
| Destek talebi | Müşteri başına 5–10 |

Her müşteri için `father_name` ve `birth_place` alanları da doldurulur; sesli kimlik doğrulama bu değerleri kullanır.

Herhangi bir demo hesabın e-postasını öğrenmek için:

```bash
docker compose exec postgres psql -U nexus -d nexus_bank \
  -c "SELECT name, email FROM customers LIMIT 5;"
```

Seed ile oluşturulan tüm şifreler `Password123!` olarak ayarlanmıştır.
