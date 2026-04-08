# 🎬 Live Streaming Platform — MVP

A production-grade live streaming platform built with **NestJS + TypeScript** (backend) and **React JSX** (frontend).

## 🏗️ Architecture

```
Backend:  NestJS + TypeScript + Prisma ORM + PostgreSQL + Socket.io
Frontend: React + Vite + HLS.js + Socket.io-client
Streaming: Nginx RTMP → HLS playback
```

### Design Patterns Implemented

| Pattern | File | Purpose |
|---------|------|---------|
| **Singleton** | `prisma.service.ts` | Single PrismaClient instance across all modules |
| **Factory** | `stream.factory.ts` | Encapsulate stream creation (standard/live/scheduled) |
| **Strategy** | `strategies/free-viewing.strategy.ts`, `paid-viewing.strategy.ts` | Free (5 min) vs Paid (unlimited) viewing |
| **Observer** | `stream.observer.ts` | Broadcast stream lifecycle events (started/ended) |
| **Adapter** | `streaming.adapter.ts` | Wrap RTMP/HLS behind unified interface |
| **Template Method** | `base.service.ts` | Common CRUD flow with overridable hooks |
| **Composite** | `channel.composite.ts` | Channel → Streams → Comments hierarchy |

### Layered Architecture

```
Controllers → Services → Repositories → Database (Prisma)
     ↓            ↓           ↓
   DTOs     Design Patterns  BaseRepository
   Guards   Event Emitters
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (or NeonDB — already configured)
- (Optional) Nginx with RTMP module for actual streaming

### 1. Backend Setup

```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

Backend runs on `http://localhost:3001`
API prefix: `http://localhost:3001/api`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 3. (Optional) Nginx RTMP

```bash
# macOS
brew install nginx-full --with-rtmp-module

# Copy config
sudo cp server/nginx/nginx.conf /usr/local/etc/nginx/nginx.conf
sudo nginx
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user + create channel |
| POST | `/api/auth/login` | Login, get JWT |

### Channels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/channels/me` | Get your channel (auth) |
| GET | `/api/channels/:id` | Get public channel info |
| GET | `/api/channels/:id/hierarchy` | Full composite tree |

### Streams
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/streams` | Create stream (auth) |
| PATCH | `/api/streams/:id/start` | Go live (auth) |
| PATCH | `/api/streams/:id/stop` | End stream (auth) |
| GET | `/api/streams/live` | List live streams |
| GET | `/api/streams/:id` | Stream details |
| GET | `/api/streams/channel/:id` | Streams by channel |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subscriptions/subscribe` | Upgrade to PAID (auth) |
| GET | `/api/subscriptions/status` | Check plan (auth) |
| GET | `/api/subscriptions/viewing-access` | Get viewing rules (auth) |

### Streaming
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/streaming/urls` | Get RTMP/HLS URLs (auth) |
| POST | `/api/streaming/auth` | Nginx on_publish webhook |

### WebSocket (Chat)
| Event | Direction | Description |
|-------|-----------|-------------|
| `joinRoom` | Client → Server | Join stream chat room |
| `leaveRoom` | Client → Server | Leave chat room |
| `sendMessage` | Client → Server | Send chat message |
| `newMessage` | Server → Client | Receive chat message |
| `existingMessages` | Server → Client | History on join |
| `streamEnded` | Server → Client | Stream ended notification |

---

## 🔧 OBS Configuration

```
Server:     rtmp://localhost/live
Stream Key: <your-channel-stream-key>
```

Find your stream key on the Dashboard page after logging in.

---

## 📁 Project Structure

```
server/
├── prisma/schema.prisma              # Database schema
├── prisma.config.ts                  # Prisma v7 config
├── nginx/nginx.conf                  # RTMP server config
└── src/
    ├── main.ts                       # Bootstrap
    ├── app.module.ts                 # Root module
    ├── config/jwt.config.ts
    ├── common/
    │   ├── database/                 # PrismaService (Singleton)
    │   ├── base/                     # BaseService (Template Method) + BaseRepository
    │   ├── guards/                   # JWT + Subscription guards
    │   ├── decorators/               # @CurrentUser
    │   ├── interfaces/               # Shared types
    │   └── middleware/               # Logger
    └── modules/
        ├── auth/                     # Register/Login + JWT
        ├── user/                     # User CRUD
        ├── channel/                  # Channel + Composite pattern
        ├── stream/                   # Stream + Factory + Observer
        ├── subscription/             # Strategy pattern (Free vs Paid)
        ├── chat/                     # WebSocket gateway
        └── streaming/                # RTMP/HLS Adapter pattern

frontend/
└── src/
    ├── services/api.js               # Axios API client
    ├── components/
    │   ├── Navbar.jsx
    │   ├── VideoPlayer.jsx           # HLS.js player
    │   └── ChatBox.jsx               # Socket.io chat
    └── pages/
        ├── HomePage.jsx              # Live stream grid
        ├── LoginPage.jsx
        ├── RegisterPage.jsx
        ├── DashboardPage.jsx         # Channel + Go Live
        └── WatchPage.jsx             # Player + Chat
```

---

## 🔐 Security

- Passwords hashed with **bcrypt** (12 rounds)
- **JWT** authentication on protected routes
- Stream keys hidden from public API responses
- Input validation with **class-validator** DTOs
- CORS restricted to frontend origins
# tem_op
