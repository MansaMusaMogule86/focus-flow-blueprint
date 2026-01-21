/**
 * Video Lab Shell
 * 
 * Storyboard input → video generation with progress indicator.
 * Used by: Veo 3.1
 */

import React, { useState } from 'react';
import { LabConfig } from '../../labs/LabConfig';
import { executeLab, LabExecutionResult } from '../../services/labExecutor';

interface VideoLabShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

const VideoLabShell: React.FC<VideoLabShellProps> = ({ config, onClose, onSaveToVault }) => {
    const [input, setInput] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const handleExecute = async () => {
        if (!input.trim()) return;

        setIsProcessing(true);
        setError(null);
        setVideoUrl(null);
        setProgress(0);

        // Simulate progress (Veo takes 30-60 seconds)
        const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + 2, 95));
        }, 1000);

        try {
            const result: LabExecutionResult = await executeLab(config.id, input, { aspectRatio });

            clearInterval(progressInterval);
            setProgress(100);

            if (result.success && result.metadata?.videoUrl) {
                setVideoUrl(result.metadata.videoUrl);
            } else if (!result.success) {
                setError(result.output);
            }
        } catch (err: any) {
            clearInterval(progressInterval);
            setError(err?.message || 'Video generation failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = () => {
        if (videoUrl) {
            onSaveToVault(videoUrl);
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
                <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center border border-pink-500/30">
                    <i className="fa-solid fa-film text-pink-400 text-xl"></i>
                </div>
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter m-0">{config.title}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-pink-400">
                        Cinematic Story Engine
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
                        className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm focus:outline-none focus:ring-4 focus:ring-pink-500/20 shadow-inner resize-none font-medium text-pink-100 placeholder:text-white/30"
                    />

                    {/* Aspect Ratio Selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            Format
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setAspectRatio('16:9')}
                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${aspectRatio === '16:9'
                                        ? 'bg-pink-600 text-white'
                                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                                    }`}
                            >
                                <i className="fa-solid fa-rectangle-wide"></i>
                                <span>Landscape 16:9</span>
                            </button>
                            <button
                                onClick={() => setAspectRatio('9:16')}
                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${aspectRatio === '9:16'
                                        ? 'bg-pink-600 text-white'
                                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                                    }`}
                            >
                                <i className="fa-solid fa-mobile-screen"></i>
                                <span>Portrait 9:16</span>
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleExecute}
                        disabled={isProcessing || !input.trim()}
                        className="w-full py-4 bg-pink-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-pink-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-3"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Rendering... {progress}%</span>
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-play"></i>
                                <span>{config.actionLabel}</span>
                            </>
                        )}
                    </button>

                    {/* Progress Bar */}
                    {isProcessing && (
                        <div className="space-y-2">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-pink-600 to-pink-400 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-[9px] text-white/40 text-center">
                                Video generation typically takes 30-60 seconds
                            </p>
                        </div>
                    )}
                </div>

                {/* Output Column */}
                <div className="space-y-4">
                    <div className="bg-slate-950/50 rounded-3xl min-h-[250px] border border-white/5 flex items-center justify-center overflow-hidden">
                        {error ? (
                            <div className="text-rose-400 text-center p-8">
                                <i className="fa-solid fa-triangle-exclamation text-3xl mb-4"></i>
                                <p className="text-xs">{error}</p>
                            </div>
                        ) : videoUrl ? (
                            <video
                                src={videoUrl}
                                controls
                                className="w-full h-auto rounded-2xl"
                                autoPlay
                            />
                        ) : (
                            <div className="text-white/20 text-center p-8">
                                <i className="fa-solid fa-film text-4xl mb-4"></i>
                                <p className="text-[10px] font-black uppercase tracking-widest">
                                    Awaiting Cinematic Render
                                </p>
                            </div>
                        )}
                    </div>

                    {videoUrl && !error && (
                        <button
                            onClick={handleSave}
                            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all flex items-center justify-center space-x-3"
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

export default VideoLabShell;
