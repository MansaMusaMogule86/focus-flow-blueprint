import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
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

// GET /api/agents - List all agents for user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const agents = db.data.agents
            .filter(agent => agent.user_id === userId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        res.json(agents);
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

        const agent = db.data.agents.find(a => a.id === id && a.user_id === userId);

        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        res.json(agent);
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
        const id = uuidv4();
        const now = new Date().toISOString();

        const newAgent = {
            id,
            user_id: userId,
            name: data.name,
            role: data.role,
            system_prompt: data.system_prompt,
            model: data.model || 'gemini-1.5-flash',
            tools: data.tools || [],
            avatar: data.avatar || null,
            created_at: now,
            updated_at: now
        };

        db.data.agents.push(newAgent);
        await db.write();

        res.status(201).json(newAgent);
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

        const agentIndex = db.data.agents.findIndex(a => a.id === id && a.user_id === userId);

        if (agentIndex === -1) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        const now = new Date().toISOString();
        db.data.agents[agentIndex] = {
            ...db.data.agents[agentIndex],
            ...data,
            updated_at: now
        };

        await db.write();

        res.json(db.data.agents[agentIndex]);
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

        const agentIndex = db.data.agents.findIndex(a => a.id === id && a.user_id === userId);

        if (agentIndex === -1) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        db.data.agents.splice(agentIndex, 1);
        await db.write();

        res.json({ success: true });
    } catch (error) {
        console.error('Delete agent error:', error);
        res.status(500).json({ error: 'Failed to delete agent' });
    }
});

export default router;
