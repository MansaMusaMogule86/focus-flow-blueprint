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
    getContext(userId: string, moduleId: string): MemoryContext {
        const row = dbHelpers.findMemory(userId, moduleId);

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

    saveContext(context: MemoryContext): void {
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

        dbHelpers.saveMemory(memory);
    },

    addMessage(userId: string, moduleId: string, message: Omit<ConversationMessage, 'timestamp'>): void {
        const context = this.getContext(userId, moduleId);
        context.messages.push({
            ...message,
            timestamp: new Date().toISOString(),
        });
        this.saveContext(context);
    },

    clearContext(userId: string, moduleId: string): void {
        dbHelpers.deleteMemory(userId, moduleId);
    },

    getRecentMessages(userId: string, moduleId: string, limit: number = 10): ConversationMessage[] {
        const context = this.getContext(userId, moduleId);
        return context.messages.slice(-limit);
    },

    setMetadata(userId: string, moduleId: string, key: string, value: any): void {
        const context = this.getContext(userId, moduleId);
        context.metadata[key] = value;
        this.saveContext(context);
    },
};
