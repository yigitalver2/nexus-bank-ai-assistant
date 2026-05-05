# Nexus Bank AI Assistant — Product Requirements Document

| | |
|---|---|
| **Project** | Nexus Bank AI Assistant |
| **Version** | 1.0 |
| **Status** | Planning |
| **Stack** | React · FastAPI · LangGraph · PostgreSQL · Chroma · OpenAI |
| **Author** | Yigit Alver |

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
9. [Voice Agent (Realtime API)](#9-voice-agent-realtime-api)
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
| Voice Agent | Real-time voice interaction via OpenAI Realtime API (Turkish) |
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

### Logo

The logo consists of a geometric "N" mark inside an indigo rounded square, paired with the wordmark "NEXUS BANK". Corner nodes connected by subtle lines reinforce the "nexus/network" concept. Export formats: SVG (primary), PNG 512×512, PNG 192×192 (favicon).

---

## 3. System Architecture

### High-Level Architecture

```
React Frontend (Port 3000)
    |
    HTTP / WebSocket
    |
FastAPI Backend (Port 8000)
    /api/chat    → LangGraph Agent
    /api/voice   → WebSocket Proxy → OpenAI Realtime API
    /api/auth    → JWT Auth
    /api/account → Direct DB queries
    |
    ┌──────┼──────────────┐
    │      │              │
LangGraph PostgreSQL     Chroma
Agent     (Port 5432)    (embedded)
    │
    Tools:
      search_knowledge_base   → Chroma
      get_account_info        → PostgreSQL
      get_transaction_history → PostgreSQL
      get_loan_status         → PostgreSQL
      create_support_ticket   → PostgreSQL
      escalate_to_human       → Internal
```

### Voice Architecture

```
React (Microphone)
  → WebSocket → FastAPI WebSocket Proxy
  → OpenAI Realtime API (WebSocket)
  ← Audio stream + transcription
  → LangGraph tools (when function_call received)
  ← Tool results injected back to Realtime session
  ← Audio stream → React (Speaker output)
  ← Transcript → React (Text display)
```

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
| Backend | FastAPI | 0.111+ | REST + WebSocket API |
| Backend | LangGraph | latest | Agent orchestration |
| Backend | LangChain | latest | LLM tooling |
| Backend | SQLAlchemy | 2.0+ | ORM |
| Backend | python-jose | latest | JWT auth |
| Backend | Pydantic | v2 | Data validation |
| Database | PostgreSQL | 16 | Main relational DB |
| Vector DB | Chroma | latest | RAG vector store (embedded) |
| AI | OpenAI GPT-4o | latest | Chat completions |
| AI | OpenAI Realtime API | latest | Voice agent |
| AI | text-embedding-3-small | latest | Embeddings for RAG |
| Infra | Docker Compose | v2 | Container orchestration |

---

## 5. Database Schema

### customers
- `id` (UUID, PK)
- `name` (VARCHAR)
- `email` (VARCHAR, unique)
- `password_hash` (VARCHAR)
- `phone` (VARCHAR)
- `national_id` (VARCHAR)
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

A `seed.py` script will generate: 100 customers, 2-4 accounts per customer (random types), 20-50 transactions per account (last 6 months), 0-2 loans per customer, credit card for ~60% of customers, 5-10 open support tickets total. Faker library used for realistic names, IBANs, and descriptions.

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
[agent_node]  — GPT-4o decides which tool to call
   ↓
[should_continue]  — conditional edge
    ├── tool_call → [tools_node]
    │                  ↓
    │           back to [agent_node]
    └── end → [END]
```

### Tools

| Tool Name | Input | Output | Source |
|---|---|---|---|
| `search_knowledge_base` | query: str | relevant docs + sources | Chroma |
| `get_account_info` | customer_id: str | accounts list with balances | PostgreSQL |
| `get_transaction_history` | customer_id, limit=10 | recent transactions | PostgreSQL |
| `get_loan_status` | customer_id: str | loans with status & payments | PostgreSQL |
| `create_support_ticket` | customer_id, subject, description | ticket_id + ETA | PostgreSQL |
| `escalate_to_human` | customer_id, reason | escalation ref number | Internal |

### System Prompt

```
You are a helpful banking assistant for Nexus Bank.
The customer you are speaking with is {customer_name} (ID: {customer_id}).
You have access to their account data and our knowledge base.
Always be professional, concise, and security-conscious.
Never reveal sensitive data beyond what is necessary.
If a request is outside your capabilities, create a support ticket or escalate.
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

### Voice

| Method | Path | Description |
|---|---|---|
| WS | `/api/voice/ws` | WebSocket proxy to OpenAI Realtime API |

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
- Large animated microphone button (center)
- Sound wave visualization (moves when speaking)
- Status: "Listening..." / "Speaking..." / "Processing..."
- Transcript panel below (scrollable)
- Back to Chat button

### State Management (Zustand)

- `authStore`: user info, JWT token, login/logout actions
- `chatStore`: messages, session_id, loading state, send message action
- `accountStore`: account data, transactions, tickets (fetched on login)
- `voiceStore`: connection status, transcript, audio state

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
    ├── VoiceOrb (animated)
    ├── StatusLabel
    └── TranscriptPanel
```

---

## 9. Voice Agent (Realtime API)

### Architecture

The voice agent uses OpenAI's Realtime API via a WebSocket proxy in FastAPI. This keeps the API key server-side and allows LangGraph tools to be injected into the voice session.

### Flow

1. User opens `/voice` page
2. React opens WebSocket to FastAPI: `ws://localhost:8000/api/voice/ws`
3. FastAPI opens WebSocket to OpenAI Realtime API
4. FastAPI sends session config:
   - model: `gpt-4o-realtime-preview`
   - language: `tr` (Turkish)
   - voice: `alloy`
   - tools: [all 6 LangGraph tools as function definitions]
   - instructions: Turkish banking assistant system prompt
5. React streams microphone audio → FastAPI → OpenAI
6. OpenAI streams audio response → FastAPI → React (speaker)
7. When OpenAI calls a `function_call`:
   - FastAPI intercepts
   - Calls LangGraph tool with `customer_id`
   - Returns result back to OpenAI session
8. Transcript streamed to React for display

### Turkish System Prompt for Voice

```
Sen Nexus Bank'in yapay zeka destekli müşteri hizmetleri asistanısın.
Konuştuğun müşteri: {customer_name}.
Her zaman kibarca, profesyonelce ve kısaca cevap ver.
Müşterinin hesap bilgilerine ve bilgi tabanına erişimin var.
Hassas bilgileri yalnızca gerektiğinde paylaş.
```

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

- **Chunk size:** 300 tokens (larger than RAG project — richer context per chunk)
- **Overlap:** 50 tokens
- **Embedding model:** `text-embedding-3-small` (1536 dimensions)
- **Metadata stored per chunk:** category, doc_id, title, language
- **Collection:** `nexus_bank_kb` in Chroma

### Ingest Script

A `knowledge/seed_kb.py` script will load all documents from `knowledge/docs/` folder, chunk them, embed via OpenAI, and store in Chroma. Runs automatically on container startup if collection is empty.

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
- WebSocket connections authenticated via JWT query parameter

---

## 12. Session Management

### Strategy

- During conversation: LangGraph state holds full message history in memory
- `session_id` generated on first message (UUID)
- On session end (`/api/chat/end`): full conversation persisted to `conversations` + `messages` tables
- Voice sessions also persisted (transcript from Realtime API)
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
| 3 | LangGraph agent with all 6 tools | P0 |
| 4 | PostgreSQL with mock data (100 customers) | P0 |
| 5 | Chroma RAG with knowledge base | P0 |
| 6 | Account summary sidebar | P0 |
| 7 | Voice agent (Realtime API, Turkish) | P0 |
| 8 | Docker Compose setup | P0 |

### Post-MVP (Nice to Have)

- Conversation history page — view past sessions
- Email notification simulation for ticket creation
- Multi-language toggle (EN/TR) for chat mode
- Admin panel — view all conversations and tickets
- Rate limiting on API endpoints
- Structured logging (tool calls, latency, errors)
- Demo mode — auto-play demo conversation

---

## 14. Development Phases

### Phase 1 — Foundation (Day 1-2)

- Initialize repo, folder structure, git
- `docker-compose.yml` with backend + postgres containers
- FastAPI skeleton with health endpoint
- SQLAlchemy models (all 8 tables)
- Alembic migrations
- `seed.py` — generate 100 customers + mock data
- JWT auth endpoints (login, me)
- Verify: login returns token, `/api/auth/me` returns customer

### Phase 2 — Agent Core (Day 3-4)

- Chroma setup + knowledge base documents
- `seed_kb.py` — ingest all docs
- LangGraph agent: state, graph, all 6 tools
- `POST /api/chat` endpoint
- Test agent with Postman: all tools responding correctly
- Session management with `MemorySaver`
- `POST /api/chat/end` — persist to DB

### Phase 3 — React Frontend (Day 5-6)

- Vite + React + TailwindCSS setup
- frontend Dockerfile + add to docker-compose
- Login page — JWT stored in Zustand
- Dashboard layout (sidebar + chat panel)
- Account sidebar: balances, transactions, tickets
- Chat interface: send message, display response, tool badge
- Typing indicator, scroll behavior
- Routing: `/login`, `/dashboard`

### Phase 4 — Voice Agent (Day 7-8)

- WebSocket proxy in FastAPI (`/api/voice/ws`)
- OpenAI Realtime API session config (Turkish, tools)
- Tool call interception + LangGraph tool execution
- Voice page in React: mic button, sound wave animation
- Audio streaming: microphone → server → speaker
- Transcript display
- End-to-end voice test

### Phase 5 — Polish & Deploy (Day 9-10)

- Error handling throughout (agent, API, frontend)
- Loading states and edge cases in UI
- Environment variables cleanup (`.env.example`)
- `README.md` (Claude Code)
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
│   │   ├── tools.py
│   │   ├── prompts.py
│   │   └── state.py
│   ├── voice/
│   │   └── proxy.py
│   ├── database/
│   │   ├── connection.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── seed.py
│   ├── knowledge/
│   │   ├── chroma_client.py
│   │   ├── ingest.py
│   │   └── docs/
│   │       ├── faq/
│   │       ├── products/
│   │       ├── procedures/
│   │       └── security/
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
│       │   └── voiceStore.js
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
│       │   └── TypingIndicator.jsx
│       └── api/
│           └── client.js
└── docs/
    ├── PRD.pdf
    └── architecture.png
```

---

## 16. Error Handling & Edge Cases

| Scenario | Handling |
|---|---|
| Tool returns empty result | Agent responds: "I could not find that information" |
| PostgreSQL query error | Return 500, agent says "temporary issue" |
| OpenAI API timeout | Retry once, then return error message to user |
| JWT expired | Return 401, frontend redirects to login |
| Voice WebSocket drops | Frontend shows reconnect button |
| Chroma returns no results | Agent falls back to general response |
| Invalid `customer_id` in JWT | Return 403 Forbidden |
| Agent max iterations reached | Return partial response with explanation |

---

## 17. Future Enhancements

### Short Term
- Conversation history page with search
- Email simulation for ticket notifications
- Rate limiting (slowapi)
- Structured logging with tool call analytics

### Medium Term
- OpenAI Realtime API upgrade (when stable) — smoother voice
- Multi-language support (EN/TR toggle)
- Admin dashboard for conversation monitoring
- Fine-tuned model on banking domain

### Long Term
- Real bank API integration (Open Banking)
- Biometric voice authentication
- Proactive notifications ("Your bill is due tomorrow")
- Mobile app (React Native)

---

*Nexus Bank AI Assistant — PRD v1.0 — Confidential & For Portfolio Use Only*
