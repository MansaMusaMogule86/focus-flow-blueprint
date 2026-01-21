import { JSONFilePreset } from 'lowdb/node';
import { Low } from 'lowdb';
import path from 'path';
import fs from 'fs';
import { config } from '../config/index.js';

// Database schema types
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
    status: string;
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

export interface DbSchema {
    users: User[];
    executions: Execution[];
    memory: Memory[];
}

const defaultData: DbSchema = {
    users: [],
    executions: [],
    memory: [],
};

// Ensure data directory exists
const dbDir = path.dirname(config.database.path);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database with explicit type annotation
const dbPath = config.database.path.replace('.db', '.json');
export const db: Low<DbSchema> = await JSONFilePreset<DbSchema>(dbPath, defaultData);

// Helper functions
export const dbHelpers = {
    // Users
    findUser(email: string): User | undefined {
        return db.data.users.find(u => u.email === email);
    },

    findUserById(id: string): User | undefined {
        return db.data.users.find(u => u.id === id);
    },

    createUser(user: User): void {
        db.data.users.push(user);
        db.write();
    },

    updateUser(id: string, data: Partial<User>): void {
        const idx = db.data.users.findIndex(u => u.id === id);
        if (idx !== -1) {
            db.data.users[idx] = { ...db.data.users[idx], ...data };
            db.write();
        }
    },

    // Executions
    createExecution(execution: Execution): void {
        db.data.executions.push(execution);
        db.write();
    },

    updateExecution(id: string, data: Partial<Execution>): void {
        const idx = db.data.executions.findIndex(e => e.id === id);
        if (idx !== -1) {
            db.data.executions[idx] = { ...db.data.executions[idx], ...data };
            db.write();
        }
    },

    getExecutions(userId: string, moduleId?: string, limit = 20): Execution[] {
        let executions = db.data.executions.filter(e => e.user_id === userId);
        if (moduleId) {
            executions = executions.filter(e => e.module_id === moduleId);
        }
        return executions.slice(-limit).reverse();
    },

    getExecution(id: string): Execution | undefined {
        return db.data.executions.find(e => e.id === id);
    },

    // Memory
    findMemory(userId: string, moduleId: string): Memory | undefined {
        return db.data.memory.find(m => m.user_id === userId && m.module_id === moduleId);
    },

    saveMemory(memory: Memory): void {
        const idx = db.data.memory.findIndex(m => m.user_id === memory.user_id && m.module_id === memory.module_id);
        if (idx !== -1) {
            db.data.memory[idx] = memory;
        } else {
            db.data.memory.push(memory);
        }
        db.write();
    },

    deleteMemory(userId: string, moduleId: string): void {
        db.data.memory = db.data.memory.filter(m => !(m.user_id === userId && m.module_id === moduleId));
        db.write();
    },
};
