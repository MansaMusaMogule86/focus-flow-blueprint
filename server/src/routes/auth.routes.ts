import { Router } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

router.post('/register', asyncHandler(async (req: AuthRequest, res: any) => {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    res.status(201).json(result);
}));

router.post('/login', asyncHandler(async (req: AuthRequest, res: any) => {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json(result);
}));

router.get('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
    const user = await authService.getUser(req.user!.userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
}));

router.patch('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
    const updateSchema = z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
    });
    const input = updateSchema.parse(req.body);
    await authService.updateUser(req.user!.userId, input);
    const user = await authService.getUser(req.user!.userId);
    res.json(user);
}));

export const authRoutes = router;
