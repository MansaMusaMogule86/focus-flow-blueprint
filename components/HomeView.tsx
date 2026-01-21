import React from 'react';
import { useApp } from '../context/AppContext';
import { AssetStatus } from '../types';
import { CURRICULUM } from '../constants';
import BrandLogo from './BrandLogo';

interface HomeViewProps {
    onNavigateToPath: () => void;
    onNavigateToVault: () => void;
    onNavigateToLabs: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigateToPath, onNavigateToVault, onNavigateToLabs }) => {
    const { state } = useApp();

    const progressValues = Object.values(state.progress);
    const completedCount = progressValues.filter(a => a.status === AssetStatus.COMPLETED).length;
    const progressPercent = (completedCount / 8) * 100;
    const currentWeekData = CURRICULUM[state.currentWeek - 1];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="bg-slate-950 rounded-[3rem] p-10 lg:p-16 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full -mr-32 -mt-32 blur-[150px]"></div>
                <div className="relative z-10">
                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-4 py-1.5 bg-white/5 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-white/10 backdrop-blur-md">
                            AI Operating System
                        </span>
                        <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-500/20">
                            {completedCount}/8 Steps Complete
                        </span>
                    </div>

                    <div className="flex items-center space-x-6 mb-6">
                        <BrandLogo size="lg" />
                        <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none">
                            Welcome<br />Back
                        </h1>
                    </div>

                    <p className="text-slate-400 max-w-xl font-medium leading-relaxed">
                        Your transformation dashboard. Track your progress, access your tools, and continue building your legacy.
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-10 max-w-lg">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-indigo-400">
                            <span>Overall Progress</span>
                            <span>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                            <div
                                className="h-full bg-gradient-to-r from-[#1E1B4B] to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Continue Path */}
                <div
                    onClick={onNavigateToPath}
                    className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-indigo-400 cursor-pointer transition-all duration-300 hover:-translate-y-2"
                >
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-route text-2xl"></i>
                        </div>
                        <i className="fa-solid fa-arrow-right text-slate-300 group-hover:text-indigo-600 transition-colors"></i>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-2">The Elevation Path</h3>
                    <p className="text-sm text-slate-500 mb-4">Continue your 8-week transformation journey</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                            Week {state.currentWeek}: {currentWeekData?.title}
                        </span>
                    </div>
                </div>

                {/* Vault */}
                <div
                    onClick={onNavigateToVault}
                    className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-amber-400 cursor-pointer transition-all duration-300 hover:-translate-y-2"
                >
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-vault text-2xl"></i>
                        </div>
                        <i className="fa-solid fa-arrow-right text-slate-300 group-hover:text-amber-600 transition-colors"></i>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-2">Your Vault</h3>
                    <p className="text-sm text-slate-500 mb-4">Access all your saved AI creations</p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                        {completedCount} Items Stored
                    </span>
                </div>

                {/* Labs */}
                <div
                    onClick={onNavigateToLabs}
                    className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-emerald-400 cursor-pointer transition-all duration-300 hover:-translate-y-2"
                >
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-flask text-2xl"></i>
                        </div>
                        <i className="fa-solid fa-arrow-right text-slate-300 group-hover:text-emerald-600 transition-colors"></i>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-2">AI Labs</h3>
                    <p className="text-sm text-slate-500 mb-4">Explore experimental AI tools</p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        10 Labs Available
                    </span>
                </div>
            </div>

            {/* Current Week Quick Access */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-[2.5rem] p-8 border border-indigo-100">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center font-black text-4xl text-indigo-600 shadow-lg border border-indigo-100">
                        {state.currentWeek}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Current Week</span>
                        <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900 mt-1">
                            {currentWeekData?.title}
                        </h3>
                        <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mt-2">
                            {currentWeekData?.build_asset}
                        </p>
                    </div>
                    <button
                        onClick={onNavigateToPath}
                        className="px-10 py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-lg"
                    >
                        <i className="fa-solid fa-play mr-2"></i>
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeView;
