import React, { useState } from 'react';
import { LabConfig } from '../../labs/LabConfig';
import { executeLab, LabExecutionResult } from '../../services/labExecutor';

interface WhiskLabShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

const WhiskLabShell: React.FC<WhiskLabShellProps> = ({ config, onClose, onSaveToVault }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [style, setStyle] = useState('Concept');

    const handleExecute = async () => {
        if (!input.trim()) return;
        setIsProcessing(true);
        setOutput('');
        try {
            const result: LabExecutionResult = await executeLab(config.id, input); // Backend should handle 'whisk' as image now
            if (result.success) setOutput(result.output);
            else setOutput(`Error: ${result.output}`);
        } catch (err: any) {
            setOutput(`Creation Error: ${err?.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#064e3b] text-emerald-50 font-sans animate-in fade-in duration-500 flex flex-col">
            {/* Studio Header */}
            <header className="h-16 flex items-center justify-between px-6 bg-[#022c22] border-b border-emerald-800/50">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="w-9 h-9 rounded-xl bg-emerald-900/50 text-emerald-400 hover:text-white hover:bg-emerald-800 transition-all flex items-center justify-center">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-palette text-emerald-400 text-xl"></i>
                        <span className="text-lg font-bold tracking-wide text-white">Whisk <span className="font-light text-emerald-400">Creation</span></span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-800/50 text-[10px] uppercase font-bold text-emerald-300 tracking-wider">
                        Flux State: Active
                    </span>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Controls Sidebar */}
                <div className="w-80 bg-[#065f46] border-r border-emerald-800/30 p-6 flex flex-col z-10 shadow-2xl">
                    <div className="flex-1 space-y-8">
                        <div>
                            <label className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-3 block">Visual Concept</label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="What do you want to create?"
                                className="w-full h-40 bg-[#022c22]/50 border border-emerald-700/50 rounded-2xl p-4 text-emerald-100 placeholder:text-emerald-700/50 focus:outline-none focus:border-emerald-400 focus:bg-[#022c22] transition-all resize-none text-sm font-medium"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-3 block">Aspect Ratio</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['1:1', '16:9', '9:16', '4:5'].map(ratio => (
                                    <button
                                        key={ratio}
                                        onClick={() => setAspectRatio(ratio)}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all ${aspectRatio === ratio ? 'bg-emerald-400 text-emerald-950 shadow-lg' : 'bg-emerald-900/50 text-emerald-400 hover:bg-emerald-800'}`}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-3 block">Art Style</label>
                            <div className="flex flex-wrap gap-2">
                                {['Concept', 'Realistic', 'Cyber', 'Oil', 'Sketch'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStyle(s)}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all ${style === s ? 'bg-white border-white text-emerald-900' : 'border-emerald-700/50 text-emerald-300 hover:border-emerald-400'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleExecute}
                        disabled={isProcessing || !input}
                        className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-400 text-emerald-950 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                    >
                        {isProcessing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                        Generate
                    </button>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 bg-[#022c22] relative flex items-center justify-center p-12 overflow-hidden">
                    {/* Artistic Background blobs */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    </div>

                    <div className="relative z-10 w-auto h-auto max-w-full max-h-full shadow-2xl rounded-sm border-8 border-white bg-white p-4 rotate-1 transition-transform hover:rotate-0 duration-500">
                        {isProcessing ? (
                            <div className="w-96 h-96 flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                                <p className="text-emerald-900 font-bold uppercase tracking-widest text-xs animate-pulse">Painting...</p>
                            </div>
                        ) : output ? (
                            <img src={output} alt="Whisk Creation" className="max-w-full max-h-[70vh] object-contain shadow-inner" />
                        ) : (
                            <div className="w-96 h-96 flex flex-col items-center justify-center text-emerald-900/30">
                                <i className="fa-solid fa-image text-6xl mb-4"></i>
                                <p className="font-bold uppercase tracking-widest text-xs">Canvas Empty</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhiskLabShell;
