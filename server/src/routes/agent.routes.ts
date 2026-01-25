import { Router } from 'express';
import { z } from 'zod';
import prisma from '../db/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Validation schemas
const createAgentSchema = z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    system_prompt: z.string().min(1),
    model: z.string().optional(),
    tools: z.array(z.string()).optional(),
    avatar: z.string().optional()
});

const updateAgentSchema = createAgentSchema.partial();

// Helper to parse JSON tools
const parseAgent = (agent: any) => ({
    ...agent,
    tools: agent.tools ? JSON.parse(agent.tools) : [],
    created_at: agent.createdAt.toISOString(),
    updated_at: agent.updatedAt.toISOString(),
});

// GET /api/agents - List all agents for user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const agents = await prisma.agent.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        res.json(agents.map(parseAgent));
    } catch (error) {
        console.error('List agents error:', error);
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
});

// GET /api/agents/:id - Get single agent
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const { id } = req.params;

        const agent = await prisma.agent.findFirst({
            where: { id, userId },
        });

        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        res.json(parseAgent(agent));
    } catch (error) {
        console.error('Get agent error:', error);
        res.status(500).json({ error: 'Failed to fetch agent' });
    }
});

// POST /api/agents - Create new agent
router.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const data = createAgentSchema.parse(req.body);

        const newAgent = await prisma.agent.create({
            data: {
                userId,
                name: data.name,
                role: data.role,
                systemPrompt: data.system_prompt,
                model: data.model || 'gemini-1.5-flash',
                tools: JSON.stringify(data.tools || []),
                avatar: data.avatar || null,
            },
        });

        res.status(201).json(parseAgent(newAgent));
    } catch (error) {
        console.error('Create agent error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Failed to create agent' });
    }
});

// PUT /api/agents/:id - Update agent
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const { id } = req.params;
        const data = updateAgentSchema.parse(req.body);

        const existing = await prisma.agent.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.role) updateData.role = data.role;
        if (data.system_prompt) updateData.systemPrompt = data.system_prompt;
        if (data.model) updateData.model = data.model;
        if (data.tools) updateData.tools = JSON.stringify(data.tools);
        if (data.avatar !== undefined) updateData.avatar = data.avatar;

        const updated = await prisma.agent.update({
            where: { id },
            data: updateData,
        });

        res.json(parseAgent(updated));
    } catch (error) {
        console.error('Update agent error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Failed to update agent' });
    }
});

// DELETE /api/agents/:id - Delete agent
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const { id } = req.params;

        const existing = await prisma.agent.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        await prisma.agent.delete({
            where: { id },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Delete agent error:', error);
        res.status(500).json({ error: 'Failed to delete agent' });
    }
});

export default router;
