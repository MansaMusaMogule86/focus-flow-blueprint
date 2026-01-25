import { v4 as uuidv4 } from 'uuid';
import prisma from '../db/prisma.js';

export interface VaultItem {
    id: string;
    userId: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'script' | 'report' | 'artifact';
    title: string;
    content: string;
    moduleId: string;
    moduleName: string;
    metadata: Record<string, any>;
    tags: string[];
    filePath?: string;
    createdAt: string;
    updatedAt: string;
}

export const vaultService = {
    // Save an item to vault
    async save(item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<VaultItem> {
        const newItem = await prisma.vaultItem.create({
            data: {
                userId: item.userId,
                type: item.type,
                title: item.title,
                content: item.content,
                moduleId: item.moduleId,
                moduleName: item.moduleName,
                metadata: JSON.stringify(item.metadata || {}),
                tags: JSON.stringify(item.tags || []),
                filePath: item.filePath,
            },
        });

        return this.mapPrismaToVaultItem(newItem);
    },

    // Get all vault items for a user
    async getAll(userId: string, options?: { type?: string; moduleId?: string; search?: string; limit?: number }): Promise<VaultItem[]> {
        const where: any = { userId };

        if (options?.type) {
            where.type = options.type;
        }

        if (options?.moduleId) {
            where.moduleId = options.moduleId;
        }

        if (options?.search) {
            const search = options.search.toLowerCase();
            where.OR = [
                { title: { contains: search } },
                { content: { contains: search } },
                // Tags search in stringified JSON is tricky in SQLite, skipping for simplicity or using contains
                { tags: { contains: search } }
            ];
        }

        const items = await prisma.vaultItem.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: options?.limit,
        });

        return items.map(this.mapPrismaToVaultItem);
    },

    // Get single item
    async getById(userId: string, itemId: string): Promise<VaultItem | null> {
        const item = await prisma.vaultItem.findFirst({
            where: { id: itemId, userId },
        });

        return item ? this.mapPrismaToVaultItem(item) : null;
    },

    // Update item
    async update(userId: string, itemId: string, updates: Partial<Pick<VaultItem, 'title' | 'content' | 'tags' | 'metadata'>>): Promise<VaultItem | null> {
        const existing = await prisma.vaultItem.findFirst({
            where: { id: itemId, userId },
        });

        if (!existing) return null;

        const updateData: any = {};
        if (updates.title) updateData.title = updates.title;
        if (updates.content) updateData.content = updates.content;
        if (updates.tags) updateData.tags = JSON.stringify(updates.tags);
        if (updates.metadata) updateData.metadata = JSON.stringify(updates.metadata);

        const updated = await prisma.vaultItem.update({
            where: { id: itemId },
            data: updateData,
        });

        return this.mapPrismaToVaultItem(updated);
    },

    // Delete item
    async delete(userId: string, itemId: string): Promise<boolean> {
        const existing = await prisma.vaultItem.findFirst({
            where: { id: itemId, userId },
        });

        if (!existing) return false;

        await prisma.vaultItem.delete({
            where: { id: itemId },
        });

        return true;
    },

    // Get vault stats for user
    async getStats(userId: string): Promise<{ total: number; byType: Record<string, number>; byModule: Record<string, number> }> {
        const items = await prisma.vaultItem.findMany({
            where: { userId },
        });

        const byType: Record<string, number> = {};
        const byModule: Record<string, number> = {};

        items.forEach(item => {
            byType[item.type] = (byType[item.type] || 0) + 1;
            byModule[item.moduleId] = (byModule[item.moduleId] || 0) + 1;
        });

        return { total: items.length, byType, byModule };
    },

    // Get all items as context string (for Clone)
    async getContextForClone(userId: string): Promise<string> {
        const items = await this.getAll(userId, { limit: 50 });

        if (items.length === 0) {
            return 'No vault items yet. The user has not saved any AI-generated content.';
        }

        const context = items.map(item =>
            `[${item.type.toUpperCase()}] ${item.title} (from ${item.moduleName})\n${item.content.slice(0, 500)}${item.content.length > 500 ? '...' : ''}`
        ).join('\n\n---\n\n');

        return `User's Vault contains ${items.length} items:\n\n${context}`;
    },

    // Helper to map Prisma result to VaultItem
    mapPrismaToVaultItem(item: any): VaultItem {
        return {
            id: item.id,
            userId: item.userId,
            type: item.type as any,
            title: item.title,
            content: item.content,
            moduleId: item.moduleId,
            moduleName: item.moduleName,
            metadata: JSON.parse(item.metadata),
            tags: JSON.parse(item.tags),
            filePath: item.filePath || undefined,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
        };
    },
};
