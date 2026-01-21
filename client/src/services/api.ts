import { useStore } from '../store';

const API_BASE = 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
    skipAuth?: boolean;
}

class ApiClient {
    private getHeaders(skipAuth: boolean = false): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (!skipAuth) {
            const token = useStore.getState().auth.token;
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
        const { skipAuth = false, ...fetchOptions } = options;

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...fetchOptions,
            headers: {
                ...this.getHeaders(skipAuth),
                ...fetchOptions.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));

            if (response.status === 401) {
                useStore.getState().clearAuth();
            }

            throw new Error(error.error || 'Request failed');
        }

        return response.json();
    }

    // Auth endpoints
    auth = {
        register: (data: { email: string; password: string; name: string }) =>
            this.request<{ token: string; user: any }>('/auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
                skipAuth: true,
            }),

        login: (data: { email: string; password: string }) =>
            this.request<{ token: string; user: any }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify(data),
                skipAuth: true,
            }),

        me: () => this.request<any>('/auth/me'),
    };

    // AI endpoints
    ai = {
        getModules: () =>
            this.request<any[]>('/ai/modules'),

        getModule: (moduleId: string) =>
            this.request<any>(`/ai/modules/${moduleId}`),

        execute: (moduleId: string, data: { content: string; options?: any }) =>
            this.request<any>(`/ai/execute/${moduleId}`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        getHistory: (moduleId?: string, limit?: number) => {
            const params = new URLSearchParams();
            if (moduleId) params.set('moduleId', moduleId);
            if (limit) params.set('limit', limit.toString());
            return this.request<any[]>(`/ai/history?${params}`);
        },

        getExecution: (executionId: string) =>
            this.request<any>(`/ai/execution/${executionId}`),

        getMemory: (moduleId: string) =>
            this.request<any>(`/ai/memory/${moduleId}`),

        clearMemory: (moduleId: string) =>
            this.request<{ success: boolean }>(`/ai/memory/${moduleId}`, {
                method: 'DELETE',
            }),
    };

    // Media endpoints
    media = {
        getGallery: (type?: 'image' | 'video' | 'audio') => {
            const params = type ? `?type=${type}` : '';
            return this.request<any[]>(`/media/gallery${params}`);
        },

        getItem: (id: string) =>
            this.request<any>(`/media/gallery/${id}`),

        delete: (id: string) =>
            this.request<{ success: boolean }>(`/media/gallery/${id}`, {
                method: 'DELETE',
            }),
    };

    // Path endpoints
    path = {
        get: () =>
            this.request<{ steps: any[]; progress: any }>('/path'),

        getStep: (stepId: string) =>
            this.request<any>(`/path/${stepId}`),

        start: (stepId: string) =>
            this.request<{ success: boolean }>(`/path/${stepId}/start`, {
                method: 'POST',
            }),

        complete: (stepId: string) =>
            this.request<{ success: boolean; nextStep?: string }>(`/path/${stepId}/complete`, {
                method: 'POST',
            }),
    };

    // Vault endpoints
    vault = {
        getAll: (options?: { type?: string; search?: string; limit?: number }) => {
            const params = new URLSearchParams();
            if (options?.type) params.set('type', options.type);
            if (options?.search) params.set('search', options.search);
            if (options?.limit) params.set('limit', options.limit.toString());
            const query = params.toString();
            return this.request<{ items: any[]; stats: any }>(`/vault${query ? `?${query}` : ''}`);
        },

        get: (id: string) =>
            this.request<any>(`/vault/${id}`),

        save: (data: {
            type: string;
            title: string;
            content: string;
            moduleId: string;
            moduleName: string;
            metadata?: any;
            tags?: string[];
        }) =>
            this.request<any>('/vault', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id: string, data: { title?: string; content?: string; tags?: string[] }) =>
            this.request<any>(`/vault/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            }),

        delete: (id: string) =>
            this.request<{ success: boolean }>(`/vault/${id}`, {
                method: 'DELETE',
            }),

        getStats: () =>
            this.request<any>('/vault/stats'),
    };

    // Clone endpoints
    clone = {
        talk: (message: string) =>
            this.request<{
                message: string;
                confidence: number;
                sourcesUsed: number;
                metadata: any;
            }>('/clone/talk', {
                method: 'POST',
                body: JSON.stringify({ message }),
            }),

        getStatus: () =>
            this.request<{
                readiness: string;
                memoryCount: number;
                message: string;
                capabilities: string[];
            }>('/clone/status'),
    };

    // Assistant endpoints
    assistant = {
        chat: (message: string, history?: Array<{ role: string; content: string }>) =>
            this.request<{ message: string; timestamp: string }>('/assistant/chat', {
                method: 'POST',
                body: JSON.stringify({ message, history }),
            }),

        search: (query: string) =>
            this.request<{ results: any[]; query: string; count: number }>(`/assistant/search?q=${encodeURIComponent(query)}`),

        map: (topic?: string) =>
            this.request<{ nodes: any[]; title: string; summary: string }>('/assistant/map', {
                method: 'POST',
                body: JSON.stringify({ topic }),
            }),

        getStatus: () =>
            this.request<{
                ready: boolean;
                pathProgress: number;
                vaultCount: number;
                currentStep: string | null;
                capabilities: string[];
            }>('/assistant/status'),

        save: (messages: Array<{ role: string; content: string; timestamp: string }>) =>
            this.request<{ success: boolean; vaultItemId: string }>('/assistant/save', {
                method: 'POST',
                body: JSON.stringify({ messages }),
            }),
    };

    // Onboarding endpoints
    onboarding = {
        getStatus: () =>
            this.request<{ completed: boolean; currentStep: string; answers: any }>('/onboarding/status'),

        welcome: () =>
            this.request<{ success: boolean; nextStep: string }>('/onboarding/welcome', {
                method: 'POST',
            }),

        intent: (data: { goals: string[]; timeline?: string; experience?: string }) =>
            this.request<{ success: boolean; nextStep: string }>('/onboarding/intent', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        commit: (commitment: boolean) =>
            this.request<{ success: boolean; completed: boolean; redirectTo?: string }>('/onboarding/commit', {
                method: 'POST',
                body: JSON.stringify({ commitment }),
            }),

        skip: () =>
            this.request<{ success: boolean; completed: boolean }>('/onboarding/skip', {
                method: 'POST',
            }),
    };

    // Health check
    health = () =>
        this.request<{
            status: string;
            timestamp: string;
            version: string;
            modules: number;
            features: string[];
        }>('/health', {
            skipAuth: true,
        });
}

export const api = new ApiClient();
