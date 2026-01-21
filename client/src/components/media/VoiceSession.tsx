import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui';
import { useStore } from '../../store';

interface VoiceSessionProps {
    onClose: () => void;
}

export const VoiceSession: React.FC<VoiceSessionProps> = ({ onClose }) => {
    const [status, setStatus] = useState<'connecting' | 'connected' | 'speaking' | 'listening' | 'disconnected'>('disconnected');
    const [transcripts, setTranscripts] = useState<{ role: string; text: string }[]>([]);
    const [selectedVoice, setSelectedVoice] = useState('Zephyr');
    const [error, setError] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const token = useStore((state) => state.auth.token);

    const voices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede', 'Leda', 'Orus', 'Zephyr'];

    const connect = useCallback(() => {
        if (!token) {
            setError('Authentication required');
            return;
        }

        setStatus('connecting');
        setError(null);

        const wsUrl = `ws://localhost:3001/api/live?token=${token}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setStatus('connected');
            ws.send(JSON.stringify({ type: 'config', voice: selectedVoice }));
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                switch (message.type) {
                    case 'connected':
                        setStatus('listening');
                        break;
                    case 'transcript':
                        setTranscripts((prev) => [...prev, { role: message.role, text: message.text }]);
                        break;
                    case 'error':
                        setError(message.message);
                        break;
                    case 'session_ended':
                        setStatus('disconnected');
                        break;
                }
            } catch (e) {
                console.error('WebSocket message error:', e);
            }
        };

        ws.onerror = () => {
            setError('Connection error');
            setStatus('disconnected');
        };

        ws.onclose = () => {
            setStatus('disconnected');
        };
    }, [token, selectedVoice]);

    const disconnect = () => {
        if (wsRef.current) {
            wsRef.current.send(JSON.stringify({ type: 'end' }));
            wsRef.current.close();
            wsRef.current = null;
        }
        setStatus('disconnected');
    };

    const sendText = (text: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'text', text }));
        }
    };

    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const [inputText, setInputText] = useState('');

    const handleSendText = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputText.trim()) {
            sendText(inputText);
            setInputText('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${status === 'listening' || status === 'speaking'
                                ? 'bg-green-500 animate-pulse'
                                : status === 'connected'
                                    ? 'bg-indigo-500'
                                    : 'bg-slate-700'
                            }`}>
                            <i className="fa-solid fa-microphone-lines text-2xl text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                                Gemini Live
                            </h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                                {status === 'listening' ? 'Listening...' :
                                    status === 'speaking' ? 'Speaking...' :
                                        status === 'connected' ? 'Ready' :
                                            status === 'connecting' ? 'Connecting...' : 'Disconnected'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            disabled={status !== 'disconnected'}
                            className="bg-white/10 text-white text-sm rounded-xl px-3 py-2 border border-white/20"
                        >
                            {voices.map((voice) => (
                                <option key={voice} value={voice}>{voice}</option>
                            ))}
                        </select>

                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                        >
                            <i className="fa-solid fa-times" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Visualization */}
                <div className="flex items-center justify-center mb-8">
                    <div className={`relative w-48 h-48 rounded-full ${status === 'listening' || status === 'speaking'
                            ? 'bg-indigo-500/20'
                            : 'bg-white/5'
                        }`}>
                        <div className={`absolute inset-4 rounded-full ${status === 'listening' || status === 'speaking'
                                ? 'bg-indigo-500/30 animate-ping'
                                : 'bg-white/10'
                            }`} />
                        <div className="absolute inset-8 rounded-full bg-indigo-600 flex items-center justify-center">
                            <i className={`fa-solid ${status === 'listening' ? 'fa-ear-listen' :
                                    status === 'speaking' ? 'fa-comment-dots' :
                                        'fa-microphone-slash'
                                } text-4xl text-white`} />
                        </div>
                    </div>
                </div>

                {/* Transcripts */}
                <div className="space-y-4">
                    {transcripts.map((t, i) => (
                        <div
                            key={i}
                            className={`p-4 rounded-2xl ${t.role === 'user'
                                    ? 'bg-white/10 ml-12'
                                    : 'bg-indigo-600/30 mr-12'
                                }`}
                        >
                            <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-300 mb-1">
                                {t.role === 'user' ? 'You' : 'Gemini'}
                            </p>
                            <p className="text-white">{t.text}</p>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl">
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="p-6 border-t border-white/10">
                {status === 'disconnected' ? (
                    <Button onClick={connect} variant="primary" size="lg" className="w-full">
                        <i className="fa-solid fa-phone mr-2" />
                        Start Voice Session
                    </Button>
                ) : (
                    <div className="space-y-4">
                        <form onSubmit={handleSendText} className="flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type a message (voice input coming soon)..."
                                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                            />
                            <Button type="submit" variant="primary">
                                <i className="fa-solid fa-paper-plane" />
                            </Button>
                        </form>

                        <Button onClick={disconnect} variant="danger" size="lg" className="w-full">
                            <i className="fa-solid fa-phone-slash mr-2" />
                            End Session
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
