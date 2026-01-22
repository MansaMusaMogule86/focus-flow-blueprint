import React, { useState } from 'react';
import { CURRICULUM } from '../constants';
import { AppSection, AssetStatus } from '../types';
import { useApp } from '../context/AppContext';

interface PathViewProps {
    onStartWeek: (week: number) => void;
}

// Individual step page content
const StepContent: React.FC<{ week: number; onBack: () => void; onComplete: () => void }> = ({ week, onBack, onComplete }) => {
    const [activeTab, setActiveTab] = useState<'input' | 'preview'>('input');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [processing, setProcessing] = useState(false);
    const [saved, setSaved] = useState(false);

    const weekData = CURRICULUM[week - 1];

    const handleSynthesize = async () => {
        if (!input.trim()) return;
        setProcessing(true);

        // Simulate AI processing
        setTimeout(() => {
            setOutput(`AI Synthesis for Week ${week}: ${weekData.title}\n\nBased on your input:\n"${input}"\n\nYour personalized output has been generated. This represents your progress on "${weekData.build_asset}".`);
            setActiveTab('preview');
            setProcessing(false);
        }, 1500);
    };

    const handleSave = () => {
        setSaved(true);
        // In real implementation, save to vault
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-slate-950 rounded-[3rem] p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
                <div className="relative z-10">
                    <button
                        onClick={onBack}
                        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Back to Path</span>
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center font-black text-3xl backdrop-blur-sm">
                            {week}
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter">{weekData.title}</h1>
                            <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest mt-1">{weekData.build_asset}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('input')}
                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'input'
                            ? 'bg-white text-indigo-600 shadow-lg'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <i className="fa-solid fa-brain mr-2"></i>
                    Neural Input
                </button>
                <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'preview'
                            ? 'bg-white text-indigo-600 shadow-lg'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <i className="fa-solid fa-eye mr-2"></i>
                    Visual Preview
                </button>
            </div>

            {/* Input Tab */}
            {activeTab === 'input' && (
                <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm animate-in fade-in duration-300">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 mb-2">
                        Your Input
                    </h3>
                    <p className="text-slate-500 text-sm mb-6">
                        {weekData.description || `Complete the exercises for ${weekData.title}`}
                    </p>

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Enter your thoughts and work for ${weekData.title}...`}
                        rows={8}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none text-base"
                    />

                    <button
                        onClick={handleSynthesize}
                        disabled={!input.trim() || processing}
                        className={`w-full mt-6 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg ${!input.trim() || processing
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-950 text-white hover:bg-indigo-600 active:scale-95'
                            }`}
                    >
                        {processing ? (
                            <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>Processing...</>
                        ) : (
                            <><i className="fa-solid fa-wand-magic-sparkles mr-2"></i>Synthesize</>
                        )}
                    </button>
                </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
                <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm animate-in fade-in duration-300">
                    {output ? (
                        <>
                            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 mb-6">
                                AI Synthesis
                            </h3>
                            <div className="bg-slate-50 rounded-2xl p-8 min-h-[200px] mb-6">
                                <pre className="whitespace-pre-wrap text-slate-700 font-sans text-base">
                                    {output}
                                </pre>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setActiveTab('input')}
                                    className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                                >
                                    <i className="fa-solid fa-pen mr-2"></i>Edit Input
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saved}
                                    className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${saved
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-950 text-white hover:bg-indigo-600'
                                        }`}
                                >
                                    {saved ? (
                                        <><i className="fa-solid fa-check mr-2"></i>Saved to Vault</>
                                    ) : (
                                        <><i className="fa-solid fa-vault mr-2"></i>Save to Vault</>
                                    )}
                                </button>
                            </div>

                            {saved && (
                                <button
                                    onClick={onComplete}
                                    className="w-full mt-6 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
                                >
                                    <i className="fa-solid fa-check-double mr-2"></i>Complete Step & Continue
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <i className="fa-solid fa-eye-slash text-4xl text-slate-300"></i>
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 mb-2">
                                No Preview Yet
                            </h3>
                            <p className="text-slate-400 mb-6">
                                Complete the Neural Input and synthesize to see your preview.
                            </p>
                            <button
                                onClick={() => setActiveTab('input')}
                                className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                            >
                                <i className="fa-solid fa-arrow-left mr-2"></i>Go to Input
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Path Overview - shows all 8 weeks
const PathView: React.FC<PathViewProps> = ({ onStartWeek }) => {
    const { state, updateAsset } = useApp();
    const [activeStep, setActiveStep] = useState<number | null>(null);

    const progressValues = Object.values(state.progress);
    const completedCount = progressValues.filter(a => a.status === AssetStatus.COMPLETED).length;
    const progressPercent = (completedCount / 8) * 100;

    const handleCompleteStep = () => {
        if (activeStep) {
            updateAsset(activeStep, {}, AssetStatus.COMPLETED);
            const nextWeek = activeStep + 1;
            if (nextWeek <= 8) {
                setActiveStep(nextWeek);
            } else {
                setActiveStep(null);
            }
        }
    };

    // Show step content if active
    if (activeStep) {
        return (
            <StepContent
                week={activeStep}
                onBack={() => setActiveStep(null)}
                onComplete={handleCompleteStep}
            />
        );
    }

    // Path Overview
    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 rounded-[3rem] p-10 lg:p-16 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                            <i className="fa-solid fa-route text-4xl"></i>
                        </div>
                        <div>
                            <h1 className="text-5xl font-black uppercase tracking-tighter">The Elevation Path</h1>
                            <p className="text-white/70 mt-2">8-week transformation journey. Complete each step to unlock the next.</p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="max-w-xl">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                            <span className="text-white/50">Your Progress</span>
                            <span>{completedCount} / 8 Complete</span>
                        </div>
                        <div className="h-4 bg-white/10 rounded-full overflow-hidden p-0.5">
                            <div
                                className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full transition-all duration-700"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        <p className="text-right text-[10px] font-bold uppercase tracking-widest text-white/50 mt-2">
                            {Math.round(progressPercent)}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Steps Grid */}
            <div className="space-y-4">
                {CURRICULUM.map((week, index) => {
                    const status = state.progress[week.week]?.status || AssetStatus.LOCKED;
                    const isLocked = status === AssetStatus.LOCKED;
                    const isCompleted = status === AssetStatus.COMPLETED;
                    const isActive = !isLocked && !isCompleted;
                    const prevCompleted = index === 0 || state.progress[week.week - 1]?.status === AssetStatus.COMPLETED;

                    // Unlock first week or if prev is completed
                    const canAccess = index === 0 || prevCompleted;
                    const effectivelyLocked = isLocked && !canAccess;

                    return (
                        <div
                            key={week.week}
                            onClick={() => !effectivelyLocked && setActiveStep(week.week)}
                            className={`group p-8 rounded-[2rem] border transition-all duration-300 flex gap-6 items-center ${effectivelyLocked
                                    ? 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-50'
                                    : 'bg-white border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow-xl cursor-pointer'
                                }`}
                        >
                            {/* Week Number */}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 transition-all ${isCompleted
                                    ? 'bg-emerald-500 text-white shadow-lg'
                                    : effectivelyLocked
                                        ? 'bg-slate-200 text-slate-400'
                                        : 'bg-slate-950 text-white shadow-lg group-hover:bg-indigo-600'
                                }`}>
                                {isCompleted ? <i className="fa-solid fa-check"></i> : week.week}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${isCompleted
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : isActive
                                                ? 'bg-indigo-100 text-indigo-600'
                                                : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        {isCompleted ? 'Complete' : isActive ? 'Ready' : 'Locked'}
                                    </span>
                                </div>
                                <h3 className={`text-xl font-black uppercase tracking-tight ${effectivelyLocked ? 'text-slate-400' : 'text-slate-900'}`}>
                                    {week.title}
                                </h3>
                                <p className={`text-sm mt-1 ${effectivelyLocked ? 'text-slate-300' : 'text-indigo-600'} font-bold uppercase tracking-widest`}>
                                    {week.build_asset}
                                </p>
                            </div>

                            {/* Arrow */}
                            {!effectivelyLocked && (
                                <div className="text-slate-300 group-hover:text-indigo-600 transition-colors">
                                    <i className="fa-solid fa-chevron-right text-xl"></i>
                                </div>
                            )}
                            {effectivelyLocked && (
                                <div className="text-slate-300">
                                    <i className="fa-solid fa-lock text-xl"></i>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PathView;
