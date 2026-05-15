# Nexus Bank AI Assistant — Product Requirements Document

| | |
|---|---|
| **Project** | Nexus Bank AI Assistant |
| **Version** | 2.0 (WebRTC Edition) |
| **Status** | In Progress |
| **Stack** | React · FastAPI · LangGraph · PostgreSQL · Chroma · OpenAI |
| **Author** | Yigit Alver |
| **Updated** | 2026 — WebRTC transport migration + identity verification |

> **What changed in v2.0:**
> Voice agent transport migrated from WebSocket proxy to WebRTC + ephemeral token pattern. Model string updated to `gpt-realtime` (GA). Identity verification flow added (father's name + birthplace) as a mandatory step before every voice session. Database schema extended with `father_name` and `birth_place` fields. Session config, audio pipeline, tool set (now 7 tools), system prompt, and development phases updated accordingly.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Branding & Design System](#2-branding--design-system)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Database Schema](#5-database-schema)
6. [LangGraph Agent Design](#6-langgraph-agent-design)
7. [API Endpoints](#7-api-endpoints)
8. [Frontend — React UI](#8-frontend--react-ui)
9. [Voice Agent (WebRTC)](#9-voice-agent-webrtc)
10. [Knowledge Base](#10-knowledge-base-chroma--rag)
11. [Authentication & Security](#11-authentication--security)
12. [Session Management](#12-session-management)
13. [MVP Features](#13-mvp-features)
14. [Development Phases](#14-development-phases)
15. [Folder Structure](#15-folder-structure)
16. [Error Handling & Edge Cases](#16-error-handling--edge-cases)
17. [Future Enhancements](#17-future-enhancements)

---

## 1. Project Overview

### Summary

Nexus Bank AI Assistant is an industry-grade, AI-powered customer support system for a fictional digital bank. The system provides two interaction modes: a text-based chat interface and a real-time voice agent. Built with LangGraph for multi-step reasoning, the assistant can query account data, retrieve knowledge base answers via RAG, create support tickets, and escalate complex issues — all within a secure, JWT-authenticated environment.

### Goals

- Demonstrate production-grade AI engineering skills (LangGraph, RAG, Realtime API)
- Showcase full-stack development capability (React + FastAPI)
- Build a portfolio piece targeting AI Engineer roles in fintech
- Simulate a realistic banking assistant with mock data and real AI reasoning

### Key Features

| Feature | Description |
|---|---|
| Chat Assistant | Text-based AI chat with LangGraph agent and RAG |
| Voice Agent | Real-time voice via OpenAI Realtime API + WebRTC (Turkish) |
| Identity Verification | Voice sessions begin with father's name + birthplace check |
| Account Info | Query balances, transactions, loan status from PostgreSQL |
| RAG Support | FAQ and product knowledge via Chroma vector database |
| Ticket System | Create and track support tickets |
| JWT Auth | Secure login with personalized greeting |
| Session Memory | In-memory during session, persisted to DB after |

---

## 2. Branding & Design System

### Brand Identity

Nexus Bank is a fictional digital bank with a modern, technology-forward identity. The name "Nexus" conveys connection and network — fitting for a bank that connects people to their finances through AI.

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| Primary | `#1A1F36` | Dark navy — trust, professionalism |
| Accent | `#4F46E5` | Indigo — technology, modernity |
| Secondary | `#6366F1` | Light indigo — secondary actions |
| Background | `#F8FAFC` | Page background |
| Success | `#10B981` | Positive states, confirmations |
| Error | `#EF4444` | Errors, alerts |
| Text Muted | `#64748B` | Secondary text, hints |

### Typography

- **Font Family:** Inter (Google Fonts) — clean, modern, readable
- **Headings:** Inter Bold (700) — 32px / 24px / 20px / 16px scale
- **Body:** Inter Regular (400) — 14px, line-height 1.6
- **Code/Monospace:** JetBrains Mono — terminal, code blocks
- **Language:** English (UI), Turkish (Voice Agent)

---

## 3. System Architecture

### High-Level Architecture

```
React Frontend (Port 3000)
    |
    HTTP / WebRTC signalling (voice)
    |
FastAPI Backend (Port 8000)
    /api/chat         → LangGraph Agent
    /api/voice/token  → Ephemeral token endpoint [NEW]
    /api/voice/tool   → Tool call executor [NEW]
    /api/voice/end    → Transcript persistence [NEW]
    /api/auth         → JWT Auth
    /api/account      → Direct DB queries
    |
    ┌──────┼──────────────┐
    │      │              │
LangGraph PostgreSQL     Chroma
Agent     (Port 5432)    (embedded)
    │
    Tools:
      verify_customer_identity → PostgreSQL  ← NEW
      search_knowledge_base    → Chroma
      get_account_info         → PostgreSQL
      get_transaction_history  → PostgreSQL
      get_loan_status          → PostgreSQL
      create_support_ticket    → PostgreSQL
      escalate_to_human        → Internal
```

### Voice Architecture (WebRTC)

The voice agent uses WebRTC for direct browser-to-OpenAI audio transport. The FastAPI backend acts only as a Control Plane — it mints ephemeral tokens and executes tool calls; it never proxies audio.

```
Step 1  React → POST /api/voice/token (JWT auth)
Step 2  FastAPI → OpenAI REST: create ephemeral token, inject session config
        (model, Turkish system prompt, 7 tool definitions, customer_id)
Step 3  FastAPI → React: { client_secret, session_id }
Step 4  React → OpenAI Realtime API: WebRTC handshake (SDP exchange via data channel)
Step 5  Audio flows DIRECTLY React ↔ OpenAI (no backend hop)
Step 6  OpenAI asks identity questions → user answers via mic
Step 7  Function call events → OpenAI data channel → React → POST /api/voice/tool
Step 8  FastAPI executes verify_customer_identity → returns "verified" / "verification_failed"
Step 9  OpenAI continues audio (proceeds if verified, escalates if not)
Step 10 On session end: React POSTs transcript → FastAPI persists to DB
```

> **Removed vs v1.0:** `WS /api/voice/ws` (WebSocket proxy). Audio no longer passes through the backend — replaced by ephemeral token + client-side WebRTC. This removes the double network hop, eliminates manual PCM16 buffering, and gives the browser native echo cancellation and interrupt handling.

### Container Architecture

| Service | Image | Port | Notes |
|---|---|---|---|
| frontend | `node:20-alpine` | 3000 | React app (Vite) |
| backend | `python:3.11-slim` | 8000 | FastAPI + LangGraph + Chroma |
| postgres | `postgres:16` | 5432 | Main database |

---

## 4. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend | React | 18+ | UI framework |
| Frontend | Vite | latest | Build tool |
| Frontend | TailwindCSS | 3+ | Styling |
| Frontend | React Router | v6 | Client routing |
| Frontend | Zustand | latest | State management |
| Backend | FastAPI | 0.111+ | REST API |
| Backend | LangGraph | latest | Agent orchestration |
| Backend | LangChain | latest | LLM tooling |
| Backend | SQLAlchemy | 2.0+ | ORM |
| Backend | python-jose | latest | JWT auth |
| Backend | Pydantic | v2 | Data validation |
| Database | PostgreSQL | 16 | Main relational DB |
| Vector DB | Chroma | latest | RAG vector store (embedded) |
| AI | OpenAI gpt-realtime | GA | Voice agent (replaces preview) |
| AI | OpenAI GPT-4o | latest | Chat completions |
| AI | text-embedding-3-small | latest | Embeddings for RAG |
| Infra | Docker Compose | v2 | Container orchestration |

> **Model update:** `gpt-4o-realtime-preview` has been replaced by the GA model `gpt-realtime` (snapshot: `gpt-realtime-2025-08-28`). Use `gpt-realtime-mini` for cost-sensitive workloads.

---

## 5. Database Schema

### customers
- `id` (UUID, PK)
- `name` (VARCHAR)
- `email` (VARCHAR, unique)
- `password_hash` (VARCHAR)
- `phone` (VARCHAR)
- `national_id` (VARCHAR)
- `father_name` (VARCHAR, nullable) ← **NEW** — used for voice identity verification
- `birth_place` (VARCHAR, nullable) ← **NEW** — used for voice identity verification
- `created_at` (TIMESTAMP)

### accounts
- `id` (UUID, PK)
- `customer_id` (FK → customers)
- `type` (ENUM: checking, savings, time_deposit, credit_card)
- `balance` (DECIMAL)
- `currency` (VARCHAR, default: TRY)
- `iban` (VARCHAR)
- `status` (ENUM: active, frozen, closed)
- `created_at` (TIMESTAMP)

### transactions
- `id` (UUID, PK)
- `account_id` (FK → accounts)
- `type` (ENUM: credit, debit)
- `amount` (DECIMAL)
- `description` (VARCHAR)
- `category` (VARCHAR)
- `created_at` (TIMESTAMP)

### loans
- `id` (UUID, PK)
- `customer_id` (FK → customers)
- `type` (ENUM: personal, mortgage, vehicle)
- `amount` (DECIMAL)
- `interest_rate` (DECIMAL)
- `monthly_payment` (DECIMAL)
- `remaining_amount` (DECIMAL)
- `status` (ENUM: pending, approved, rejected, active, closed)
- `applied_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### credit_cards
- `id` (UUID, PK)
- `account_id` (FK → accounts)
- `card_number_masked` (VARCHAR)
- `credit_limit` (DECIMAL)
- `available_limit` (DECIMAL)
- `billing_date` (INT)
- `due_date` (INT)
- `status` (ENUM: active, blocked, expired)

### support_tickets
- `id` (UUID, PK)
- `customer_id` (FK → customers)
- `subject` (VARCHAR)
- `description` (TEXT)
- `status` (ENUM: open, in_progress, resolved, closed)
- `priority` (ENUM: low, medium, high)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### conversations
- `id` (UUID, PK)
- `customer_id` (FK → customers)
- `mode` (ENUM: chat, voice)
- `started_at` (TIMESTAMP)
- `ended_at` (TIMESTAMP)

### messages
- `id` (UUID, PK)
- `conversation_id` (FK → conversations)
- `role` (ENUM: user, assistant)
- `content` (TEXT)
- `tool_used` (VARCHAR, nullable)
- `created_at` (TIMESTAMP)

### Mock Data Seed

A `seed.py` script generates: 100 customers (with `father_name` and `birth_place` populated via Faker), 2-4 accounts per customer, 20-50 transactions per account (last 6 months), 0-2 loans per customer, credit card for ~60% of customers, 5-10 open support tickets total. Demo customer `Ahmet Yılmaz` has fixed values (`father_name="Mehmet"`, `birth_place="Ankara"`) for predictable testing.

---

## 6. LangGraph Agent Design

### Agent State

```python
class AgentState(TypedDict):
    messages: list[BaseMessage]
    customer_id: str
    customer_name: str
    tool_calls_made: list[str]
    session_id: str
```

### Graph Flow

```
[START]
   ↓
[agent_node]  — GPT-4o / gpt-realtime decides which tool to call
   ↓
[should_continue]  — conditional edge
    ├── tool_call → [tools_node]
    │                  ↓
    │           back to [agent_node]
    └── end → [END]
```

### Tools

| Tool Name | Input | Output | Source | Mode |
|---|---|---|---|---|
| `verify_customer_identity` | customer_id, father_name, birth_place | `"verified"` / `"verification_failed"` | PostgreSQL | Voice only |
| `search_knowledge_base` | query: str | relevant docs + sources | Chroma | Both |
| `get_account_info` | customer_id: str | accounts list with balances | PostgreSQL | Both |
| `get_transaction_history` | customer_id, limit=10 | recent transactions | PostgreSQL | Both |
| `get_loan_status` | customer_id: str | loans with status & payments | PostgreSQL | Both |
| `create_support_ticket` | customer_id, subject, description | ticket_id + ETA | PostgreSQL | Both |
| `escalate_to_human` | customer_id, reason | escalation ref number | Internal | Both |

> The chat agent (`/api/chat`) uses all 7 tools. The voice session config sent to OpenAI includes all 7 tool definitions. `verify_customer_identity` never reveals mismatched field values — it returns only `"verified"` or `"verification_failed"` to prevent enumeration attacks.

### System Prompts

**Chat (English):**
```
You are a helpful AI banking assistant for Nexus Bank.
The customer you are speaking with is {customer_name} (ID: {customer_id}).
You have access to their account data and the Nexus Bank knowledge base.
Always be professional, concise, and friendly.
Use the available tools to answer questions — do not guess account data.
Never reveal sensitive data beyond what is necessary.
If a request is outside your capabilities, create a support ticket or escalate to a human agent.
```

**Voice (Turkish) — updated with identity verification flow:**
```
Sen Nexus Bank'ın yapay zeka destekli müşteri hizmetleri asistanısın.
Konuştuğun müşteri: {customer_name} (ID: {customer_id}).

Kimlik Doğrulama Kuralları:
- Görüşmeye başlamadan önce müşteriyi doğrulamak zorundasın.
- Önce baba adını, sonra doğum yerini sor.
- Her iki bilgiyi de aldıktan sonra, "Bilgilerinizi kontrol ediyorum, bir moment lütfen..."
  diyerek verify_customer_identity aracını çağır.
- Sonuç "verified" ise görüşmeye devam et.
- Sonuç "verification_failed" ise kibarca tekrar sor; 3 başarısız denemeden sonra
  escalate_to_human aracını çağır ve görüşmeyi sonlandır.

Genel Kurallar:
- Her zaman kibarca, profesyonelce ve kısaca cevap ver.
- Hesap bilgilerini tahmin etme — her zaman uygun aracı kullan.
- Hassas bilgileri yalnızca gerektiğinde paylaş.
- Yapamayacağın bir işlem varsa destek talebi oluştur veya insan temsilciye aktar.
```

---

## 7. API Endpoints

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Email + password → JWT token + customer info |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/auth/me` | Get current user from JWT |

### Chat

| Method | Path | Description |
|---|---|---|
| POST | `/api/chat` | Send message → LangGraph agent → response + tool_used |
| GET | `/api/chat/history/{session_id}` | Get conversation history |
| POST | `/api/chat/end` | End session, persist to DB |

### Voice (WebRTC)

| Method | Path | Description |
|---|---|---|
| POST | `/api/voice/token` | Mint ephemeral token + session config (7 tools) → return to client |
| POST | `/api/voice/tool` | Execute LangGraph tool call from client, return result |
| POST | `/api/voice/end` | Persist transcript to conversations + messages tables |

> **Removed:** `WS /api/voice/ws` (WebSocket proxy). Audio no longer passes through the backend.

### Account

| Method | Path | Description |
|---|---|---|
| GET | `/api/account/{customer_id}` | Account summary for sidebar |
| GET | `/api/transactions/{customer_id}` | Recent transactions for sidebar |
| GET | `/api/tickets/{customer_id}` | Open support tickets |

### Knowledge

| Method | Path | Description |
|---|---|---|
| POST | `/api/knowledge/ingest` | Ingest document into Chroma |
| GET | `/api/knowledge/search` | Search knowledge base (debug) |

---

## 8. Frontend — React UI

### Pages & Components

#### Login Page (`/login`)
- Nexus Bank logo centered
- Email + password fields
- Sign In button → JWT stored in memory
- Personalized redirect after login
- "Connect to Voice Assistant" button (redirects to `/voice`)
- Animated sound wave icon for voice option

#### Dashboard (`/dashboard`)
- Header: "Welcome back, [First Name]" + logout
- Left panel (30%): Account summary, balances, recent transactions, open tickets
- Right panel (70%): Chat interface
- Chat: message bubbles, tool_used badge, RAG source citations
- Typing indicator when agent is processing
- Switch to Voice button in header

#### Voice Agent (`/voice`)
- Large animated microphone orb (center)
- Sound wave visualization (moves when speaking)
- Status: `Listening...` / `Speaking...` / `Processing...` / `Verifying...`
- Transcript panel below (scrollable)
- Back to Chat button
- Connection handled via WebRTC (no WebSocket to backend for audio)

### State Management (Zustand)

- `authStore`: user info, JWT token, login/logout actions
- `chatStore`: messages, session_id, loading state, send message action
- `accountStore`: account data, transactions, tickets (fetched on login)
- `voiceStore`: WebRTC connection state, transcript, audio state, ephemeral token

### Component Tree

```
App
├── LoginPage
│   ├── NexusLogo
│   ├── LoginForm
│   └── VoiceConnectButton
├── DashboardPage
│   ├── Header
│   ├── AccountPanel
│   │   ├── AccountSummary
│   │   ├── TransactionList
│   │   └── TicketList
│   └── ChatPanel
│       ├── MessageList
│       │   └── MessageBubble (tool badge, sources)
│       ├── TypingIndicator
│       └── MessageInput
└── VoicePage
    ├── VoiceOrb (animated, AnalyserNode-driven)
    ├── StatusLabel (Listening/Speaking/Processing/Verifying)
    └── TranscriptPanel
```

---

## 9. Voice Agent (WebRTC)

The voice agent uses OpenAI's Realtime API via WebRTC. The browser connects directly to OpenAI's media edge — the FastAPI backend only mints ephemeral tokens and executes tool calls. Audio never passes through the backend.

### Session Initialisation Flow

1. User opens `/voice` page
2. React → `POST /api/voice/token { Authorization: Bearer <token> }`
3. FastAPI:
   - Decode JWT → `customer_id`, `customer_name`
   - Build session config (see below)
   - `POST https://api.openai.com/v1/realtime/sessions`
     - Headers: `Authorization: Bearer OPENAI_API_KEY`, `OpenAI-Safety-Identifier: sha256(customer_id)`
   - Return `{ client_secret, session_id }` to React
4. React creates `RTCPeerConnection`
5. React adds local audio track (`getUserMedia`)
6. React creates data channel (`"oai-events"`) for control events
7. React creates SDP offer → POST to OpenAI Realtime with `client_secret`
8. React sets remote SDP answer → ICE negotiation completes
9. Audio streams DIRECTLY: React mic → OpenAI / OpenAI TTS → React speaker

### Session Config (sent by FastAPI)

```json
{
  "model": "gpt-realtime",
  "modalities": ["audio", "text"],
  "instructions": "<Turkish system prompt with identity verification rules>",
  "voice": "alloy",
  "input_audio_format": "pcm16",
  "output_audio_format": "pcm16",
  "input_audio_transcription": { "model": "whisper-1" },
  "turn_detection": {
    "type": "server_vad",
    "threshold": 0.5,
    "prefix_padding_ms": 300,
    "silence_duration_ms": 500
  },
  "tools": [ "...7 LangGraph tool definitions..." ],
  "tool_choice": "auto",
  "temperature": 0.8,
  "max_response_output_tokens": 1024
}
```

### Identity Verification Flow (Voice)

```
Agent: "Merhaba, Nexus Bank müşteri hizmetlerine hoş geldiniz.
        Sizi doğrulamam gerekiyor. Babanızın adı nedir?"
User:  "Mehmet"
Agent: "Teşekkürler. Doğum yeriniz neresi?"
User:  "Ankara"
Agent: "Bilgilerinizi kontrol ediyorum, bir moment lütfen..."
       [verify_customer_identity tool called → "verified"]
Agent: "Kimliğiniz doğrulandı. Size nasıl yardımcı olabilirim?"
```

On failure (up to 3 attempts):
```
Agent: "Üzgünüm, bilgilerinizi doğrulayamadım."
       [escalate_to_human called]
Agent: "Sizi insan temsilcimize bağlıyorum."
```

### Tool Call Flow (via data channel)

```
OpenAI emits on data channel:
{ type: "response.done", output: [{ type: "function_call", name: "...", arguments: "..." }] }

React:
1. Parse function_call from data channel event
2. POST /api/voice/tool { session_id, name, arguments } (JWT auth)

FastAPI:
3. Execute matching LangGraph tool with customer_id from JWT
4. Return { result }

React:
5. Send on data channel:
   { type: "conversation.item.create",
     item: { type: "function_call_output", call_id: "...", output: result } }
6. Send on data channel:
   { type: "response.create" }

OpenAI:
7. Resumes audio response incorporating the tool result
```

### Interrupt Handling

With WebRTC transport, the server manages the output audio buffer and knows exactly how much audio has been played at any moment. When the user starts speaking mid-response, OpenAI automatically truncates unplayed audio and starts a new response. No client-side truncation logic required.

### Frontend Audio

WebRTC handles all audio plumbing natively. No AudioWorklet, no manual PCM16 encoding, no speaker buffer management. The React component only needs:

- `navigator.mediaDevices.getUserMedia({ audio: true })` — capture mic
- `pc.addTrack(stream.getAudioTracks()[0])` — attach to peer connection
- `pc.ontrack = (e) => audioEl.srcObject = e.streams[0]` — play TTS output
- `dataChannel.onmessage` — receive transcript + function_call events

---

## 10. Knowledge Base (Chroma + RAG)

### Content Categories

| Category | Documents | Examples |
|---|---|---|
| FAQ | 20 docs | Password reset, card blocking, transfer limits |
| Products | 15 docs | Credit card types, deposit rates, loan products |
| Procedures | 10 docs | Complaint process, application steps |
| Security | 8 docs | Fraud prevention, 2FA, phishing warnings |
| Branch/ATM | 5 docs | Working hours, locations, services |
| Legal | 5 docs | KVKK, privacy policy, terms |

### Chunking Strategy

- **Chunk size:** 300 tokens
- **Overlap:** 50 tokens
- **Embedding model:** `text-embedding-3-small` (1536 dimensions)
- **Metadata per chunk:** category, doc_id, title, language
- **Collection:** `nexus_bank_kb` in Chroma

### Ingest Script

`knowledge/seed_kb.py` loads all documents from `knowledge/docs/`, chunks them, embeds via OpenAI, and stores in Chroma. Runs automatically on container startup if collection is empty.

---

## 11. Authentication & Security

### JWT Flow

```
POST /api/auth/login
Body: { email, password }
  → Verify against customers table (bcrypt hash)
  → Generate JWT: { sub: customer_id, name: customer_name, exp: +8h }
  → Return: { access_token, token_type: "bearer", customer: {...} }

All protected routes:
  Header: Authorization: Bearer <token>
  FastAPI dependency: get_current_customer(token) → customer_id
```

### Security Measures

- Passwords hashed with bcrypt (passlib)
- JWT secret stored in `.env` (never committed)
- Token expiry: 8 hours
- All account queries filtered by `customer_id` from JWT — no horizontal privilege escalation
- CORS configured for frontend origin only
- OpenAI API key stored in `.env`, never exposed to frontend
- WebRTC: ephemeral tokens minted per session — long-lived API key never leaves backend
- Ephemeral token valid for one session only (OpenAI enforces this server-side)
- `verify_customer_identity` returns only `"verified"` / `"verification_failed"` — never reveals which field was wrong
- Safety identifier: `sha256(customer_id)` sent in `OpenAI-Safety-Identifier` header

---

## 12. Session Management

- During conversation: LangGraph state holds full message history in memory
- `session_id` generated on first message (UUID)
- On session end (`/api/chat/end`): full conversation persisted to `conversations` + `messages` tables
- Voice sessions persisted via `POST /api/voice/end` with transcript from data channel events
- Frontend stores `session_id` in Zustand (memory only, not localStorage)

### LangGraph Checkpointer

Use `MemorySaver` checkpointer for in-session persistence. Each session has a `thread_id` (= `session_id`). On session end, extract state and write to PostgreSQL.

---

## 13. MVP Features

### MVP (Must Have)

| # | Feature | Priority |
|---|---|---|
| 1 | JWT login + personalized greeting | P0 |
| 2 | Chat interface (React) | P0 |
| 3 | LangGraph agent with all 7 tools | P0 |
| 4 | PostgreSQL with mock data (100 customers) | P0 |
| 5 | Chroma RAG with knowledge base | P0 |
| 6 | Account summary sidebar | P0 |
| 7 | Voice agent (WebRTC, gpt-realtime, Turkish) | P0 |
| 8 | Identity verification before voice session | P0 |
| 9 | Docker Compose setup | P0 |

### Post-MVP (Nice to Have)

- Conversation history page — view past sessions
- Email notification simulation for ticket creation
- Multi-language toggle (EN/TR) for chat mode
- Admin panel — view all conversations and tickets
- Rate limiting on API endpoints
- Structured logging (tool calls, latency, errors)
- Demo mode — auto-play demo conversation
- Push-to-talk mode (disable VAD, spacebar gate)

---

## 14. Development Phases

### Phase 1 — Foundation (Day 1-2) ✅

- Initialize repo, folder structure, git
- `docker-compose.yml` with backend + postgres containers
- FastAPI skeleton with health endpoint
- SQLAlchemy models (all 8 tables + `father_name`, `birth_place` in customers)
- Alembic migrations
- `seed.py` — generate 100 customers + mock data (including identity fields)
- JWT auth endpoints (login, me)
- Verify: login returns token, `/api/auth/me` returns customer

### Phase 2 — Agent Core (Day 3-4) ✅

- Chroma setup + knowledge base documents
- `seed_kb.py` — ingest all docs
- LangGraph agent: state, graph, all 7 tools (including `verify_customer_identity`)
- `POST /api/chat` endpoint
- Test agent with Postman: all tools responding correctly
- Session management with `MemorySaver`
- `POST /api/chat/end` — persist to DB

### Phase 3 — React Frontend (Day 5-6) ✅

- Vite + React + TailwindCSS setup
- frontend Dockerfile + add to docker-compose
- Login page — JWT stored in Zustand
- Dashboard layout (sidebar + chat panel)
- Account sidebar: balances, transactions, tickets
- Chat interface: send message, display response, tool badge
- Typing indicator, scroll behaviour
- Routing: `/login`, `/dashboard`

### Phase 4 — Voice Agent / WebRTC (Day 7-8)

- `customers` schema: add `father_name` + `birth_place` (migration + seed update)
- `verify_customer_identity` tool in `tools.py`
- `VOICE_SYSTEM_PROMPT` updated with identity verification flow
- `POST /api/voice/token` — mint ephemeral token, build session config with 7 tools
- `POST /api/voice/tool` — execute LangGraph tool call from client
- `POST /api/voice/end` — persist voice transcript to DB
- React: `RTCPeerConnection` setup, SDP exchange with OpenAI
- React: `getUserMedia` mic track + `ontrack` speaker playback
- React: data channel listener — parse `transcript_delta` + `function_call` events
- React: tool call dispatcher → `POST /api/voice/tool` → inject result back via data channel
- `VoicePage.jsx`: orb animation tied to audio level (`AnalyserNode` on remote stream)
- `StatusLabel`: Listening / Speaking / Processing / Verifying states
- `TranscriptPanel`: scrollable, built from `transcript_delta` events
- End-to-end test: identity verification → bakiyeyi okusun, ticket oluştursun

### Phase 5 — Polish & Deploy (Day 9-10)

- Error handling throughout (agent, API, frontend)
- Loading states and edge cases in UI
- Environment variables cleanup (`.env.example`)
- `README.md`
- Architecture diagram
- Screenshots for portfolio
- Final Docker Compose test (clean build)
- GitHub push

---

## 15. Folder Structure

```
nexus-bank-ai-assistant/
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   ├── config.py
│   ├── auth/
│   │   ├── router.py
│   │   └── utils.py
│   ├── agent/
│   │   ├── graph.py
│   │   ├── tools.py          ← verify_customer_identity added (7th tool)
│   │   ├── prompts.py        ← VOICE_SYSTEM_PROMPT updated
│   │   └── state.py
│   ├── voice/
│   │   ├── token.py          ← ephemeral token endpoint
│   │   ├── tool.py           ← tool call executor
│   │   └── persist.py        ← transcript persistence
│   ├── database/
│   │   ├── connection.py
│   │   ├── models.py         ← father_name, birth_place fields added
│   │   ├── schemas.py
│   │   └── seed.py           ← identity fields in seed data
│   ├── knowledge/
│   │   ├── chroma_client.py
│   │   ├── ingest.py
│   │   └── docs/
│   └── routers/
│       ├── chat.py
│       ├── account.py
│       └── knowledge.py
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── store/
│       │   ├── authStore.js
│       │   ├── chatStore.js
│       │   ├── accountStore.js
│       │   └── voiceStore.js       ← WebRTC state (no WS)
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── DashboardPage.jsx
│       │   └── VoicePage.jsx
│       ├── components/
│       │   ├── NexusLogo.jsx
│       │   ├── ChatPanel.jsx
│       │   ├── MessageBubble.jsx
│       │   ├── AccountPanel.jsx
│       │   ├── VoiceOrb.jsx
│       │   ├── TypingIndicator.jsx
│       │   └── TranscriptPanel.jsx
│       ├── lib/
│       │   └── webrtc.js           ← RTCPeerConnection helpers
│       └── api/
│           └── client.js
└── docs/
    ├── Nexus_Bank_PRD.md
    └── architecture.png
```

> **Removed:** `backend/voice/proxy.py` (WebSocket proxy). Replaced by three focused modules: `token.py`, `tool.py`, `persist.py`. Added: `frontend/src/lib/webrtc.js` for `RTCPeerConnection` helpers.

---

## 16. Error Handling & Edge Cases

| Scenario | Handling |
|---|---|
| Identity verification fails (1-2 attempts) | Agent kindly re-asks; tracks attempt count in conversation |
| Identity verification fails (3rd attempt) | `escalate_to_human` called; session ends gracefully |
| `verify_customer_identity` DB error | Return `"verification_failed"` (never expose internals) |
| Tool returns empty result | Agent responds: "I could not find that information" |
| PostgreSQL query error | Return 500, agent says "temporary issue" |
| OpenAI API timeout | Retry once, then return error message to user |
| JWT expired | Return 401, frontend redirects to login |
| WebRTC ICE negotiation fails | Frontend shows "Connection failed, retry" button |
| Ephemeral token fetch fails | Frontend shows error, prevents voice session start |
| Data channel disconnects mid-session | Frontend attempts reconnect; if fails, shows manual retry |
| Tool call POST fails (`/api/voice/tool`) | React sends error result back to OpenAI data channel; model continues gracefully |
| Chroma returns no results | Agent falls back to general response |
| Invalid `customer_id` in JWT | Return 403 Forbidden |
| Agent max iterations reached | Return partial response with explanation |
| OpenAI Safety rate limit | Return 429, show friendly error to user |

---

## 17. Future Enhancements

### Short Term
- Conversation history page with search
- Email simulation for ticket notifications
- Rate limiting (slowapi)
- Structured logging with tool call analytics

### Medium Term
- Multi-language support (EN/TR toggle)
- Admin dashboard for conversation monitoring
- Fine-tuned model on banking domain
- Push-to-talk mode (disable VAD, spacebar gate)

### Long Term
- Real bank API integration (Open Banking)
- Biometric voice authentication
- Proactive notifications ("Your bill is due tomorrow")
- Mobile app (React Native)

---

*Nexus Bank AI Assistant — PRD v2.0 — WebRTC Edition — Confidential & For Portfolio Use Only*
