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
        const result = await db.execute({
            sql: 'SELECT * FROM agents WHERE user_id = ? ORDER BY created_at DESC',
            args: [userId]
        });

        // Parse tools JSON
        const agents = result.rows.map(agent => ({
            ...agent,
            tools: JSON.parse(agent.tools as string || '[]')
        }));

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

        const result = await db.execute({
            sql: 'SELECT * FROM agents WHERE id = ? AND user_id = ?',
            args: [id, userId]
        });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        const agent = result.rows[0];
        agent.tools = JSON.parse(agent.tools as string || '[]');

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

        await db.execute({
            sql: `INSERT INTO agents (id, user_id, name, role, system_prompt, model, tools, avatar)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                id,
                userId,
                data.name,
                data.role,
                data.system_prompt,
                data.model || 'gemini-1.5-flash',
                JSON.stringify(data.tools || []),
                data.avatar || null
            ]
        });

        res.status(201).json({ id, ...data });
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

        const updates: string[] = [];
        const args: any[] = [];

        if (data.name) { updates.push('name = ?'); args.push(data.name); }
        if (data.role) { updates.push('role = ?'); args.push(data.role); }
        if (data.system_prompt) { updates.push('system_prompt = ?'); args.push(data.system_prompt); }
        if (data.model) { updates.push('model = ?'); args.push(data.model); }
        if (data.tools) { updates.push('tools = ?'); args.push(JSON.stringify(data.tools)); }
        if (data.avatar) { updates.push('avatar = ?'); args.push(data.avatar); }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        args.push(id, userId);

        if (updates.length === 1) { // Only updated_at
            return res.json({ message: 'No changes detected' });
        }

        await db.execute({
            sql: `UPDATE agents SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
            args
        });

        res.json({ success: true });
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

        await db.execute({
            sql: 'DELETE FROM agents WHERE id = ? AND user_id = ?',
            args: [id, userId]
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Delete agent error:', error);
        res.status(500).json({ error: 'Failed to delete agent' });
    }
});

export default router;
