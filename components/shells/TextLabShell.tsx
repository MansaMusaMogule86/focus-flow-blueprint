import React, { useState } from 'react';
import { LabConfig } from '../../labs/LabConfig';
import { executeLab, LabExecutionResult } from '../../services/labExecutor';

interface TextLabShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

const TextLabShell: React.FC<TextLabShellProps> = ({ config, onClose, onSaveToVault }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExecute = async () => {
        if (!input.trim()) return;

        setIsProcessing(true);
        setError(null);
        setOutput('');

        try {
            const result: LabExecutionResult = await executeLab(config.id, input);

            if (result.success) {
                setOutput(result.output);
            } else {
                setError(result.output);
            }
        } catch (err: any) {
            setError(err?.message || 'Execution failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = () => {
        if (output) {
            onSaveToVault(output);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white text-slate-900 font-sans flex flex-col md:flex-row animate-in fade-in duration-500">
            {/* Visual Sidebar */}
            <div className="md:w-1/3 bg-slate-50 p-12 relative overflow-hidden flex flex-col border-r border-slate-100">
                {/* Floating Gemini Elements */}
                <div className="absolute top-20 right-10 text-indigo-200 animate-slow-spin">
                    <i className="fa-solid fa-star-of-life text-9xl transform rotate-12"></i>
                </div>
                <div className="absolute bottom-10 left-10 text-purple-200 animate-float">
                    <i className="fa-solid fa-star text-6xl"></i>
                </div>

                <div className="relative z-10 flex-1 flex flex-col justify-between">
                    <div>
                        <button onClick={onClose} className="mb-12 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group">
                            <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                            <span className="text-xs font-bold uppercase tracking-widest">Exit Lab</span>
                        </button>

                        <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 mb-8`}>
                            <i className={`fa-solid ${config.icon} text-3xl gemini-text-gradient`}></i>
                        </div>

                        <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4">{config.title}</h1>
                        <p className="text-slate-500 text-lg leading-relaxed font-medium">
                            {config.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Interaction Area */}
            <div className="md:w-2/3 p-12 lg:p-16 overflow-y-auto bg-white relative">
                <div className="max-w-3xl mx-auto space-y-12">

                    {/* Input Section */}
                    <div className="space-y-6">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Input Parameters</label>
                        <div className="relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={config.placeholder}
                                className="w-full h-48 bg-transparent text-2xl font-medium text-slate-900 placeholder:text-slate-300 border-none outline-none resize-none"
                            />
                            {input.trim() === '' && (
                                <div className="absolute top-0 right-0 pointer-events-none">
                                    <i className="fa-solid fa-pen-fancy text-slate-200 text-4xl"></i>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleExecute}
                                disabled={isProcessing || !input.trim()}
                                className="group px-8 py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-gemini-gradient transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-xl"
                            >
                                {isProcessing ? 'Synthesizing...' : config.actionLabel}
                                <i className={`fa-solid ${isProcessing ? 'fa-circle-notch fa-spin' : 'fa-sparkles'} ml-2`}></i>
                            </button>
                        </div>
                    </div>

                    {/* Output Section */}
                    {(output || isProcessing || error) && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="h-px bg-slate-100 w-full"></div>
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black uppercase tracking-widest text-indigo-500">
                                    {isProcessing ? 'Neural Processing' : 'System Output'}
                                </label>
                                {output && (
                                    <div className="flex gap-2">
                                        <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                                            <i className="fa-solid fa-copy"></i>
                                        </button>
                                        <button onClick={handleSave} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors">
                                            <i className="fa-solid fa-box-archive"></i>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50 rounded-[2.5rem] p-8 lg:p-10 border border-slate-100 min-h-[200px] relative">
                                {isProcessing ? (
                                    <div className="flex flex-col items-center justify-center h-full py-12 space-y-4">
                                        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-500"></i>
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">Generating Response...</p>
                                    </div>
                                ) : error ? (
                                    <div className="text-rose-500 font-medium flex items-center gap-3">
                                        <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
                                        {error}
                                    </div>
                                ) : (
                                    <div className="prose prose-slate prose-lg max-w-none">
                                        <p className="whitespace-pre-wrap text-slate-600 leading-relaxed font-medium">{output}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default TextLabShell;
