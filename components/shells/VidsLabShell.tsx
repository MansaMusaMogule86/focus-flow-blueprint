import React, { useState } from 'react';
import { LabConfig } from '../../labs/LabConfig';
import { executeLab, LabExecutionResult } from '../../services/labExecutor';

interface VidsLabShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

const VidsLabShell: React.FC<VidsLabShellProps> = ({ config, onClose, onSaveToVault }) => {
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
            else setOutput(`Cut! Error: ${result.output}`);
        } catch (err: any) {
            setOutput(`Production Error: ${err?.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#000] text-rose-50 font-sans animate-in zoom-in-95 duration-500 flex flex-col">
            {/* Studio Header */}
            <header className="h-20 border-b border-rose-900/30 flex items-center justify-between px-8 bg-[#050505]">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center hover:bg-rose-500 text-rose-500 hover:text-white transition-all">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Vids Studio</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Narrative Engine</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-[#111] px-4 py-2 rounded-lg border border-rose-900/20 text-xs font-mono text-rose-300">
                        REC 00:00:00:00
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Narrative Input (Script) */}
                <div className="w-96 bg-[#080808] border-r border-[#1a1a1a] p-8 z-10 flex flex-col">
                    <label className="text-xs font-black text-rose-700 uppercase tracking-widest mb-4">Scene Description</label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe the visual narrative, shot types, and mood..."
                        className="flex-1 bg-[#111] border border-[#222] rounded-xl p-6 text-sm font-medium text-slate-300 focus:outline-none focus:border-rose-800 transition-all resize-none placeholder:text-rose-900/30 mb-6"
                    />
                    <button
                        onClick={handleExecute}
                        disabled={isProcessing || !input}
                        className="w-full py-5 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(225,29,72,0.4)] hover:shadow-[0_0_50px_rgba(225,29,72,0.6)] hover:bg-rose-500 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        {isProcessing ? 'Generating Storyboard...' : 'Action!'}
                    </button>
                </div>

                {/* Timeline / Storyboard Output */}
                <div className="flex-1 bg-[#050505] relative overflow-y-auto p-12">
                    <div className="max-w-5xl mx-auto">
                        {output ? (
                            <div className="space-y-12">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-px bg-rose-900/50 flex-1"></div>
                                    <span className="text-xs font-mono text-rose-700 uppercase">Sequence 01</span>
                                    <div className="h-px bg-rose-900/50 flex-1"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="aspect-video bg-[#111] border border-rose-900/20 rounded-2xl flex items-center justify-center p-8 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-rose-900/5 group-hover:bg-rose-900/10 transition-colors"></div>
                                        <div className="prose prose-invert prose-sm max-w-none relative z-10 text-rose-100/80">
                                            {output}
                                        </div>
                                    </div>
                                    {/* Simulated Shot List Mockup */}
                                    <div className="space-y-4">
                                        <div className="bg-[#111] p-4 rounded-xl border-l-2 border-rose-500">
                                            <span className="text-[10px] font-black text-rose-500 uppercase block mb-1">Shot 1 - Establish</span>
                                            <p className="text-xs text-stone-400">Wide shot. The environment is established matching the input parameters.</p>
                                        </div>
                                        <div className="bg-[#111] p-4 rounded-xl border-l-2 border-rose-500/50">
                                            <span className="text-[10px] font-black text-rose-500/50 uppercase block mb-1">Shot 2 - Detail</span>
                                            <p className="text-xs text-stone-500">Close up. Focus on key elements described in narrative.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-96 w-full border-2 border-dashed border-[#222] rounded-3xl flex flex-col items-center justify-center text-[#333]">
                                <i className="fa-solid fa-film text-6xl mb-4"></i>
                                <span className="font-bold uppercase tracking-widest text-xs">Timeline Empty</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VidsLabShell;
