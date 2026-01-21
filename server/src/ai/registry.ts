export type ModuleType = 'text' | 'image' | 'video' | 'audio' | 'multimodal';

export interface ModuleDefinition {
    id: string;
    name: string;
    description: string;
    type: ModuleType;
    icon: string;
    templateId: string;
    capabilities: string[];
    config: Record<string, any>;
    execute: (input: ModuleInput) => Promise<ModuleOutput>;
}

export interface ModuleInput {
    userId: string;
    content: string;
    options?: Record<string, any>;
    context?: string;
    files?: { data: string; mimeType: string }[];
}

export interface ModuleOutput {
    success: boolean;
    content: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'json';
    data?: any;
    metadata?: Record<string, any>;
}

const modules: Map<string, ModuleDefinition> = new Map();

export const registry = {
    register(module: ModuleDefinition): void {
        modules.set(module.id, module);
        console.log(`✓ Registered module: ${module.id}`);
    },

    get(moduleId: string): ModuleDefinition | undefined {
        return modules.get(moduleId);
    },

    getAll(): ModuleDefinition[] {
        return Array.from(modules.values());
    },

    has(moduleId: string): boolean {
        return modules.has(moduleId);
    },

    unregister(moduleId: string): boolean {
        return modules.delete(moduleId);
    },

    getByType(type: ModuleType): ModuleDefinition[] {
        return Array.from(modules.values()).filter(m => m.type === type);
    },

    listIds(): string[] {
        return Array.from(modules.keys());
    },
};
