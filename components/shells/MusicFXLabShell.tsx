import React, { useState } from 'react';
import { LabConfig } from '../../labs/LabConfig';
import { executeLab, LabExecutionResult } from '../../services/labExecutor';

interface MusicFXLabShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

const MusicFXLabShell: React.FC<MusicFXLabShellProps> = ({ config, onClose, onSaveToVault }) => {
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
            setOutput(`Composition Error: ${err?.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#1c1917] text-orange-50 font-mono animate-in slide-in-from-right-8 duration-500 flex flex-col">
            <header className="h-20 flex items-center justify-between px-8 bg-[#292524] border-b border-orange-900/30">
                <button onClick={onClose} className="w-8 h-8 rounded bg-orange-950 border border-orange-900 flex items-center justify-center text-orange-500 hover:text-orange-200">
                    <i className="fa-solid fa-power-off"></i>
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-xl font-bold uppercase tracking-[0.3em] text-orange-500">MusicFX</h1>
                    <div className="flex gap-1 mt-1">
                        <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse delay-75"></div>
                        <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse delay-150"></div>
                    </div>
                </div>
                <div className="w-8"></div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center p-12 gap-12">
                {/* Visualizer Mockup */}
                <div className="w-full max-w-2xl h-64 bg-[#0c0a09] rounded-xl border border-orange-900/20 relative overflow-hidden flex items-end justify-center gap-1 p-8 shadow-[inset_0_0_40px_rgba(0,0,0,1)]">
                    {/* Placeholder Bars */}
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 bg-orange-600/50 rounded-t-sm transition-all duration-300 ${output ? 'animate-music-bar' : 'h-2'}`}
                            style={{ height: output ? `${Math.random() * 100}%` : '4px', animationDelay: `${i * 0.05}s` }}
                        ></div>
                    ))}

                    {!output && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            <i className="fa-solid fa-wave-square text-6xl text-orange-500"></i>
                        </div>
                    )}
                </div>

                {/* Synth Controls */}
                <div className="w-full max-w-2xl bg-[#292524] p-2 rounded-2xl shadow-2xl border border-orange-900/20">
                    <div className="bg-[#1c1917] rounded-xl p-6 flex gap-4">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe mood, genre, tempo, instruments..."
                            className="flex-1 bg-transparent border-none focus:outline-none text-orange-100 placeholder:text-orange-900/50 resize-none h-24"
                        />
                        <button
                            onClick={handleExecute}
                            disabled={isProcessing || !input}
                            className="w-24 bg-orange-600 rounded-lg font-bold text-black uppercase tracking-widest hover:bg-orange-500 transition-all flex flex-col items-center justify-center gap-2 shadow-lg shadow-orange-900/20"
                        >
                            <i className="fa-solid fa-play"></i>
                            <span className="text-[10px]">Gen</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MusicFXLabShell;
