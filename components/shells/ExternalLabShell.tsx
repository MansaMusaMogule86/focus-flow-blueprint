/**
 * External Lab Shell
 * 
 * Prompt assistance + redirect to external tool.
 * Used by: MusicFX
 */

import React, { useState } from 'react';
import { LabConfig } from '../../labs/LabConfig';
import { executeLab, LabExecutionResult } from '../../services/labExecutor';

interface ExternalLabShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

const ExternalLabShell: React.FC<ExternalLabShellProps> = ({ config, onClose, onSaveToVault }) => {
    const [input, setInput] = useState('');
    const [optimizedPrompt, setOptimizedPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleOptimize = async () => {
        if (!input.trim()) return;

        setIsProcessing(true);
        setError(null);

        try {
            const result: LabExecutionResult = await executeLab(config.id, input);

            if (result.success) {
                setOptimizedPrompt(result.output);
            } else {
                setError(result.output);
            }
        } catch (err: any) {
            setError(err?.message || 'Optimization failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopy = async () => {
        try {
            // Extract just the prompt from the formatted output
            const promptMatch = optimizedPrompt.match(/\*\*Optimized Prompt[^:]*:\*\*\n\n([\s\S]*?)\n\n---/);
            const textToCopy = promptMatch ? promptMatch[1] : optimizedPrompt;

            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = optimizedPrompt;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleOpenExternal = () => {
        if (config.externalUrl) {
            window.open(config.externalUrl, '_blank', 'noopener,noreferrer');
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
                <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30">
                    <i className={`fa-solid ${config.icon} text-orange-400 text-xl`}></i>
                </div>
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter m-0">{config.title}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                        Prompt Engineering Assistant
                    </p>
                </div>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Input Column */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            Describe what you want
                        </label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={config.placeholder}
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 shadow-inner resize-none font-medium text-orange-100 placeholder:text-white/30"
                        />
                    </div>

                    <button
                        onClick={handleOptimize}
                        disabled={isProcessing || !input.trim()}
                        className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-orange-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-3"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Optimizing...</span>
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                                <span>Optimize Prompt</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Output Column */}
                <div className="space-y-4">
                    <div className="bg-slate-950/50 rounded-3xl p-6 min-h-[150px] border border-white/5 font-mono text-xs leading-relaxed text-orange-200/80 whitespace-pre-wrap overflow-auto max-h-[300px]">
                        {error ? (
                            <div className="text-rose-400">
                                <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                                {error}
                            </div>
                        ) : optimizedPrompt ? (
                            optimizedPrompt
                        ) : (
                            <span className="text-white/20">
                // Describe your idea and we'll craft the perfect prompt for {config.title}
                            </span>
                        )}
                    </div>

                    {optimizedPrompt && !error && (
                        <div className="flex gap-3">
                            <button
                                onClick={handleCopy}
                                className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center space-x-2 ${copied
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                                <span>{copied ? 'Copied!' : 'Copy'}</span>
                            </button>
                            <button
                                onClick={handleOpenExternal}
                                className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-700 transition-all flex items-center justify-center space-x-2"
                            >
                                <i className="fa-solid fa-external-link"></i>
                                <span>Open {config.title}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Footer */}
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-[9px] text-white/30">
                    {config.title} is an external Google AI Test Kitchen tool.
                    Copy your optimized prompt and paste it in the tool.
                </p>
            </div>
        </div>
    );
};

export default ExternalLabShell;
