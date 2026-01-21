# AI Operating System v2.0

A production-ready, full-stack AI platform with modular AI tools covering text, image, video, audio, and real-time voice.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Vite + React + TS + Tailwind)  │
│   Dashboard │ Auth │ Module Grid │ Media Gallery │ Voice UI    │
├─────────────────────────────────────────────────────────────────┤
│                        Backend (Node.js + Express)              │
│        REST API │ WebSocket (Gemini Live) │ Media Server       │
├─────────────────────────────────────────────────────────────────┤
│                        AI Orchestration Layer                   │
│   Router → Registry → Executor → Memory → Templates → Provider │
├─────────────────────────────────────────────────────────────────┤
│                           12 AI Modules                         │
├────────┬────────┬────────┬─────────┬────────┬────────┬─────────┤
│  Opal  │ Stitch │ Whisk  │Notebook │Mariner │ Script │  Vids   │
│  Nano  │Imagen4 │ Veo3.1 │MusicFX  │ Gemini │        │         │
│        │        │        │         │  Live  │        │         │
├────────┴────────┴────────┴─────────┴────────┴────────┴─────────┤
│                        Data Layer (JSON DB)                     │
│              Users │ Executions │ Memory │ Media Index          │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### 1. Setup Server
```bash
cd server
cp .env.example .env
# Edit .env with your GOOGLE_AI_API_KEY
npm install
npm run dev
```

### 2. Setup Client
```bash
cd client
npm install
npm run dev
```

### 3. Access
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001/api
- **WebSocket**: ws://localhost:3001/api/live

## 🤖 AI Modules (12 Total)

### Text & Agents
| Module | Description |
|--------|-------------|
| **Opal** | Lightweight reasoning - fast single-shot inference |
| **Stitch** | Multimodal streaming agent with thinking |
| **Whisk** | Automation agent with task chaining |
| **NotebookLM** | Long context synthesis with persistent memory |
| **Mariner** | Research agent with web search grounding |
| **Help Me Script** | Script generator with tone control |

### Media Generation
| Module | Type | Description |
|--------|------|-------------|
| **Imagen 4** | Image | Prompt-to-image with gallery storage |
| **Veo 3.1** | Video | Cinematic video with storyboard logic |
| **MusicFX** | Audio | AI music generation with waveform preview |
| **Nano Banana** | Image | Ultra-fast visual synthesis |
| **Vids Studio** | Video | Video planning and asset orchestration |

### Real-time
| Module | Description |
|--------|-------------|
| **Gemini Live** | Real-time voice conversation via WebSocket |

## 📁 Project Structure

```
focus-flow-blueprint/
├── client/                     # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # Base UI components
│   │   │   ├── media/          # Media preview, voice session
│   │   │   └── modules/        # Module grid, workspace
│   │   ├── pages/              # Auth, Dashboard
│   │   ├── store/              # Zustand global state
│   │   └── services/           # API client
│   └── ...
│
├── server/                     # Backend (Express)
│   ├── src/
│   │   ├── ai/                 # AI orchestration
│   │   │   ├── provider.ts     # Google AI REST client
│   │   │   ├── registry.ts     # Module registry
│   │   │   ├── executor.ts     # Job execution
│   │   │   ├── memory.ts       # Context memory
│   │   │   ├── templates.ts    # Prompt templates
│   │   │   └── router.ts       # AI API routes
│   │   ├── modules/            # 12 AI modules
│   │   │   ├── opal/
│   │   │   ├── stitch/
│   │   │   ├── whisk/
│   │   │   ├── notebooklm/
│   │   │   ├── mariner/
│   │   │   ├── helpme-script/
│   │   │   ├── vids-studio/
│   │   │   ├── nano-banana/
│   │   │   ├── imagen4/
│   │   │   ├── veo31/
│   │   │   ├── musicfx/
│   │   │   └── gemini-live/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── media.service.ts
│   │   │   └── websocket.service.ts
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── db/
│   │   └── config/
│   └── data/                   # Database & media storage
│       ├── platform.json
│       └── media/
│           ├── images/
│           ├── videos/
│           └── audio/
│
└── docker-compose.yml
```

## 🔧 Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development
JWT_SECRET=your-32-character-secret-key-here
JWT_EXPIRES_IN=7d

# Database
DATABASE_PATH=./data/platform.json

# AI
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login
GET  /api/auth/me          # Get current user
```

### AI Operations
```
GET  /api/ai/modules           # List all modules
GET  /api/ai/modules/:id       # Get module info
POST /api/ai/execute/:id       # Execute module
GET  /api/ai/history           # Execution history
GET  /api/ai/memory/:id        # Get context
DELETE /api/ai/memory/:id      # Clear memory
```

### Media
```
GET    /api/media/images/:file   # Serve image
GET    /api/media/videos/:file   # Serve video
GET    /api/media/audio/:file    # Serve audio
GET    /api/media/gallery        # User's media gallery
DELETE /api/media/gallery/:id    # Delete media
```

### WebSocket (Gemini Live)
```
ws://localhost:3001/api/live?token=JWT_TOKEN
```

## 🔒 Security

- JWT authentication with bcrypt password hashing
- Rate limiting (100 req/min)
- Helmet security headers
- CORS protection
- Zod input validation

## 🐳 Docker Deployment

```bash
# Set environment
export JWT_SECRET="your-secret"
export GOOGLE_AI_API_KEY="your-key"

# Build and run
docker-compose up -d
```

## 📈 Scaling Plan

1. **Database**: Migrate to PostgreSQL
2. **Queue**: Add Redis + BullMQ for async jobs
3. **Caching**: Redis response caching
4. **Storage**: S3/GCS for media files
5. **Microservices**: Split into AI gateway + workers
6. **Monitoring**: Prometheus + Grafana

## 📝 License

MIT
