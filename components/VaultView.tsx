import React from 'react';
import { useApp } from '../context/AppContext';
import { AssetStatus, UserAsset } from '../types';
import { CURRICULUM } from '../constants';

const VaultView: React.FC = () => {
    const { state } = useApp();

    const completedAssets = Object.entries(state.progress)
        .filter(([_, value]) => value.status === AssetStatus.COMPLETED)
        .map(([week, value]) => ({ week: parseInt(week), ...value }));

    return (
        <div className="space-y-8 animate-in fade-in duration-700 min-h-[calc(100vh-120px)] pb-24 md:pb-0">

            {/* Header - Mobile Optimized */}
            <div className="bg-[#0f172a] rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-xl shadow-amber-900/40">
                        <i className="fa-solid fa-shield-halved text-2xl md:text-4xl"></i>
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
                            Asset <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">Vault</span>
                        </h1>
                        <p className="text-amber-500 font-bold uppercase tracking-widest text-xs md:text-sm mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                            Secure Storage: Active
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid - Mobile Responsive */}
            <div className="bg-[#0f172a]/50 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-slate-800 shadow-inner min-h-[50vh]">
                {completedAssets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {completedAssets.map((asset) => {
                            const weekData = CURRICULUM[asset.week - 1];
                            return (
                                <div
                                    key={asset.week}
                                    className="group relative bg-[#1e293b] rounded-2xl md:rounded-3xl p-6 border border-slate-700 hover:border-amber-500/50 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-900/20 cursor-pointer overflow-hidden"
                                >
                                    {/* Hover Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-transparent transition-all duration-500"></div>

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700 text-amber-500 font-black text-lg shadow-inner">
                                                {asset.week}
                                            </div>
                                            <div className="px-2 py-1 bg-emerald-950/50 border border-emerald-900/50 rounded-lg text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                                                <i className="fa-solid fa-lock"></i> Secured
                                            </div>
                                        </div>

                                        <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white mb-1 group-hover:text-amber-400 transition-colors">
                                            {weekData?.title || `Module ${asset.week}`}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-6">
                                            {weekData?.build_asset || 'Unknown Asset'}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            <span>Encrypted</span>
                                            <i className="fa-solid fa-chevron-right group-hover:translate-x-1 group-hover:text-amber-500 transition-all"></i>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <div className="w-20 h-20 md:w-32 md:h-32 bg-slate-800 rounded-full flex items-center justify-center mb-6 relative">
                            <i className="fa-solid fa-vault text-4xl md:text-6xl text-slate-600"></i>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-rose-500 rounded-full flex items-center justify-center text-white border-4 border-[#0f172a]">
                                <i className="fa-solid fa-xmark"></i>
                            </div>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-300 mb-2">Vault Empty</h3>
                        <p className="text-slate-500 max-w-xs mx-auto text-sm md:text-base">Complete curriculum modules to unlock and secure your assets here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VaultView;
