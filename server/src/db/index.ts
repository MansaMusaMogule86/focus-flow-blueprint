import prisma from './prisma.js';

// Database schema types (mapped to Prisma)
export interface User {
    id: string;
    email: string;
    password_hash: string;
    name: string;
    role: string;
    created_at: string;
    updated_at: string;
}

export interface Execution {
    id: string;
    user_id: string;
    module_id: string;
    input: string;
    output?: string;
    status: string; // 'pending' | 'completed' | 'failed'
    error?: string;
    duration_ms?: number;
    created_at: string;
    completed_at?: string;
}

export interface Memory {
    id: string;
    user_id: string;
    module_id: string;
    context: string;
    created_at: string;
    updated_at: string;
}

export interface Agent {
    id: string;
    user_id: string;
    name: string;
    role: string;
    system_prompt: string;
    model: string;
    tools: string[]; // Handled as JSON parsing
    avatar: string | null;
    created_at: string;
    updated_at: string;
}

// Helper functions (Prisma implementation)
export const dbHelpers = {
    // Users
    async findUser(email: string): Promise<User | undefined> {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return undefined;
        return {
            ...user,
            password_hash: user.passwordHash,
            created_at: user.createdAt.toISOString(),
            updated_at: user.updatedAt.toISOString(),
        };
    },

    async findUserById(id: string): Promise<User | undefined> {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return undefined;
        return {
            ...user,
            password_hash: user.passwordHash,
            created_at: user.createdAt.toISOString(),
            updated_at: user.updatedAt.toISOString(),
        };
    },

    async createUser(user: User): Promise<void> {
        await prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                passwordHash: user.password_hash,
                name: user.name,
                role: user.role,
                createdAt: user.created_at, // Assuming input string is ISO8601
            },
        });
    },

    async updateUser(id: string, data: Partial<User>): Promise<void> {
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;
        if (data.password_hash) updateData.passwordHash = data.password_hash;

        await prisma.user.update({
            where: { id },
            data: updateData,
        });
    },

    // Executions
    async createExecution(execution: Execution): Promise<void> {
        await prisma.execution.create({
            data: {
                id: execution.id,
                userId: execution.user_id,
                moduleId: execution.module_id,
                input: execution.input,
                output: execution.output,
                status: execution.status,
                error: execution.error,
                durationMs: execution.duration_ms,
                createdAt: execution.created_at,
                completedAt: execution.completed_at,
            },
        });
    },

    async updateExecution(id: string, data: Partial<Execution>): Promise<void> {
        const updateData: any = {};
        if (data.output !== undefined) updateData.output = data.output;
        if (data.status) updateData.status = data.status;
        if (data.error) updateData.error = data.error;
        if (data.duration_ms) updateData.durationMs = data.duration_ms;
        if (data.completed_at) updateData.completedAt = data.completed_at;

        await prisma.execution.update({
            where: { id },
            data: updateData,
        });
    },

    async getExecutions(userId: string, moduleId?: string, limit = 20): Promise<Execution[]> {
        const executions = await prisma.execution.findMany({
            where: {
                userId,
                ...(moduleId ? { moduleId } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return executions.map(e => ({
            id: e.id,
            user_id: e.userId,
            module_id: e.moduleId,
            input: e.input,
            output: e.output || undefined,
            status: e.status,
            error: e.error || undefined,
            duration_ms: e.durationMs || undefined,
            created_at: e.createdAt.toISOString(),
            completed_at: e.completedAt?.toISOString(),
        }));
    },

    async getExecution(id: string): Promise<Execution | undefined> {
        const e = await prisma.execution.findUnique({ where: { id } });
        if (!e) return undefined;
        return {
            id: e.id,
            user_id: e.userId,
            module_id: e.moduleId,
            input: e.input,
            output: e.output || undefined,
            status: e.status,
            error: e.error || undefined,
            duration_ms: e.durationMs || undefined,
            created_at: e.createdAt.toISOString(),
            completed_at: e.completedAt?.toISOString(),
        };
    },

    // Memory
    async findMemory(userId: string, moduleId: string): Promise<Memory | undefined> {
        const m = await prisma.memory.findUnique({
            where: {
                userId_moduleId: {
                    userId,
                    moduleId,
                },
            },
        });
        if (!m) return undefined;
        return {
            id: m.id,
            user_id: m.userId,
            module_id: m.moduleId,
            context: m.context,
            created_at: m.createdAt.toISOString(),
            updated_at: m.updatedAt.toISOString(),
        };
    },

    async saveMemory(memory: Memory): Promise<void> {
        await prisma.memory.upsert({
            where: {
                userId_moduleId: {
                    userId: memory.user_id,
                    moduleId: memory.module_id,
                },
            },
            create: {
                id: memory.id,
                userId: memory.user_id,
                moduleId: memory.module_id,
                context: memory.context,
                createdAt: memory.created_at,
            },
            update: {
                context: memory.context,
                updatedAt: new Date(),
            },
        });
    },

    async deleteMemory(userId: string, moduleId: string): Promise<void> {
        try {
            await prisma.memory.delete({
                where: {
                    userId_moduleId: {
                        userId,
                        moduleId,
                    },
                },
            });
        } catch (e) {
            // Ignore if not found
        }
    },
};
