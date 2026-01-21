import { Router, Response } from 'express';
import { z } from 'zod';
import { vaultService } from '../services/vault.service.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/error.js';

const router = Router();

// All vault routes require auth
router.use(authMiddleware);

// Get all vault items (with optional filters)
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
    const type = req.query.type as string | undefined;
    const moduleId = req.query.moduleId as string | undefined;
    const search = req.query.search as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const items = vaultService.getAll(req.user!.userId, { type, moduleId, search, limit });
    const stats = vaultService.getStats(req.user!.userId);

    res.json({
        items,
        stats,
    });
}));

// Get vault stats only
router.get('/stats', asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = vaultService.getStats(req.user!.userId);
    res.json(stats);
}));

// Get single vault item
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = vaultService.getById(req.user!.userId, req.params.id);

    if (!item) {
        throw new HttpError(404, 'Vault item not found');
    }

    res.json(item);
}));

// Save new vault item
const saveSchema = z.object({
    type: z.enum(['text', 'image', 'video', 'audio', 'script', 'report', 'artifact']),
    title: z.string().min(1),
    content: z.string(),
    moduleId: z.string(),
    moduleName: z.string(),
    metadata: z.record(z.any()).optional(),
    tags: z.array(z.string()).optional(),
    filePath: z.string().optional(),
});

router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
    const input = saveSchema.parse(req.body);

    const item = vaultService.save({
        ...input,
        userId: req.user!.userId,
        metadata: input.metadata || {},
        tags: input.tags || [],
    });

    res.status(201).json(item);
}));

// Update vault item
const updateSchema = z.object({
    title: z.string().min(1).optional(),
    content: z.string().optional(),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
});

router.patch('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
    const input = updateSchema.parse(req.body);

    const item = vaultService.update(req.user!.userId, req.params.id, input);

    if (!item) {
        throw new HttpError(404, 'Vault item not found');
    }

    res.json(item);
}));

// Delete vault item
router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
    const deleted = vaultService.delete(req.user!.userId, req.params.id);

    if (!deleted) {
        throw new HttpError(404, 'Vault item not found');
    }

    res.json({ success: true });
}));

export const vaultRoutes = router;
