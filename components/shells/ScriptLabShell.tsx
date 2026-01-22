import React, { useState } from 'react';
import { LabConfig } from '../../labs/LabConfig';
import { executeLab, LabExecutionResult } from '../../services/labExecutor';

interface ScriptLabShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

const ScriptLabShell: React.FC<ScriptLabShellProps> = ({ config, onClose, onSaveToVault }) => {
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
            else setOutput(`Script Error: ${result.output}`);
        } catch (err: any) {
            setOutput(`Generation Failed: ${err?.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#1a1a1a] text-white font-sans animate-in slide-in-from-bottom-8 duration-500 flex flex-col">
            {/* Minimal Header */}
            <header className="h-16 flex items-center justify-between px-8 bg-[#111]">
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                    <i className="fa-solid fa-arrow-left text-xl"></i>
                </button>
                <div className="text-center">
                    <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400">Help Me Script</h1>
                </div>
                <div className="w-8"></div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Input Panel */}
                <div className="w-80 bg-[#111] border-r border-[#222] p-6 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Context & Goal</label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe the situation, tone, and outcome..."
                        className="flex-1 bg-[#222] rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none transition-all placeholder:text-slate-600"
                    />
                    <button
                        onClick={handleExecute}
                        disabled={isProcessing || !input}
                        className="mt-6 w-full py-4 bg-purple-600 text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-purple-500 transition-all"
                    >
                        {isProcessing ? 'Drafting...' : 'Generate Script'}
                    </button>
                </div>

                {/* Teleprompter Output */}
                <div className="flex-1 flex items-center justify-center p-12 lg:p-24 overflow-auto bg-[#1a1a1a] relative">
                    <div className="max-w-4xl w-full text-center">
                        {output ? (
                            <div className="space-y-12 animate-in fade-in duration-1000">
                                <span className="block w-12 h-1 bg-purple-600 mx-auto mb-12"></span>
                                <div className="text-3xl md:text-5xl font-medium leading-tight text-white/90">
                                    {output.split('\n').map((line, i) => (
                                        <p key={i} className="mb-8">{line}</p>
                                    ))}
                                </div>
                                <span className="block w-12 h-1 bg-purple-600 mx-auto mt-12"></span>
                            </div>
                        ) : (
                            <div className="text-center opacity-20">
                                <i className="fa-solid fa-microphone-lines text-8xl mb-6"></i>
                                <p className="text-xl font-light">Ready for input</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScriptLabShell;
