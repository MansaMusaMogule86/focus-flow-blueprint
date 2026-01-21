import { Router, Response } from 'express';
import { z } from 'zod';
import { registry } from './registry.js';
import { executor } from './executor.js';
import { memoryService } from './memory.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/error.js';

const router = Router();

// All AI routes require authentication
router.use(authMiddleware);

// List all available modules
router.get('/modules', (_req, res: Response) => {
    const modules = registry.getAll().map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        type: m.type,
        icon: m.icon,
        capabilities: m.capabilities,
    }));
    res.json(modules);
});

// Get specific module info
router.get('/modules/:moduleId', (req, res: Response) => {
    const module = registry.get(req.params.moduleId);
    if (!module) {
        throw new HttpError(404, 'Module not found');
    }
    res.json({
        id: module.id,
        name: module.name,
        description: module.description,
        type: module.type,
        icon: module.icon,
        capabilities: module.capabilities,
    });
});

// Execute a module
const executeSchema = z.object({
    content: z.string().min(1),
    options: z.record(z.any()).optional(),
});

router.post('/execute/:moduleId', asyncHandler(async (req: AuthRequest, res: Response) => {
    const { moduleId } = req.params;
    const { content, options } = executeSchema.parse(req.body);

    const result = await executor.execute(moduleId, {
        userId: req.user!.userId,
        content,
        options,
    });

    res.json(result);
}));

// Get execution history
router.get('/history', asyncHandler(async (req: AuthRequest, res: Response) => {
    const moduleId = req.query.moduleId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;

    const history = executor.getHistory(req.user!.userId, moduleId, limit);
    res.json(history);
}));

// Get specific execution
router.get('/execution/:executionId', asyncHandler(async (req: AuthRequest, res: Response) => {
    const execution = executor.getExecution(req.params.executionId);
    if (!execution || execution.user_id !== req.user!.userId) {
        throw new HttpError(404, 'Execution not found');
    }
    res.json(execution);
}));

// Get memory/context for a module
router.get('/memory/:moduleId', asyncHandler(async (req: AuthRequest, res: Response) => {
    const context = memoryService.getContext(req.user!.userId, req.params.moduleId);
    res.json(context);
}));

// Clear memory for a module
router.delete('/memory/:moduleId', asyncHandler(async (req: AuthRequest, res: Response) => {
    memoryService.clearContext(req.user!.userId, req.params.moduleId);
    res.json({ success: true });
}));

export const aiRouter = router;
