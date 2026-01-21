import React, { useState, useEffect } from 'react';
import { Button, Card, LoadingSpinner } from '../components/ui';
import { api } from '../services/api';
import { useStore } from '../store';
import { ModulesGrid } from '../components/modules/ModulesGrid';
import { ModuleWorkspace } from '../components/modules/ModuleWorkspace';

type TabType = 'modules' | 'history';

export const DashboardPage: React.FC = () => {
    const { auth, clearAuth, theme, toggleTheme } = useStore();
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('modules');
    const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
    const [stats, setStats] = useState({ modules: 12, vault: 0, pathProgress: 0 });
    const [cloneStatus, setCloneStatus] = useState<any>(null);

    useEffect(() => {
        checkHealth();
        fetchStats();
    }, []);

    const checkHealth = async () => {
        try {
            const health = await api.health();
            setServerStatus('online');
            setStats((prev) => ({ ...prev, modules: health.modules || 12 }));
        } catch {
            setServerStatus('offline');
        }
    };

    const fetchStats = async () => {
        try {
            const [vaultData, cloneData] = await Promise.all([
                api.vault.getAll({ limit: 0 }),
                api.clone.getStatus(),
            ]);
            setStats((prev) => ({ ...prev, vault: vaultData.stats.total }));
            setCloneStatus(cloneData);
        } catch (e) {
            console.error('Failed to fetch stats:', e);
        }
    };

    const handleLogout = () => {
        clearAuth();
    };

    if (activeModule) {
        return <ModuleWorkspace moduleId={activeModule} onClose={() => setActiveModule(null)} />;
    }

    return (
        <div className={`min-h-screen ${theme.mode === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
            {/* Top Navigation */}
            <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <i className="fa-solid fa-atom text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                                    AI OS
                                </span>
                                <span className="ml-2 text-[9px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                                    v2.0
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-emerald-500' : serverStatus === 'offline' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`} />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    {serverStatus}
                                </span>
                            </div>

                            <button
                                onClick={toggleTheme}
                                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <i className={`fa-solid ${theme.mode === 'dark' ? 'fa-sun' : 'fa-moon'} text-slate-500`} />
                            </button>

                            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                    {auth.user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{auth.user?.name}</p>
                                    <p className="text-[10px] text-slate-400">{auth.user?.email}</p>
                                </div>
                                <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 transition-colors">
                                    <i className="fa-solid fa-right-from-bracket" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-3xl p-8 lg:p-12 text-white mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
                    <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                AI Operating System
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/30 text-emerald-300 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                {stats.modules} Modules Active
                            </span>
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter mb-4">
                            Welcome back, {auth.user?.name}
                        </h1>
                        <p className="text-slate-400 max-w-2xl">
                            Your full-stack AI platform. Generate content, build your Vault, train your Clone.
                        </p>
                    </div>
                </div>

                {/* Quick Access Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* Path Card */}
                    <a href="/path" className="group">
                        <Card className="p-6 h-full hover:shadow-lg transition-all border-l-4 border-emerald-500">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <i className="fa-solid fa-route text-2xl text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                                        Your Path
                                    </h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                                        8-Week Journey
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Master AI step by step
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </a>

                    {/* Vault Card */}
                    <a href="/vault" className="group">
                        <Card className="p-6 h-full hover:shadow-lg transition-all border-l-4 border-amber-500">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <i className="fa-solid fa-vault text-2xl text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                                        Your Vault
                                    </h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
                                        {stats.vault} Artifacts
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        All your AI creations
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </a>

                    {/* Clone Card */}
                    <a href="/clone" className="group">
                        <Card className="p-6 h-full hover:shadow-lg transition-all border-l-4 border-purple-500">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <i className="fa-solid fa-robot text-2xl text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                                        Your Clone
                                    </h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600">
                                        {cloneStatus?.readiness || 'loading...'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Your digital twin
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </a>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
                    {[
                        { id: 'modules', label: 'AI Modules', icon: 'fa-cubes' },
                        { id: 'history', label: 'Recent Activity', icon: 'fa-clock-rotate-left' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            <i className={`fa-solid ${tab.icon} mr-2`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'modules' && (
                    <ModulesGrid onSelectModule={setActiveModule} />
                )}

                {activeTab === 'history' && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <i className="fa-solid fa-clock-rotate-left text-3xl text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">
                            Recent Activity
                        </h3>
                        <p className="text-sm text-slate-500">
                            Your AI execution history will appear here.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};
