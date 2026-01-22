import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AssetStatus } from '../types';
import { CURRICULUM } from '../constants';
import BrandLogo from './BrandLogo';
import PromptLibrary from './PromptLibrary';
import AgentBuilder from './AgentBuilder';

interface HomeViewProps {
    onNavigateToPath: () => void;
    onNavigateToVault: () => void;
    onNavigateToLabs: () => void;
}

type ViewMode = 'dashboard' | 'prompt-library' | 'agent-builder';

const HomeView: React.FC<HomeViewProps> = ({ onNavigateToPath, onNavigateToVault, onNavigateToLabs }) => {
    const { state } = useApp();
    const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

    const progressValues = Object.values(state.progress);
    const completedCount = progressValues.filter(a => a.status === AssetStatus.COMPLETED).length;
    const progressPercent = (completedCount / 8) * 100;
    const currentWeekData = CURRICULUM[state.currentWeek - 1];

    if (viewMode === 'prompt-library') {
        return <PromptLibrary onClose={() => setViewMode('dashboard')} />;
    }

    if (viewMode === 'agent-builder') {
        return <AgentBuilder onClose={() => setViewMode('dashboard')} />;
    }

    return (
        <div className="min-h-full bg-white text-slate-900 animate-in fade-in duration-700 font-sans">

            {/* Internal Header */}
            <header className="flex justify-between items-center mb-16">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Ready</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <button onClick={() => setViewMode('prompt-library')} className="px-4 py-2 hover:bg-slate-50 rounded-full transition-colors">Prompt Library</button>
                    <button onClick={() => setViewMode('agent-builder')} className="px-4 py-2 hover:bg-slate-50 rounded-full transition-colors">Agent Foundry</button>
                </div>
            </header>

            <div className="max-w-5xl mx-auto">

                {/* Hero Section - Centered & Clean */}
                <div className="text-center mb-24 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/50 to-indigo-100/50 rounded-full blur-[100px] -z-10 opacity-60"></div>

                    <span className="inline-block px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">
                        Focus Flow v2.0
                    </span>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-tight">
                        Build Your<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Digital Legacy.</span>
                    </h1>

                    <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
                        Orchestrate your entire digital ecosystem. Synthesize ideas, automate output, and store your genius.
                    </p>

                    <button
                        onClick={onNavigateToPath}
                        className="group relative inline-flex items-center justify-center px-12 py-6 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-xsoverflow-hidden transition-all hover:bg-indigo-600 hover:scale-105 shadow-2xl hover:shadow-indigo-500/30"
                    >
                        <span className="mr-3">Continue Week {state.currentWeek}</span>
                        <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                    </button>
                </div>

                {/* Quick Access Cards - "Bento" Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Prompt Library */}
                    <div
                        onClick={() => setViewMode('prompt-library')}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-300 cursor-pointer transition-all duration-300 group hover:-translate-y-1"
                    >
                        <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-terminal text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Prompt Library</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Access curated intelligence triggers.</p>
                    </div>

                    {/* Agent Builder */}
                    <div
                        onClick={() => setViewMode('agent-builder')}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 cursor-pointer transition-all duration-300 group hover:-translate-y-1"
                    >
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-robot text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Agent Foundry</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Build autonomous neural workers.</p>
                    </div>

                    {/* Labs */}
                    <div
                        onClick={onNavigateToLabs}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 cursor-pointer transition-all duration-300 group hover:-translate-y-1"
                    >
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-flask text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Simulation Labs</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Experimental AI environments.</p>
                    </div>

                    {/* Vault */}
                    <div
                        onClick={onNavigateToVault}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-300 cursor-pointer transition-all duration-300 group hover:-translate-y-1"
                    >
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-vault text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Asset Vault</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Secure storage for your work.</p>
                    </div>

                </div>

                {/* Progress Strip */}
                <div className="mt-20 border-t border-slate-100 pt-10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Progress</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">{Math.round(progressPercent)}% Optimized</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HomeView;
