import { v4 as uuidv4 } from 'uuid';
import { dbHelpers, Memory } from '../db/index.js';

export interface ConversationMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

export interface MemoryContext {
    moduleId: string;
    userId: string;
    messages: ConversationMessage[];
    metadata: Record<string, any>;
}

const MAX_MESSAGES = 50;

export const memoryService = {
    async getContext(userId: string, moduleId: string): Promise<MemoryContext> {
        const row = await dbHelpers.findMemory(userId, moduleId);

        if (row) {
            return JSON.parse(row.context);
        }

        return {
            moduleId,
            userId,
            messages: [],
            metadata: {},
        };
    },

    async saveContext(context: MemoryContext): Promise<void> {
        // Trim to max messages
        if (context.messages.length > MAX_MESSAGES) {
            context.messages = context.messages.slice(-MAX_MESSAGES);
        }

        const now = new Date().toISOString();
        const memory: Memory = {
            id: uuidv4(),
            user_id: context.userId,
            module_id: context.moduleId,
            context: JSON.stringify(context),
            created_at: now,
            updated_at: now,
        };

        await dbHelpers.saveMemory(memory);
    },

    async addMessage(userId: string, moduleId: string, message: Omit<ConversationMessage, 'timestamp'>): Promise<void> {
        const context = await this.getContext(userId, moduleId);
        context.messages.push({
            ...message,
            timestamp: new Date().toISOString(),
        });
        await this.saveContext(context);
    },

    async clearContext(userId: string, moduleId: string): Promise<void> {
        await dbHelpers.deleteMemory(userId, moduleId);
    },

    async getRecentMessages(userId: string, moduleId: string, limit: number = 10): Promise<ConversationMessage[]> {
        const context = await this.getContext(userId, moduleId);
        return context.messages.slice(-limit);
    },

    async setMetadata(userId: string, moduleId: string, key: string, value: any): Promise<void> {
        const context = await this.getContext(userId, moduleId);
        context.metadata[key] = value;
        await this.saveContext(context);
    },
};
