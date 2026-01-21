import { Router, Response } from 'express';
import { pathService, PATH_STEPS } from '../services/path.service.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// All path routes require auth
router.use(authMiddleware);

// GET /api/path - Get user's journey path with progress
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
    const steps = pathService.getPathForUser(req.user!.userId);
    const progress = pathService.getProgressSummary(req.user!.userId);

    res.json({
        steps,
        progress,
    });
}));

// GET /api/path/:stepId - Get single step details
router.get('/:stepId', asyncHandler(async (req: AuthRequest, res: Response) => {
    const step = PATH_STEPS.find(s => s.id === req.params.stepId);
    if (!step) {
        return res.status(404).json({ error: 'Step not found' });
    }

    const userPath = pathService.getPathForUser(req.user!.userId);
    const userStep = userPath.find(s => s.id === req.params.stepId);

    res.json(userStep || { ...step, status: 'locked' });
}));

// POST /api/path/:stepId/start - Start a step
router.post('/:stepId/start', asyncHandler(async (req: AuthRequest, res: Response) => {
    const success = pathService.startStep(req.user!.userId, req.params.stepId);

    if (!success) {
        return res.status(400).json({ error: 'Cannot start this step. It may be locked or already completed.' });
    }

    res.json({ success: true, message: 'Step started' });
}));

// POST /api/path/:stepId/complete - Complete a step
router.post('/:stepId/complete', asyncHandler(async (req: AuthRequest, res: Response) => {
    const { vaultItemId } = req.body;
    const result = pathService.completeStep(req.user!.userId, req.params.stepId, vaultItemId);

    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    res.json({
        success: true,
        message: 'Step completed',
        nextStep: result.nextStep,
    });
}));

// POST /api/path/complete - Alternative complete endpoint with stepId in body
router.post('/complete', asyncHandler(async (req: AuthRequest, res: Response) => {
    const { stepId, vaultItemId } = req.body;

    if (!stepId) {
        return res.status(400).json({ error: 'stepId is required' });
    }

    const result = pathService.completeStep(req.user!.userId, stepId, vaultItemId);

    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    res.json({
        success: true,
        message: 'Step completed',
        nextStep: result.nextStep,
    });
}));

export const pathRoutes = router;
