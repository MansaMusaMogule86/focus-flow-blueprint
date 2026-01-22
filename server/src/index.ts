import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

import { config } from './config/index.js';
import { authRoutes } from './routes/auth.routes.js';
import { aiRouter } from './ai/router.js';
import { mediaRoutes } from './routes/media.routes.js';
import { pathRoutes } from './routes/path.routes.js';
import { vaultRoutes } from './routes/vault.routes.js';
import { cloneRoutes } from './routes/clone.routes.js';
import { assistantRoutes } from './routes/assistant.routes.js';
import { onboardingRoutes } from './routes/onboarding.routes.js';
import agentRoutes from './routes/agent.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { initWebSocketServer } from './services/websocket.service.js';

// Load all AI modules
import './modules/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);

// Initialize WebSocket server for Gemini Live
initWebSocketServer(httpServer);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use(cors({
    origin: config.isDev ? true : process.env.FRONTEND_URL,
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Compression
app.use(compression());

// Logging
if (config.isDev) {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        env: config.nodeEnv,
        modules: 12,
        features: ['text', 'image', 'video', 'audio', 'voice', 'path', 'vault', 'clone'],
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRouter);
app.use('/api/media', mediaRoutes);
app.use('/api/path', pathRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/clone', cloneRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/agents', agentRoutes);

// Serve static frontend in production
if (config.isProd) {
    const frontendPath = path.join(__dirname, '../../dist');
    app.use(express.static(frontendPath));
    app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
httpServer.listen(config.port, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🚀 AI OPERATING SYSTEM v2.0                                 ║
╠══════════════════════════════════════════════════════════════╣
║  Port:          ${config.port.toString().padEnd(44)}║
║  Environment:   ${config.nodeEnv.padEnd(44)}║
║  AI Modules:    12 (text, image, video, audio, voice)        ║
║  Systems:       Path, Vault, Clone                           ║
║  WebSocket:     /api/live (Gemini Live)                      ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const shutdown = () => {
    console.log('Shutting down...');
    httpServer.close(() => {
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { app, httpServer };
