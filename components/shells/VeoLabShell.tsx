import React, { useState } from 'react';
import { LabConfig } from '../../labs/LabConfig';
import { executeLab, LabExecutionResult } from '../../services/labExecutor';

interface VeoLabShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

const VeoLabShell: React.FC<VeoLabShellProps> = ({ config, onClose, onSaveToVault }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleExecute = async () => {
        if (!input.trim()) return;
        setIsProcessing(true);
        setOutput('');
        try {
            const result: LabExecutionResult = await executeLab(config.id, input);
            if (result.success) setOutput(result.output); // Video URL
            else setOutput(`Error: ${result.output}`);
        } catch (err: any) {
            setOutput(`Render Error: ${err?.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#120a16] text-pink-50 font-sans animate-in zoom-in-95 duration-500 flex flex-col">
            {/* Cinema Header */}
            <header className="h-20 flex items-center justify-between px-8 bg-[#1a0f1f] border-b border-pink-900/30">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} className="text-pink-500 hover:text-white transition-colors">
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Veo 3.1</h1>
                    </div>
                </div>
                <div className="px-3 py-1 rounded bg-pink-950/50 border border-pink-900/50 text-[10px] tracking-widest text-pink-400 uppercase">
                    1080p HQ
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
                {/* Main Monitor */}
                <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl border border-pink-900/20 shadow-[0_0_100px_rgba(236,72,153,0.1)] relative overflow-hidden flex items-center justify-center group">
                    {output ? (
                        <div className="w-full h-full relative">
                            {/* Placeholder for video player logic */}
                            <div className="absolute inset-0 flex items-center justify-center text-pink-500">
                                <i className="fa-solid fa-play-circle text-6xl opacity-50 hover:opacity-100 cursor-pointer transition-opacity"></i>
                                <p className="absolute bottom-8 text-xs uppercase tracking-widest">{output}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center opacity-25 group-hover:opacity-40 transition-opacity">
                            <i className="fa-solid fa-clapperboard text-6xl mb-4 text-pink-500"></i>
                            <p className="font-mono text-xs text-pink-400 uppercase tracking-[0.2em]">Sequence Empty</p>
                        </div>
                    )}

                    {/* Processing Overlay */}
                    {isProcessing && (
                        <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                            <div className="w-64 h-1 bg-pink-900 rounded-full overflow-hidden mb-4">
                                <div className="h-full bg-pink-500 animate-progress"></div>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-pink-500 animate-pulse">Rendering Frames...</span>
                        </div>
                    )}
                </div>

                {/* Director Controls */}
                <div className="w-full max-w-3xl flex gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter scene description..."
                        className="flex-1 bg-[#1a0f1f] border border-pink-900/30 rounded-xl px-6 h-14 text-pink-100 focus:outline-none focus:border-pink-500 transition-colors placeholder:text-pink-900/50"
                    />
                    <button
                        onClick={handleExecute}
                        disabled={isProcessing || !input}
                        className="px-8 h-14 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-pink-900/20"
                    >
                        Render
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VeoLabShell;
