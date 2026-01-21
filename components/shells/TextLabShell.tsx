/**
 * Text Lab Shell
 * 
 * Standard prompt → text response interface.
 * Used by: Opal, Stitch, Whisk, NotebookLM, Project Mariner, Help Me Script, Vids Studio
 */

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
        <div className="bg-slate-900 rounded-[3rem] p-8 lg:p-12 text-white shadow-2xl animate-in slide-in-from-top-8 border border-white/10 relative overflow-hidden">
            {/* Close Button */}
            <div className="absolute top-0 right-0 p-8">
                <button
                    onClick={onClose}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-rose-500 transition-colors"
                >
                    <i className="fa-solid fa-times"></i>
                </button>
            </div>

            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
                <div className={`w-12 h-12 bg-${config.color}-500/20 rounded-2xl flex items-center justify-center border border-${config.color}-500/30`}>
                    <i className={`fa-solid ${config.icon} text-${config.color}-400 text-xl`}></i>
                </div>
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter m-0">{config.title}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                        {config.mode === 'text' ? 'Neural Reasoning Interface' : 'Experimental Interface'}
                    </p>
                </div>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Input Column */}
                <div className="space-y-4">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={config.placeholder}
                        className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 shadow-inner resize-none font-medium text-indigo-100 placeholder:text-white/30"
                    />
                    <button
                        onClick={handleExecute}
                        disabled={isProcessing || !input.trim()}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-3"
                    >
                        {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <i className="fa-solid fa-bolt-lightning"></i>
                        )}
                        <span>{isProcessing ? 'Processing...' : config.actionLabel}</span>
                    </button>
                </div>

                {/* Output Column */}
                <div className="space-y-4">
                    <div className="bg-slate-950/50 rounded-3xl p-8 min-h-[160px] border border-white/5 font-mono text-xs leading-relaxed text-indigo-200/80 whitespace-pre-wrap overflow-auto max-h-[400px]">
                        {error ? (
                            <div className="text-rose-400">
                                <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                                {error}
                            </div>
                        ) : output ? (
                            output
                        ) : (
                            <span className="text-white/20">// AWAITING NEURAL SEED</span>
                        )}
                    </div>

                    {output && !error && (
                        <button
                            onClick={handleSave}
                            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center space-x-3"
                        >
                            <i className="fa-solid fa-box-archive"></i>
                            <span>Save to Vault</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TextLabShell;
