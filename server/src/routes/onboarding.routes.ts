import { Router, Response } from 'express';
import { z } from 'zod';
import { onboardingService } from '../services/onboarding.service.js';
import { vaultService } from '../services/vault.service.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// All onboarding routes require auth
router.use(authMiddleware);

// GET /api/onboarding/status - Get current onboarding status
router.get('/status', asyncHandler(async (req: AuthRequest, res: Response) => {
    let status = onboardingService.getStatus(req.user!.userId);

    if (!status) {
        status = onboardingService.initOnboarding(req.user!.userId);
    }

    res.json({
        completed: status.completed,
        currentStep: status.step,
        answers: status.answers,
    });
}));

// POST /api/onboarding/welcome - Complete welcome step
router.post('/welcome', asyncHandler(async (req: AuthRequest, res: Response) => {
    const status = onboardingService.updateStep(req.user!.userId, 'intent');

    if (!status) {
        return res.status(400).json({ error: 'Onboarding not initialized' });
    }

    res.json({ success: true, nextStep: 'intent' });
}));

// POST /api/onboarding/intent - Save intent and move to commit
const intentSchema = z.object({
    goals: z.array(z.string()).min(1),
    timeline: z.string().optional(),
    experience: z.string().optional(),
});

router.post('/intent', asyncHandler(async (req: AuthRequest, res: Response) => {
    const answers = intentSchema.parse(req.body);

    const status = onboardingService.updateStep(req.user!.userId, 'commit', answers);

    if (!status) {
        return res.status(400).json({ error: 'Onboarding not initialized' });
    }

    // Save intent to Vault for Assistant awareness
    vaultService.save({
        userId: req.user!.userId,
        type: 'text',
        title: 'My Goals & Intent',
        content: `Goals: ${answers.goals.join(', ')}\nTimeline: ${answers.timeline || 'Not specified'}\nExperience: ${answers.experience || 'Not specified'}`,
        moduleId: 'onboarding',
        moduleName: 'Onboarding',
        tags: ['goals', 'intent', 'onboarding'],
        metadata: answers,
    });

    res.json({ success: true, nextStep: 'commit' });
}));

// POST /api/onboarding/commit - Complete onboarding
const commitSchema = z.object({
    commitment: z.boolean(),
});

router.post('/commit', asyncHandler(async (req: AuthRequest, res: Response) => {
    const { commitment } = commitSchema.parse(req.body);

    if (!commitment) {
        return res.status(400).json({ error: 'Commitment required to proceed' });
    }

    const status = onboardingService.updateStep(req.user!.userId, 'done', { commitment });

    if (!status) {
        return res.status(400).json({ error: 'Onboarding not initialized' });
    }

    res.json({ success: true, completed: true, redirectTo: '/path' });
}));

// POST /api/onboarding/skip - Skip onboarding (for development)
router.post('/skip', asyncHandler(async (req: AuthRequest, res: Response) => {
    onboardingService.updateStep(req.user!.userId, 'done', { commitment: true });
    res.json({ success: true, completed: true });
}));

export const onboardingRoutes = router;
