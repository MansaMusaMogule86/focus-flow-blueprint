import React, { useState } from 'react';
import { Button, Input, Card } from '../components/ui';
import { api } from '../services/api';
import { useStore } from '../store';

export const AuthPage: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const setAuth = useStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = mode === 'login'
                ? await api.auth.login({ email, password })
                : await api.auth.register({ email, password, name });

            setAuth(result.user, result.token);
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

            <Card className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                        <i className="fa-solid fa-atom text-2xl text-white" />
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                        AI Platform
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {mode === 'login' ? 'Welcome back, commander' : 'Initialize your neural core'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <Input
                            label="Name"
                            icon="fa-user"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    )}

                    <Input
                        label="Email"
                        type="email"
                        icon="fa-envelope"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        icon="fa-lock"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-3 text-center">
                            <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                                {error}
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={loading}
                        className="w-full"
                    >
                        {mode === 'login' ? 'Access Platform' : 'Create Account'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        {mode === 'login'
                            ? "Don't have an account? Register"
                            : 'Already have an account? Login'}
                    </button>
                </div>
            </Card>
        </div>
    );
};
