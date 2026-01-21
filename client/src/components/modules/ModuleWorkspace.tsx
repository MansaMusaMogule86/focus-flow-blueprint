import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, LoadingSpinner } from '../ui';
import { ImagePreview, VideoPlayer, AudioPlayer } from '../media/MediaPreview';
import { VoiceSession } from '../media/VoiceSession';
import { api } from '../../services/api';

interface ModuleWorkspaceProps {
    moduleId: string;
    onClose: () => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type?: 'text' | 'image' | 'video' | 'audio' | 'json';
    data?: any;
}

export const ModuleWorkspace: React.FC<ModuleWorkspaceProps> = ({ moduleId, onClose }) => {
    const [module, setModule] = useState<any>(null);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState<number | null>(null);
    const [options, setOptions] = useState<Record<string, any>>({});
    const [showVoice, setShowVoice] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchModule = async () => {
            const data = await api.ai.getModule(moduleId);
            setModule(data);

            if (data.type === 'image') {
                setOptions({ aspectRatio: '1:1', style: 'photorealistic' });
            } else if (data.type === 'video') {
                setOptions({ aspectRatio: '16:9', duration: 5, style: 'cinematic' });
            } else if (data.type === 'audio' && moduleId !== 'gemini-live') {
                setOptions({ duration: 30, genre: 'ambient', mood: 'calm', tempo: 'medium' });
            }
        };
        fetchModule();
    }, [moduleId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Special handling for Gemini Live
    if (moduleId === 'gemini-live') {
        return showVoice ? (
            <div className="h-screen p-4">
                <VoiceSession onClose={() => setShowVoice(false)} />
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-screen text-center p-8 bg-slate-50 dark:bg-slate-950">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <i className="fa-solid fa-microphone-lines text-5xl text-white" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">
                    Gemini Live
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                    Real-time voice conversation with AI. Start a session to begin talking.
                </p>
                <div className="flex gap-3">
                    <Button onClick={() => setShowVoice(true)} variant="primary" size="lg">
                        <i className="fa-solid fa-phone mr-2" />
                        Start Voice Session
                    </Button>
                    <Button onClick={onClose} variant="secondary" size="lg">
                        <i className="fa-solid fa-arrow-left mr-2" />
                        Back
                    </Button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date(),
            type: 'text',
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const result = await api.ai.execute(moduleId, { content: input, options });

            const assistantMessage: Message = {
                role: 'assistant',
                content: result.output.content,
                timestamp: new Date(),
                type: result.output.type,
                data: result.output.data,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err: any) {
            const errorMessage: Message = {
                role: 'assistant',
                content: `Error: ${err.message}`,
                timestamp: new Date(),
                type: 'text',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToVault = async (msg: Message, idx: number) => {
        if (!module) return;

        setSaving(idx);
        try {
            await api.vault.save({
                type: msg.type === 'image' ? 'image' :
                    msg.type === 'video' ? 'video' :
                        msg.type === 'audio' ? 'audio' : 'text',
                title: `${module.name} Output - ${new Date().toLocaleDateString()}`,
                content: msg.content,
                moduleId: module.id,
                moduleName: module.name,
                metadata: msg.data || {},
                tags: [module.type, module.id],
            });
            alert('Saved to Vault!');
        } catch (err: any) {
            alert(`Failed to save: ${err.message}`);
        } finally {
            setSaving(null);
        }
    };

    const handleClearHistory = async () => {
        await api.ai.clearMemory(moduleId);
        setMessages([]);
    };

    if (!module) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const renderMessage = (msg: Message, idx: number) => {
        const isUser = msg.role === 'user';

        return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                    className={`max-w-[85%] rounded-2xl px-5 py-4 ${isUser
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-none'
                        }`}
                >
                    {msg.type === 'image' && msg.content && (
                        <ImagePreview src={msg.content} className="mb-3 max-w-md" />
                    )}

                    {msg.type === 'video' && msg.content && (
                        <VideoPlayer src={msg.content} className="mb-3 max-w-md" />
                    )}

                    {msg.type === 'audio' && msg.content && (
                        <AudioPlayer src={msg.content} className="mb-3 max-w-md" />
                    )}

                    {msg.type === 'json' && msg.data && (
                        <div className="space-y-3">
                            {msg.data.storyboard && (
                                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
                                        Storyboard
                                    </p>
                                    <pre className="text-xs whitespace-pre-wrap">{msg.data.storyboard}</pre>
                                </div>
                            )}
                            {msg.data.images && msg.data.images.length > 0 && (
                                <div className="grid grid-cols-2 gap-2">
                                    {msg.data.images.map((img: string, i: number) => (
                                        <ImagePreview key={i} src={img} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {(msg.type === 'text' || (msg.type === 'json' && !msg.data?.storyboard && !msg.data?.images)) && (
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                    )}

                    <div className={`flex items-center justify-between mt-2 ${isUser ? 'text-white/50' : 'text-slate-400'}`}>
                        <span className="text-[9px]">{msg.timestamp.toLocaleTimeString()}</span>

                        {/* Save to Vault button for assistant messages */}
                        {!isUser && (
                            <button
                                onClick={() => handleSaveToVault(msg, idx)}
                                disabled={saving === idx}
                                className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded transition-colors ${isUser
                                        ? 'hover:bg-white/20'
                                        : 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600'
                                    }`}
                            >
                                {saving === idx ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <>
                                        <i className="fa-solid fa-vault mr-1" /> Save
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <i className="fa-solid fa-arrow-left text-slate-500" />
                        </button>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${module.type === 'image' ? 'bg-pink-600' :
                                module.type === 'video' ? 'bg-purple-600' :
                                    module.type === 'audio' ? 'bg-green-600' :
                                        'bg-indigo-600'
                            }`}>
                            <i className={`fa-solid ${module.icon} text-white text-lg`} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                                {module.name}
                            </h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                                {module.type} module
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={handleClearHistory}>
                            <i className="fa-solid fa-trash-can mr-2" /> Clear
                        </Button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 ${module.type === 'image' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' :
                                module.type === 'video' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                                    module.type === 'audio' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                                        'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                            <i className={`fa-solid ${module.icon} text-3xl`} />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">
                            {module.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                            {module.description}
                        </p>
                    </div>
                )}

                {messages.map(renderMessage)}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none px-5 py-4 flex items-center space-x-2">
                            <LoadingSpinner size="sm" />
                            <span className="text-sm text-slate-500">
                                {module.type === 'image' ? 'Generating image...' :
                                    module.type === 'video' ? 'Creating video...' :
                                        module.type === 'audio' ? 'Composing audio...' :
                                            'Processing...'}
                            </span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Options Bar */}
            {(module.type === 'image' || module.type === 'video' || module.type === 'audio') && (
                <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                        {module.type === 'image' && (
                            <>
                                <select
                                    value={options.aspectRatio || '1:1'}
                                    onChange={(e) => setOptions({ ...options, aspectRatio: e.target.value })}
                                    className="text-xs bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 border-none"
                                >
                                    <option value="1:1">1:1 Square</option>
                                    <option value="16:9">16:9 Landscape</option>
                                    <option value="9:16">9:16 Portrait</option>
                                </select>
                                <select
                                    value={options.style || 'photorealistic'}
                                    onChange={(e) => setOptions({ ...options, style: e.target.value })}
                                    className="text-xs bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 border-none"
                                >
                                    <option value="photorealistic">Photorealistic</option>
                                    <option value="artistic">Artistic</option>
                                    <option value="anime">Anime</option>
                                    <option value="3d-render">3D Render</option>
                                </select>
                            </>
                        )}

                        {module.type === 'video' && (
                            <>
                                <select
                                    value={options.aspectRatio || '16:9'}
                                    onChange={(e) => setOptions({ ...options, aspectRatio: e.target.value })}
                                    className="text-xs bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 border-none"
                                >
                                    <option value="16:9">16:9 Landscape</option>
                                    <option value="9:16">9:16 Portrait</option>
                                    <option value="1:1">1:1 Square</option>
                                </select>
                                <select
                                    value={options.duration || 5}
                                    onChange={(e) => setOptions({ ...options, duration: parseInt(e.target.value) })}
                                    className="text-xs bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 border-none"
                                >
                                    <option value={5}>5 seconds</option>
                                    <option value={10}>10 seconds</option>
                                </select>
                            </>
                        )}

                        {module.type === 'audio' && (
                            <>
                                <select
                                    value={options.genre || 'ambient'}
                                    onChange={(e) => setOptions({ ...options, genre: e.target.value })}
                                    className="text-xs bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 border-none"
                                >
                                    <option value="ambient">Ambient</option>
                                    <option value="electronic">Electronic</option>
                                    <option value="orchestral">Orchestral</option>
                                </select>
                                <select
                                    value={options.mood || 'calm'}
                                    onChange={(e) => setOptions({ ...options, mood: e.target.value })}
                                    className="text-xs bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 border-none"
                                >
                                    <option value="calm">Calm</option>
                                    <option value="energetic">Energetic</option>
                                    <option value="dramatic">Dramatic</option>
                                </select>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4">
                <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={
                                module.type === 'image' ? 'Describe the image you want to create...' :
                                    module.type === 'video' ? 'Describe your video concept...' :
                                        module.type === 'audio' ? 'Describe the music or audio...' :
                                            `Ask ${module.name}...`
                            }
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                        />
                    </div>
                    <Button type="submit" variant="primary" size="lg" loading={loading} disabled={!input.trim()}>
                        <i className={`fa-solid ${module.type === 'image' ? 'fa-wand-magic-sparkles' :
                                module.type === 'video' ? 'fa-film' :
                                    module.type === 'audio' ? 'fa-music' :
                                        'fa-paper-plane'
                            }`} />
                    </Button>
                </form>
            </div>
        </div>
    );
};
