import { Router, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { cloneService } from '../services/clone.service.js';
import { voiceService } from '../services/voice.service.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// All clone routes require auth
router.use(authMiddleware);

// Text-based talk (existing)
const talkSchema = z.object({
    message: z.string().min(1),
});

router.post('/talk', asyncHandler(async (req: AuthRequest, res: Response) => {
    const { message } = talkSchema.parse(req.body);
    const response = await cloneService.talk(req.user!.userId, message);
    res.json(response);
}));

// Voice input -> text response
router.post('/voice', upload.single('audio'), asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Audio file required' });
    }

    // Convert audio to text
    const transcription = await voiceService.transcribe(req.file.buffer, req.file.mimetype);

    // Use existing Clone logic
    const response = await cloneService.talk(req.user!.userId, transcription);

    res.json({
        transcription,
        response: response.message,
        confidence: response.confidence,
        sourcesUsed: response.sourcesUsed,
    });
}));

// Voice input -> audio response
router.post('/voice-to-voice', upload.single('audio'), asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Audio file required' });
    }

    // Convert audio to text
    const transcription = await voiceService.transcribe(req.file.buffer, req.file.mimetype);

    // Use existing Clone logic
    const response = await cloneService.talk(req.user!.userId, transcription);

    // Convert response to audio
    const audioBuffer = await voiceService.synthesize(response.message);

    if (audioBuffer) {
        res.json({
            transcription,
            response: response.message,
            audio: `data:audio/mp3;base64,${audioBuffer.toString('base64')}`,
            confidence: response.confidence,
        });
    } else {
        res.json({
            transcription,
            response: response.message,
            audio: null,
            confidence: response.confidence,
        });
    }
}));

// Streaming response (SSE)
router.post('/stream', asyncHandler(async (req: AuthRequest, res: Response) => {
    const { message } = talkSchema.parse(req.body);

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
        // Get streaming response from Clone
        const stream = await cloneService.talkStream(req.user!.userId, message);

        for await (const chunk of stream) {
            res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
        }

        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    } catch (error: any) {
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
    }

    res.end();
}));

// Get clone status
router.get('/status', asyncHandler(async (req: AuthRequest, res: Response) => {
    const { vaultService } = await import('../services/vault.service.js');
    const stats = vaultService.getStats(req.user!.userId);

    const readiness = stats.total === 0 ? 'empty' :
        stats.total < 5 ? 'learning' :
            stats.total < 20 ? 'developing' :
                'ready';

    res.json({
        readiness,
        memoryCount: stats.total,
        memoryTypes: stats.byType,
        capabilities: ['text', 'voice-input', 'voice-output', 'streaming'],
        message: readiness === 'empty'
            ? 'Your Clone has no memories yet. Save content to your Vault to train it.'
            : readiness === 'learning'
                ? 'Your Clone is learning. Add more content for better responses.'
                : readiness === 'developing'
                    ? 'Your Clone is developing its personality. Keep adding to your Vault.'
                    : 'Your Clone is ready with full voice and streaming support.',
    });
}));

export const cloneRoutes = router;
