import React, { useState } from 'react';
import { LabConfig } from '../../labs/LabConfig';
import { executeLab, LabExecutionResult } from '../../services/labExecutor';

interface StitchLabShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

const StitchLabShell: React.FC<StitchLabShellProps> = ({ config, onClose, onSaveToVault }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleExecute = async () => {
        if (!input.trim()) return;
        setIsProcessing(true);
        setOutput('');
        try {
            const result: LabExecutionResult = await executeLab(config.id, input);
            if (result.success) setOutput(result.output);
            else setOutput(`Error: ${result.output}`);
        } catch (err: any) {
            setOutput(`System Failure: ${err?.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#Fdfdfd] text-slate-900 font-sans animate-in zoom-in-95 duration-500 flex flex-col">
            {/* Design Studio Header */}
            <header className="h-20 border-b border-slate-200 flex items-center justify-between px-8 bg-white shadow-sm z-20">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                        <i className="fa-solid fa-arrow-left text-slate-500"></i>
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Stitch Studio</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Multimodal Layout Engine</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Design Mode Active</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Floating Tools Sidebar (Left) */}
                <div className="w-80 bg-white border-r border-slate-100 p-8 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col">
                    <div className="flex-1 space-y-8">
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Design Prompt</label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Describe the layout, aesthetic, and components..."
                                className="w-full h-64 bg-slate-50 border border-slate-200 rounded-3xl p-6 text-lg font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none placeholder:text-slate-300"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Style Presets</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 transition-all text-xs font-bold uppercase tracking-wider text-slate-500">Modern</button>
                                <button className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 transition-all text-xs font-bold uppercase tracking-wider text-slate-500">Cyber</button>
                                <button className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 transition-all text-xs font-bold uppercase tracking-wider text-slate-500">Minimal</button>
                                <button className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 transition-all text-xs font-bold uppercase tracking-wider text-slate-500">Bauhaus</button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleExecute}
                        disabled={isProcessing || !input}
                        className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {isProcessing ? <i className="fa-solid fa-arrows-rotate fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                        Generate Layout
                    </button>
                </div>

                {/* Canvas Area (Right) */}
                <div className="flex-1 bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-12">
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                    <div className="w-full h-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col">
                        <div className="h-12 border-b border-slate-100 flex items-center px-6 gap-2 bg-slate-50/50">
                            <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        </div>

                        <div className="flex-1 overflow-auto p-12 custom-scrollbar">
                            {output ? (
                                <div className="prose prose-lg max-w-none">
                                    <div className="p-8 border-2 border-indigo-100 border-dashed rounded-3xl bg-indigo-50/30 text-indigo-900 font-medium whitespace-pre-wrap">
                                        {output}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                    <i className="fa-solid fa-compass-drafting text-8xl mb-6"></i>
                                    <p className="font-black uppercase tracking-widest text-sm opacity-50">Canvas Empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StitchLabShell;
