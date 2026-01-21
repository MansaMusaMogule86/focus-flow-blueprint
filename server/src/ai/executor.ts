import { v4 as uuidv4 } from 'uuid';
import { registry, ModuleInput, ModuleOutput } from './registry.js';
import { memoryService } from './memory.js';
import { dbHelpers, Execution } from '../db/index.js';
import { HttpError } from '../middleware/error.js';

export interface ExecutionResult {
    executionId: string;
    moduleId: string;
    output: ModuleOutput;
    durationMs: number;
}

const activeJobs: Map<string, { cancel: () => void }> = new Map();

export const executor = {
    async execute(moduleId: string, input: ModuleInput): Promise<ExecutionResult> {
        const module = registry.get(moduleId);
        if (!module) {
            throw new HttpError(404, `Module not found: ${moduleId}`);
        }

        const executionId = uuidv4();
        const startTime = Date.now();
        const now = new Date().toISOString();

        // Record execution start
        const execution: Execution = {
            id: executionId,
            user_id: input.userId,
            module_id: moduleId,
            input: JSON.stringify({ content: input.content, options: input.options }),
            status: 'running',
            created_at: now,
        };
        dbHelpers.createExecution(execution);

        // Add user message to memory
        memoryService.addMessage(input.userId, moduleId, {
            role: 'user',
            content: input.content,
        });

        // Get context for module
        const recentMessages = memoryService.getRecentMessages(input.userId, moduleId, 10);
        input.context = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n');

        try {
            const output = await module.execute(input);
            const durationMs = Date.now() - startTime;

            // Save assistant response to memory
            memoryService.addMessage(input.userId, moduleId, {
                role: 'assistant',
                content: output.content,
            });

            // Update execution record
            dbHelpers.updateExecution(executionId, {
                output: JSON.stringify(output),
                status: 'completed',
                duration_ms: durationMs,
                completed_at: new Date().toISOString(),
            });

            return { executionId, moduleId, output, durationMs };
        } catch (error: any) {
            const durationMs = Date.now() - startTime;

            dbHelpers.updateExecution(executionId, {
                status: 'failed',
                error: error.message,
                duration_ms: durationMs,
                completed_at: new Date().toISOString(),
            });

            throw error;
        }
    },

    getHistory(userId: string, moduleId?: string, limit: number = 20): Execution[] {
        return dbHelpers.getExecutions(userId, moduleId, limit);
    },

    getExecution(executionId: string): Execution | undefined {
        return dbHelpers.getExecution(executionId);
    },

    cancelExecution(executionId: string): boolean {
        const job = activeJobs.get(executionId);
        if (job) {
            job.cancel();
            activeJobs.delete(executionId);
            dbHelpers.updateExecution(executionId, { status: 'cancelled' });
            return true;
        }
        return false;
    },
};
