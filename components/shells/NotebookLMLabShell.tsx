import React, { useState } from 'react';
import { LabConfig } from '../../labs/LabConfig';
import { executeLab, LabExecutionResult } from '../../services/labExecutor';

interface NotebookLMLabShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

const NotebookLMLabShell: React.FC<NotebookLMLabShellProps> = ({ config, onClose, onSaveToVault }) => {
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
            else setOutput(`Note: ${result.output}`);
        } catch (err: any) {
            setOutput(`Synthesis Error: ${err?.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#F5F5F7] text-slate-800 font-sans animate-in fade-in duration-500 flex flex-col">
            {/* Research Header */}
            <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-book-open text-indigo-600"></i>
                        <span className="font-serif font-bold text-lg tracking-tight text-slate-900">NotebookLM</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-500">Research Core</span>
                    </div>
                </div>
                <button onClick={() => output && onSaveToVault(output)} className="text-slate-500 hover:text-indigo-600 transition-colors text-xs font-bold uppercase tracking-widest">
                    <i className="fa-solid fa-bookmark mr-2"></i> Save Notes
                </button>
            </header>

            <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full p-6 gap-6">
                {/* Sources / Input Column */}
                <div className="w-1/3 flex flex-col gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Source Material</h2>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste your research notes, transcripts, or data here..."
                            className="flex-1 bg-transparent border-none resize-none focus:outline-none text-sm leading-relaxed text-slate-600 placeholder:text-slate-300 font-medium"
                        />
                    </div>
                    <button
                        onClick={handleExecute}
                        disabled={isProcessing || !input}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isProcessing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-sparkles"></i>}
                        Synthesize Notes
                    </button>
                </div>

                {/* Synthesis / Output Column */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 lg:p-12 overflow-auto custom-scrollbar relative">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-50 to-transparent pointer-events-none rounded-tr-2xl"></div>

                    {output ? (
                        <div className="prose prose-slate prose-lg max-w-none">
                            <h1 className="font-serif text-3xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Synthesis Report</h1>
                            <div className="whitespace-pre-wrap text-slate-700 leading-8 font-serif">
                                {output}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <div className="w-24 h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center mb-6">
                                <i className="fa-solid fa-plus text-2xl"></i>
                            </div>
                            <p className="font-medium text-sm">Add source material to generate clarity.</p>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="absolute inset-0 bg-white/90 z-20 flex items-center justify-center flex-col gap-4">
                            <div className="flex gap-2">
                                <span className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                <span className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                <span className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            </div>
                            <span className="font-serif italic text-slate-500">Reading and connecting ideas...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotebookLMLabShell;
