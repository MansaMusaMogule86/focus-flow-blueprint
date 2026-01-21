import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const VAULT_DB_PATH = path.resolve(process.cwd(), 'data/vault.json');

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
    save(item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>): VaultItem {
        const db = this.getDb();
        const now = new Date().toISOString();

        const newItem: VaultItem = {
            ...item,
            id: uuidv4(),
            createdAt: now,
            updatedAt: now,
        };

        db.push(newItem);
        this.saveDb(db);

        return newItem;
    },

    // Get all vault items for a user
    getAll(userId: string, options?: { type?: string; moduleId?: string; search?: string; limit?: number }): VaultItem[] {
        const db = this.getDb();
        let items = db.filter(item => item.userId === userId);

        if (options?.type) {
            items = items.filter(item => item.type === options.type);
        }

        if (options?.moduleId) {
            items = items.filter(item => item.moduleId === options.moduleId);
        }

        if (options?.search) {
            const search = options.search.toLowerCase();
            items = items.filter(item =>
                item.title.toLowerCase().includes(search) ||
                item.content.toLowerCase().includes(search) ||
                item.tags.some(tag => tag.toLowerCase().includes(search))
            );
        }

        // Sort by newest first
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (options?.limit) {
            items = items.slice(0, options.limit);
        }

        return items;
    },

    // Get single item
    getById(userId: string, itemId: string): VaultItem | null {
        const db = this.getDb();
        const item = db.find(i => i.id === itemId && i.userId === userId);
        return item || null;
    },

    // Update item
    update(userId: string, itemId: string, updates: Partial<Pick<VaultItem, 'title' | 'content' | 'tags' | 'metadata'>>): VaultItem | null {
        const db = this.getDb();
        const index = db.findIndex(i => i.id === itemId && i.userId === userId);

        if (index === -1) return null;

        db[index] = {
            ...db[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        this.saveDb(db);
        return db[index];
    },

    // Delete item
    delete(userId: string, itemId: string): boolean {
        const db = this.getDb();
        const index = db.findIndex(i => i.id === itemId && i.userId === userId);

        if (index === -1) return false;

        // Also delete associated file if exists
        const item = db[index];
        if (item.filePath) {
            const filePath = path.resolve(process.cwd(), item.filePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        db.splice(index, 1);
        this.saveDb(db);
        return true;
    },

    // Get vault stats for user
    getStats(userId: string): { total: number; byType: Record<string, number>; byModule: Record<string, number> } {
        const items = this.getAll(userId);

        const byType: Record<string, number> = {};
        const byModule: Record<string, number> = {};

        items.forEach(item => {
            byType[item.type] = (byType[item.type] || 0) + 1;
            byModule[item.moduleId] = (byModule[item.moduleId] || 0) + 1;
        });

        return { total: items.length, byType, byModule };
    },

    // Get all items as context string (for Clone)
    getContextForClone(userId: string): string {
        const items = this.getAll(userId, { limit: 50 });

        if (items.length === 0) {
            return 'No vault items yet. The user has not saved any AI-generated content.';
        }

        const context = items.map(item =>
            `[${item.type.toUpperCase()}] ${item.title} (from ${item.moduleName})\n${item.content.slice(0, 500)}${item.content.length > 500 ? '...' : ''}`
        ).join('\n\n---\n\n');

        return `User's Vault contains ${items.length} items:\n\n${context}`;
    },

    // Database helpers
    getDb(): VaultItem[] {
        if (!fs.existsSync(VAULT_DB_PATH)) {
            const dir = path.dirname(VAULT_DB_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(VAULT_DB_PATH, '[]');
            return [];
        }
        return JSON.parse(fs.readFileSync(VAULT_DB_PATH, 'utf-8'));
    },

    saveDb(data: VaultItem[]): void {
        fs.writeFileSync(VAULT_DB_PATH, JSON.stringify(data, null, 2));
    },
};
