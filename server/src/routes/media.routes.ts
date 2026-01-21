import { Router, Request, Response } from 'express';
import path from 'path';
import { mediaService } from '../services/media.service.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();
const MEDIA_DIR = path.resolve(process.cwd(), 'data/media');

// Serve media files (public for now, can add auth later)
router.get('/images/:filename', (req: Request, res: Response) => {
    const filePath = mediaService.getFilePath('image', req.params.filename);
    if (filePath) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'Image not found' });
    }
});

router.get('/videos/:filename', (req: Request, res: Response) => {
    const filePath = mediaService.getFilePath('video', req.params.filename);
    if (filePath) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'Video not found' });
    }
});

router.get('/audio/:filename', (req: Request, res: Response) => {
    const filePath = mediaService.getFilePath('audio', req.params.filename);
    if (filePath) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'Audio not found' });
    }
});

// Protected routes for user's media gallery
router.get('/gallery', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
    const type = req.query.type as 'image' | 'video' | 'audio' | undefined;
    const media = mediaService.getMediaByUser(req.user!.userId, type);
    res.json(media);
}));

router.get('/gallery/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
    const media = mediaService.getMediaById(req.params.id);
    if (!media || media.userId !== req.user!.userId) {
        return res.status(404).json({ error: 'Media not found' });
    }
    res.json(media);
}));

router.delete('/gallery/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
    const media = mediaService.getMediaById(req.params.id);
    if (!media || media.userId !== req.user!.userId) {
        return res.status(404).json({ error: 'Media not found' });
    }

    const deleted = mediaService.deleteMedia(req.params.id);
    res.json({ success: deleted });
}));

export const mediaRoutes = router;
