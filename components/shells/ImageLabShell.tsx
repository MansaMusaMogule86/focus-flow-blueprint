/**
 * Image Lab Shell
 * 
 * Prompt + aspect ratio → generated image preview.
 * Used by: Nano Banana, Imagen 4
 */

import React, { useState } from 'react';
import { LabConfig } from '../../labs/LabConfig';
import { executeLab, LabExecutionResult } from '../../services/labExecutor';

interface ImageLabShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

const ImageLabShell: React.FC<ImageLabShellProps> = ({ config, onClose, onSaveToVault }) => {
    const [input, setInput] = useState('');
    const [aspectRatio, setAspectRatio] = useState(config.aspectRatios?.[0] || '1:1');
    const [output, setOutput] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExecute = async () => {
        if (!input.trim()) return;

        setIsProcessing(true);
        setError(null);
        setOutput(null);

        try {
            const result: LabExecutionResult = await executeLab(config.id, input, { aspectRatio });

            if (result.success && result.outputType === 'image') {
                setOutput(result.output);
            } else {
                setError(result.output);
            }
        } catch (err: any) {
            setError(err?.message || 'Image generation failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = () => {
        if (output) {
            onSaveToVault(output);
        }
    };

    const handleDownload = () => {
        if (output) {
            const link = document.createElement('a');
            link.href = output;
            link.download = `${config.title.toLowerCase().replace(' ', '-')}-${Date.now()}.png`;
            link.click();
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
                        Visual Synthesis Engine
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
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 shadow-inner resize-none font-medium text-indigo-100 placeholder:text-white/30"
                    />

                    {/* Aspect Ratio Selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            Aspect Ratio
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {config.aspectRatios?.map(ratio => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${aspectRatio === ratio
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white/5 text-white/50 hover:bg-white/10'
                                        }`}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleExecute}
                        disabled={isProcessing || !input.trim()}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-3"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Synthesizing...</span>
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                                <span>{config.actionLabel}</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Output Column */}
                <div className="space-y-4">
                    <div className="bg-slate-950/50 rounded-3xl p-4 min-h-[200px] border border-white/5 flex items-center justify-center overflow-hidden">
                        {error ? (
                            <div className="text-rose-400 text-center p-8">
                                <i className="fa-solid fa-triangle-exclamation text-3xl mb-4"></i>
                                <p className="text-xs">{error}</p>
                            </div>
                        ) : output ? (
                            <img
                                src={output}
                                alt="Generated"
                                className="w-full h-auto rounded-2xl shadow-xl"
                            />
                        ) : (
                            <div className="text-white/20 text-center">
                                <i className="fa-solid fa-image text-4xl mb-4"></i>
                                <p className="text-[10px] font-black uppercase tracking-widest">
                                    Awaiting Visual Synthesis
                                </p>
                            </div>
                        )}
                    </div>

                    {output && !error && (
                        <div className="flex gap-3">
                            <button
                                onClick={handleDownload}
                                className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all flex items-center justify-center space-x-2"
                            >
                                <i className="fa-solid fa-download"></i>
                                <span>Download</span>
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2"
                            >
                                <i className="fa-solid fa-box-archive"></i>
                                <span>Vault</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageLabShell;
