import { Router, Response } from 'express';
import { z } from 'zod';
import { assistantService } from '../services/assistant.service.js';
import { voiceService } from '../services/voice.service.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All assistant routes require auth
router.use(authMiddleware);

// POST /api/assistant/chat - Pro Chat with Coach Kay
const chatSchema = z.object({
    message: z.string().min(1),
    history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        timestamp: z.string().optional(),
    })).optional(),
});

router.post('/chat', asyncHandler(async (req: AuthRequest, res: Response) => {
    const { message, history } = chatSchema.parse(req.body);

    const formattedHistory = (history || []).map(h => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
        timestamp: new Date(h.timestamp || Date.now()),
    }));

    const response = await assistantService.chat(req.user!.userId, message, formattedHistory);

    res.json({
        message: response,
        timestamp: new Date().toISOString(),
    });
}));

// POST /api/assistant/chat/stream - Streaming chat with Coach Kay
router.post('/chat/stream', asyncHandler(async (req: AuthRequest, res: Response) => {
    const { message, history } = chatSchema.parse(req.body);

    const formattedHistory = (history || []).map(h => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
        timestamp: new Date(h.timestamp || Date.now()),
    }));

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
        for await (const chunk of assistantService.chatStream(req.user!.userId, message, formattedHistory)) {
            res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
        }
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    } catch (error: any) {
        res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    }

    res.end();
}));

// GET /api/assistant/search - Semantic search across Vault
router.get('/search', asyncHandler(async (req: AuthRequest, res: Response) => {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
        return res.json({ results: [], query: '' });
    }

    const results = await assistantService.search(req.user!.userId, query);

    res.json({
        results,
        query,
        count: results.length,
    });
}));

// POST /api/assistant/map - Generate concept map
const mapSchema = z.object({
    topic: z.string().optional(),
});

router.post('/map', asyncHandler(async (req: AuthRequest, res: Response) => {
    const { topic } = mapSchema.parse(req.body);

    const map = await assistantService.generateMap(req.user!.userId, topic);

    res.json(map);
}));

// POST /api/assistant/voice/input - Voice to text input
router.post('/voice/input', upload.single('audio'), asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
    }

    const transcription = await voiceService.transcribe(
        req.file.buffer,
        req.file.mimetype
    );

    // Process through assistant
    const response = await assistantService.chat(req.user!.userId, transcription, []);

    res.json({
        transcription,
        response,
        timestamp: new Date().toISOString(),
    });
}));

// POST /api/assistant/voice/output - Text to speech output
const ttsSchema = z.object({
    text: z.string().min(1),
});

router.post('/voice/output', asyncHandler(async (req: AuthRequest, res: Response) => {
    const { text } = ttsSchema.parse(req.body);

    const audioBuffer = await voiceService.synthesize(text);

    if (!audioBuffer) {
        return res.status(500).json({ error: 'TTS generation failed' });
    }

    // Return as base64 audio
    res.json({
        audio: `data:audio/mp3;base64,${audioBuffer.toString('base64')}`,
        text,
    });
}));

// POST /api/assistant/voice/full - Voice in, voice out
router.post('/voice/full', upload.single('audio'), asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
    }

    // Transcribe
    const transcription = await voiceService.transcribe(
        req.file.buffer,
        req.file.mimetype
    );

    // Get AI response
    const response = await assistantService.chat(req.user!.userId, transcription, []);

    // Synthesize response
    const audioBuffer = await voiceService.synthesize(response);

    res.json({
        transcription,
        response,
        audio: audioBuffer ? `data:audio/mp3;base64,${audioBuffer.toString('base64')}` : null,
        timestamp: new Date().toISOString(),
    });
}));

// GET /api/assistant/status - Get assistant status
router.get('/status', asyncHandler(async (req: AuthRequest, res: Response) => {
    const status = await assistantService.getStatus(req.user!.userId);
    res.json(status);
}));

// POST /api/assistant/save - Save conversation to Vault
const saveSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        timestamp: z.string(),
    })),
});

router.post('/save', asyncHandler(async (req: AuthRequest, res: Response) => {
    const { messages } = saveSchema.parse(req.body);

    const formattedMessages = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.timestamp),
    }));

    const vaultItemId = await assistantService.saveConversation(req.user!.userId, formattedMessages);

    res.json({
        success: true,
        vaultItemId,
    });
}));

export const assistantRoutes = router;
