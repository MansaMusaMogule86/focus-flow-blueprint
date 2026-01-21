/**
 * Live Lab Shell
 * 
 * Voice/live conversation interface with real-time audio streaming.
 * Used by: Gemini Live
 */

import React, { useState, useRef, useCallback } from 'react';
import { LabConfig } from '../../labs/LabConfig';
import { LiveSession } from '../../services/liveApiService';

interface LiveLabShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

interface TranscriptMessage {
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
}

const LiveLabShell: React.FC<LiveLabShellProps> = ({ config, onClose, onSaveToVault }) => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const sessionRef = useRef<LiveSession | null>(null);

    const handleTranscription = useCallback((text: string, role: 'user' | 'model') => {
        setTranscript(prev => [...prev, { role, text, timestamp: new Date() }]);
    }, []);

    const requestMicPermission = async (): Promise<boolean> => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setHasPermission(true);
            return true;
        } catch {
            setHasPermission(false);
            return false;
        }
    };

    const startSession = async () => {
        setError(null);

        if (hasPermission === null) {
            const granted = await requestMicPermission();
            if (!granted) return;
        } else if (hasPermission === false) {
            return;
        }

        setIsConnecting(true);

        try {
            sessionRef.current = new LiveSession(handleTranscription);
            await sessionRef.current.start();
            setIsSessionActive(true);
            setTranscript([]);
        } catch (err: any) {
            setError(err?.message || 'Failed to start live session');
            setIsSessionActive(false);
        } finally {
            setIsConnecting(false);
        }
    };

    const endSession = () => {
        if (sessionRef.current) {
            sessionRef.current.stop();
            sessionRef.current = null;
        }
        setIsSessionActive(false);
    };

    const handleSaveTranscript = () => {
        if (transcript.length === 0) return;

        const formattedTranscript = transcript
            .map(msg => `[${msg.role.toUpperCase()}]: ${msg.text}`)
            .join('\n\n');

        onSaveToVault(formattedTranscript);
    };

    const handleClose = () => {
        endSession();
        onClose();
    };

    return (
        <div className="bg-slate-900 rounded-[3rem] p-8 lg:p-12 text-white shadow-2xl animate-in slide-in-from-top-8 border border-white/10 relative overflow-hidden">
            {/* Close Button */}
            <div className="absolute top-0 right-0 p-8">
                <button
                    onClick={handleClose}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-rose-500 transition-colors"
                >
                    <i className="fa-solid fa-times"></i>
                </button>
            </div>

            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                    <i className="fa-solid fa-microphone-lines text-blue-400 text-xl"></i>
                </div>
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter m-0">{config.title}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                        Neural Voice Interface
                    </p>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm">
                    <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                    {error}
                </div>
            )}

            {/* Central Interface */}
            <div className="flex flex-col items-center justify-center py-12 space-y-8">
                {hasPermission === false ? (
                    <div className="text-center space-y-4">
                        <div className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
                            <i className="fa-solid fa-microphone-slash text-rose-400 text-4xl"></i>
                        </div>
                        <p className="text-rose-400 text-sm">Microphone access denied</p>
                        <p className="text-white/40 text-xs max-w-sm">
                            Please enable microphone permissions in your browser settings to use Gemini Live.
                        </p>
                    </div>
                ) : isConnecting ? (
                    <div className="text-center space-y-6">
                        <div className="w-32 h-32 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                            Connecting to Neural Interface...
                        </p>
                    </div>
                ) : isSessionActive ? (
                    <>
                        {/* Waveform Visualization */}
                        <div className="relative">
                            <div className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                                <div className="w-24 h-24 bg-blue-500/30 rounded-full flex items-center justify-center">
                                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                                        <i className="fa-solid fa-waveform text-white text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                            {/* Animated rings */}
                            <div className="absolute inset-0 w-32 h-32 border-2 border-blue-500/30 rounded-full animate-ping"></div>
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse">
                            Session Active — Speak Now
                        </p>

                        {/* Live Transcript */}
                        {transcript.length > 0 && (
                            <div className="w-full max-w-lg bg-slate-950/50 rounded-2xl p-4 max-h-48 overflow-y-auto border border-white/5">
                                {transcript.slice(-6).map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`text-xs mb-2 ${msg.role === 'user' ? 'text-indigo-300' : 'text-emerald-300'}`}
                                    >
                                        <span className="font-bold uppercase text-[9px] opacity-60">
                                            {msg.role === 'user' ? 'You' : 'Gemini'}:
                                        </span>{' '}
                                        {msg.text}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex space-x-4">
                            <button
                                onClick={endSession}
                                className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-700 transition-all flex items-center space-x-3"
                            >
                                <i className="fa-solid fa-stop"></i>
                                <span>End Session</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-32 h-32 bg-blue-500/10 rounded-full flex items-center justify-center border-2 border-dashed border-blue-500/30">
                            <i className="fa-solid fa-microphone text-blue-400 text-4xl"></i>
                        </div>

                        <div className="text-center space-y-2">
                            <p className="text-white/60 text-sm">
                                Start a real-time voice conversation with Gemini
                            </p>
                            <p className="text-white/30 text-xs">
                                Low-latency, high-fidelity neural voice interface
                            </p>
                        </div>

                        <button
                            onClick={startSession}
                            className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center space-x-3"
                        >
                            <i className="fa-solid fa-play"></i>
                            <span>Start Live Session</span>
                        </button>

                        {/* Show previous transcript if exists */}
                        {transcript.length > 0 && (
                            <button
                                onClick={handleSaveTranscript}
                                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-emerald-700 transition-all flex items-center space-x-2"
                            >
                                <i className="fa-solid fa-box-archive"></i>
                                <span>Save Transcript to Vault</span>
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Info Footer */}
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-[9px] text-white/30 max-w-md mx-auto">
                    Gemini Live uses your device microphone for real-time voice interaction.
                    For best results, use headphones in a quiet environment.
                </p>
            </div>
        </div>
    );
};

export default LiveLabShell;
