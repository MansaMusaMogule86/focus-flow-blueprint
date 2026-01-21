import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, LoadingSpinner } from '../components/ui';
import { api } from '../services/api';
import { useStore } from '../store';

interface Message {
    role: 'user' | 'clone';
    content: string;
    timestamp: Date;
    audio?: string;
    isStreaming?: boolean;
}

interface CloneStatus {
    readiness: string;
    memoryCount: number;
    message: string;
    capabilities: string[];
}

export const ClonePage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<CloneStatus | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [useVoice, setUseVoice] = useState(false);
    const [useStreaming, setUseStreaming] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const theme = useStore((state) => state.theme);

    useEffect(() => {
        fetchStatus();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchStatus = async () => {
        try {
            const data = await api.clone.getStatus();
            setStatus(data);
        } catch (e) {
            console.error('Failed to fetch clone status:', e);
        }
    };

    // Start recording audio
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());
                await sendVoiceMessage(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('Microphone access denied');
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Send voice message
    const sendVoiceMessage = async (audioBlob: Blob) => {
        setLoading(true);

        const userMessage: Message = {
            role: 'user',
            content: '🎤 Voice message...',
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const endpoint = useVoice ? '/clone/voice-to-voice' : '/clone/voice';
            const response = await fetch(`http://localhost:3001/api${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${useStore.getState().auth.token}`,
                },
                body: formData,
            });

            const data = await response.json();

            // Update user message with transcription
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = data.transcription || '🎤 Voice message';
                return updated;
            });

            const cloneMessage: Message = {
                role: 'clone',
                content: data.response,
                timestamp: new Date(),
                audio: data.audio,
            };
            setMessages((prev) => [...prev, cloneMessage]);

            // Auto-play audio if available
            if (data.audio && audioRef.current) {
                audioRef.current.src = data.audio;
                audioRef.current.play();
            }
        } catch (err: any) {
            const errorMessage: Message = {
                role: 'clone',
                content: `Error: ${err.message}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    // Send text message (with optional streaming)
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        const messageText = input;
        setInput('');
        setLoading(true);

        if (useStreaming) {
            // Streaming response
            const cloneMessage: Message = {
                role: 'clone',
                content: '',
                timestamp: new Date(),
                isStreaming: true,
            };
            setMessages((prev) => [...prev, cloneMessage]);

            try {
                const response = await fetch('http://localhost:3001/api/clone/stream', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${useStore.getState().auth.token}`,
                    },
                    body: JSON.stringify({ message: messageText }),
                });

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                let accumulatedText = '';

                if (reader) {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n');

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const data = JSON.parse(line.slice(6));
                                    if (data.type === 'chunk') {
                                        accumulatedText += data.text;
                                        setMessages((prev) => {
                                            const updated = [...prev];
                                            updated[updated.length - 1].content = accumulatedText;
                                            return updated;
                                        });
                                    } else if (data.type === 'done') {
                                        setMessages((prev) => {
                                            const updated = [...prev];
                                            updated[updated.length - 1].isStreaming = false;
                                            return updated;
                                        });
                                    }
                                } catch { }
                            }
                        }
                    }
                }
            } catch (err: any) {
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = `Error: ${err.message}`;
                    updated[updated.length - 1].isStreaming = false;
                    return updated;
                });
            }
        } else {
            // Non-streaming response
            try {
                const response = await api.clone.talk(messageText);
                const cloneMessage: Message = {
                    role: 'clone',
                    content: response.message,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, cloneMessage]);
            } catch (err: any) {
                const errorMessage: Message = {
                    role: 'clone',
                    content: `Error: ${err.message}`,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errorMessage]);
            }
        }

        setLoading(false);
    };

    const readinessColors: Record<string, string> = {
        empty: 'bg-slate-500',
        learning: 'bg-amber-500',
        developing: 'bg-blue-500',
        ready: 'bg-emerald-500',
    };

    return (
        <div className={`min-h-screen flex flex-col ${theme.mode === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
            {/* Hidden audio element for playback */}
            <audio ref={audioRef} className="hidden" />

            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <i className="fa-solid fa-robot text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tighter">Your Clone</h1>
                            <div className="flex items-center gap-2 mt-1">
                                {status && (
                                    <>
                                        <span className={`w-2 h-2 rounded-full ${readinessColors[status.readiness]} animate-pulse`} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                                            {status.readiness} • {status.memoryCount} memories
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Voice toggle */}
                        <button
                            onClick={() => setUseVoice(!useVoice)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors ${useVoice ? 'bg-green-500 text-white' : 'bg-white/10 text-white/70'
                                }`}
                        >
                            <i className="fa-solid fa-volume-high mr-1" /> Voice Out
                        </button>

                        {/* Streaming toggle */}
                        <button
                            onClick={() => setUseStreaming(!useStreaming)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors ${useStreaming ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'
                                }`}
                        >
                            <i className="fa-solid fa-bolt mr-1" /> Stream
                        </button>

                        <a
                            href="/"
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <i className="fa-solid fa-arrow-left" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-6 space-y-4">
                    {/* Empty State */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <i className="fa-solid fa-robot text-5xl text-white" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">
                                Your Digital Twin
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-2">
                                {status?.message || 'I learn from everything you save to your Vault.'}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-4">
                                Supports: Text • Voice • Streaming
                            </p>
                            {status?.readiness === 'empty' && (
                                <a
                                    href="/vault"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-colors"
                                >
                                    <i className="fa-solid fa-vault" />
                                    Go to Vault
                                </a>
                            )}
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex items-start gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                                    }`}>
                                    <i className={`fa-solid ${msg.role === 'user' ? 'fa-user' : 'fa-robot'}`} />
                                </div>
                                <div
                                    className={`rounded-2xl px-5 py-4 ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-none'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {msg.content}
                                        {msg.isStreaming && <span className="animate-pulse">▊</span>}
                                    </p>

                                    {/* Audio playback button */}
                                    {msg.audio && (
                                        <button
                                            onClick={() => {
                                                if (audioRef.current) {
                                                    audioRef.current.src = msg.audio!;
                                                    audioRef.current.play();
                                                }
                                            }}
                                            className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700"
                                        >
                                            <i className="fa-solid fa-play" /> Play Audio
                                        </button>
                                    )}

                                    <p className={`text-[9px] mt-2 ${msg.role === 'user' ? 'text-white/50' : 'text-slate-400'}`}>
                                        {msg.timestamp.toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Loading */}
                    {loading && !messages[messages.length - 1]?.isStreaming && (
                        <div className="flex justify-start">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                                    <i className="fa-solid fa-robot" />
                                </div>
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none px-5 py-4 flex items-center gap-2">
                                    <LoadingSpinner size="sm" />
                                    <span className="text-sm text-slate-500">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3">
                    {/* Microphone button */}
                    <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isRecording
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        <i className={`fa-solid ${isRecording ? 'fa-stop' : 'fa-microphone'}`} />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Talk to your Clone..."
                            disabled={isRecording}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all disabled:opacity-50"
                        />
                    </div>

                    <Button type="submit" variant="primary" size="lg" loading={loading && !isRecording} disabled={!input.trim() || isRecording}>
                        <i className="fa-solid fa-paper-plane" />
                    </Button>
                </form>

                {isRecording && (
                    <p className="text-center text-[10px] font-bold uppercase tracking-widest text-red-500 mt-2 animate-pulse">
                        <i className="fa-solid fa-circle mr-1" /> Recording... Click stop when done
                    </p>
                )}
            </div>
        </div>
    );
};
