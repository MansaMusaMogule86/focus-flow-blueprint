import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

export interface ThemeState {
    mode: 'light' | 'dark';
}

export interface ModuleState {
    activeModule: string | null;
    isLoading: boolean;
    error: string | null;
}

export interface AppStore {
    // Auth
    auth: AuthState;
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;

    // Theme
    theme: ThemeState;
    toggleTheme: () => void;
    setTheme: (mode: 'light' | 'dark') => void;

    // Module
    module: ModuleState;
    setActiveModule: (moduleId: string | null) => void;
    setModuleLoading: (loading: boolean) => void;
    setModuleError: (error: string | null) => void;

    // UI State
    sidebarOpen: boolean;
    toggleSidebar: () => void;
}

export const useStore = create<AppStore>()(
    persist(
        (set) => ({
            // Auth
            auth: {
                user: null,
                token: null,
                isAuthenticated: false,
            },
            setAuth: (user, token) =>
                set({ auth: { user, token, isAuthenticated: true } }),
            clearAuth: () =>
                set({ auth: { user: null, token: null, isAuthenticated: false } }),

            // Theme
            theme: { mode: 'dark' },
            toggleTheme: () =>
                set((state) => ({
                    theme: { mode: state.theme.mode === 'dark' ? 'light' : 'dark' },
                })),
            setTheme: (mode) => set({ theme: { mode } }),

            // Module
            module: {
                activeModule: null,
                isLoading: false,
                error: null,
            },
            setActiveModule: (moduleId) =>
                set((state) => ({ module: { ...state.module, activeModule: moduleId } })),
            setModuleLoading: (loading) =>
                set((state) => ({ module: { ...state.module, isLoading: loading } })),
            setModuleError: (error) =>
                set((state) => ({ module: { ...state.module, error } })),

            // UI
            sidebarOpen: true,
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        }),
        {
            name: 'ai-platform-store',
            partialize: (state) => ({
                auth: state.auth,
                theme: state.theme,
            }),
        }
    )
);

// Selectors
export const useAuth = () => useStore((state) => state.auth);
export const useTheme = () => useStore((state) => state.theme);
export const useModule = () => useStore((state) => state.module);
