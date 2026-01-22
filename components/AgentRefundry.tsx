import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { geminiService } from '../services/geminiService';

interface Agent {
    id: string;
    name: string;
    role: string;
    system_prompt: string;
    model: string;
    tools: string[];
    avatar?: string;
    created_at: string;
}

const MODELS = [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', desc: 'High speed, low latency' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: 'Complex reasoning, 2M context' },
    { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', desc: 'Balanced creative baseline' }
];

const AVAILABLE_TOOLS = [
    { id: 'web_search', name: 'Web Search', icon: 'fa-globe' },
    { id: 'vision', name: 'Computer Vision', icon: 'fa-eye' },
    { id: 'data_analysis', name: 'Data Analysis', icon: 'fa-chart-pie' },
    { id: 'code_execution', name: 'Code Execution', icon: 'fa-terminal' },
    { id: 'memory', name: 'Long-term Memory', icon: 'fa-brain' }
];

const AgentRefundry: React.FC = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Agent>>({
        name: '',
        role: '',
        system_prompt: '',
        model: 'gemini-1.5-flash',
        tools: []
    });

    // Chat Test State
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchAgents();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const fetchAgents = async () => {
        try {
            const res = await api.get('/agents');
            setAgents(res.data);
        } catch (e) {
            console.error('Failed to fetch agents', e);
        }
    };

    const handleSelectAgent = (agent: Agent) => {
        setSelectedAgent(agent);
        setFormData(agent);
        setIsEditing(true);
        setChatMessages([{ role: 'model', text: `Agent ${agent.name} online. System initialized.` }]);
    };

    const handleNewAgent = () => {
        setSelectedAgent(null);
        setFormData({
            name: 'New Agent',
            role: 'General Assistant',
            system_prompt: 'You are a helpful AI assistant.',
            model: 'gemini-1.5-flash',
            tools: []
        });
        setIsEditing(true);
        setChatMessages([]);
    };

    const handleSaveAgent = async () => {
        if (!formData.name || !formData.role) return alert('Name and Role are required.');
        setLoading(true);
        try {
            if (selectedAgent) {
                // Update
                await api.put(`/agents/${selectedAgent.id}`, formData);
            } else {
                // Create
                await api.post('/agents', formData);
            }
            await fetchAgents();
            setIsEditing(false); // Go back to list/view mode? Or stay? Let's stay in edit mode but refresh
            alert('Agent saved successfully.');
        } catch (e) {
            alert('Failed to save agent.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAgent = async (id: string) => {
        if (!confirm('Are you sure you want to decommission this agent?')) return;
        try {
            await api.delete(`/agents/${id}`);
            fetchAgents();
            if (selectedAgent?.id === id) {
                setSelectedAgent(null);
                setIsEditing(false);
            }
        } catch (e) {
            alert('Failed to delete agent.');
        }
    };

    const toggleTool = (toolId: string) => {
        const currentTools = formData.tools || [];
        if (currentTools.includes(toolId)) {
            setFormData({ ...formData, tools: currentTools.filter(t => t !== toolId) });
        } else {
            setFormData({ ...formData, tools: [...currentTools, toolId] });
        }
    };

    const handleTestChat = async () => {
        if (!chatInput.trim()) return;
        const userMsg = chatInput;
        setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatInput('');
        setIsTesting(true);

        try {
            // We need a proper chat endpoint for "testing" an agent with specific config
            // For now, let's use the generic chat but prefix the system prompt
            // In a real implementation, we'd have a specific /api/agents/chat endpoint
            // simulating this by prepending system prompt
            const response = await geminiService.chatWithThinking(
                `SYSTEM INSTRUCTION: ${formData.system_prompt}\n\nUSER: ${userMsg}`
            );
            setChatMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (e) {
            setChatMessages(prev => [...prev, { role: 'model', text: '[Error: Connection to Neural Core failed.]' }]);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex animate-in fade-in duration-500 overflow-hidden rounded-[2rem] border border-slate-800 bg-[#0B0F19] shadow-2xl">

            {/* LEFT SIDEBAR: THE DEPOT */}
            <div className="w-80 bg-[#0f172a] border-r border-slate-800 flex flex-col">
                <div className="p-6 border-b border-slate-800/50">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/50">
                            <i className="fa-solid fa-industry text-white text-lg"></i>
                        </div>
                        <div>
                            <h2 className="text-white font-black uppercase tracking-tighter text-lg leading-none">Agent<br />Refundry</h2>
                        </div>
                    </div>
                    <button
                        onClick={handleNewAgent}
                        className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-lg flex items-center justify-center space-x-2"
                    >
                        <i className="fa-solid fa-plus"></i>
                        <span>New Unit</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {agents.map(agent => (
                        <div
                            key={agent.id}
                            onClick={() => handleSelectAgent(agent)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all group ${selectedAgent?.id === agent.id
                                    ? 'bg-slate-800 border-orange-500/50 shadow-lg'
                                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-slate-200 font-bold text-sm">{agent.name}</h3>
                                <span className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></span>
                            </div>
                            <p className="text-slate-500 text-xs truncate">{agent.role}</p>
                            <div className="mt-3 flex items-center gap-2">
                                {agent.tools.slice(0, 3).map(tool => (
                                    <div key={tool} className="w-5 h-5 rounded bg-slate-700 flex items-center justify-center text-[8px] text-slate-400">
                                        <i className={`fa-solid ${AVAILABLE_TOOLS.find(t => t.id === tool)?.icon || 'fa-bolt'}`}></i>
                                    </div>
                                ))}
                                {agent.tools.length > 3 && <span className="text-[9px] text-slate-500">+{agent.tools.length - 3}</span>}
                            </div>
                        </div>
                    ))}

                    {agents.length === 0 && (
                        <div className="text-center py-10 opacity-30">
                            <i className="fa-solid fa-box-open text-4xl mb-3 text-slate-600"></i>
                            <p className="text-xs uppercase font-bold text-slate-500">Depot Empty</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MIDDLE: THE FORGE (EDITOR) */}
            <div className="flex-1 bg-[#0B0F19] scrollbar-hide overflow-y-auto border-r border-slate-800 relative">
                {!isEditing ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <div className="w-32 h-32 border-2 border-dashed border-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                            <i className="fa-solid fa-wrench text-5xl opacity-20"></i>
                        </div>
                        <p className="font-mono text-sm uppercase tracking-widest">Select an agent to initialized forge</p>
                    </div>
                ) : (
                    <div className="p-8 max-w-4xl mx-auto space-y-8">
                        <div className="flex justify-between items-center pb-6 border-b border-slate-800">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight mb-1">
                                    {selectedAgent ? 'System Configuration' : 'Protocol Initialization'}
                                </h1>
                                <p className="text-orange-500 text-xs font-bold uppercase tracking-widest">
                                    Target: {formData.name || 'UNNAMED_UNIT'}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                {selectedAgent && (
                                    <button
                                        onClick={() => handleDeleteAgent(selectedAgent.id)}
                                        className="px-4 py-2 border border-red-900/50 text-red-500 rounded-lg text-xs font-bold uppercase hover:bg-red-900/20 transition-colors"
                                    >
                                        Delete
                                    </button>
                                )}
                                <button
                                    onClick={handleSaveAgent}
                                    disabled={loading}
                                    className="px-6 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-orange-500 shadow-lg shadow-orange-900/20 transition-all flex items-center gap-2"
                                >
                                    {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                                    Save Config
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Designation name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#131b2e] border border-slate-700 rounded-xl p-3 text-slate-200 focus:border-orange-500 outline-none text-sm transition-colors"
                                    placeholder="e.g. CyberSec Auditor"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operational Role</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-[#131b2e] border border-slate-700 rounded-xl p-3 text-slate-200 focus:border-orange-500 outline-none text-sm transition-colors"
                                    placeholder="e.g. Analyzes network logs"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Neural Core (Model)</label>
                            <div className="grid grid-cols-3 gap-4">
                                {MODELS.map(m => (
                                    <div
                                        key={m.id}
                                        onClick={() => setFormData({ ...formData, model: m.id })}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all ${formData.model === m.id
                                                ? 'bg-indigo-900/20 border-indigo-500'
                                                : 'bg-[#131b2e] border-slate-800 hover:border-slate-600'
                                            }`}
                                    >
                                        <h4 className={`text-sm font-bold ${formData.model === m.id ? 'text-indigo-400' : 'text-slate-300'}`}>{m.name}</h4>
                                        <p className="text-[10px] text-slate-500 mt-1">{m.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
                                <span>System Prompts / Directives</span>
                                <span className="text-[10px] text-emerald-500"><i className="fa-solid fa-check mr-1"></i>Optimized</span>
                            </label>
                            <textarea
                                value={formData.system_prompt}
                                onChange={e => setFormData({ ...formData, system_prompt: e.target.value })}
                                className="w-full h-64 bg-[#131b2e] border border-slate-700 rounded-xl p-4 text-slate-300 font-mono text-xs focus:border-orange-500 outline-none resize-none leading-relaxed"
                                placeholder="Define the agent's personality, constraints, and operational logic here..."
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Capabilities Installed</label>
                            <div className="flex flex-wrap gap-3">
                                {AVAILABLE_TOOLS.map(tool => (
                                    <button
                                        key={tool.id}
                                        onClick={() => toggleTool(tool.id)}
                                        className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all ${formData.tools?.includes(tool.id)
                                                ? 'bg-slate-700 border-slate-500 text-white shadow-md'
                                                : 'bg-[#131b2e] border-slate-800 text-slate-500 hover:border-slate-600'
                                            }`}
                                    >
                                        <i className={`fa-solid ${tool.icon} ${formData.tools?.includes(tool.id) ? 'text-orange-400' : ''}`}></i>
                                        {tool.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* RIGHT: LIVE TEST */}
            <div className="w-96 bg-[#0B0F19] border-l border-slate-800 flex flex-col pt-6">
                <div className="px-6 pb-4 border-b border-slate-800">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Live Simulation</h3>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-bold text-white">Connection Active</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/20">
                    {chatMessages.length === 0 && (
                        <div className="text-center mt-10 p-4 border border-dashed border-slate-800 rounded-xl">
                            <p className="text-xs text-slate-500">Initialize chat to test directives.</p>
                        </div>
                    )}
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'user'
                                    ? 'bg-slate-800 text-white rounded-br-none'
                                    : 'bg-indigo-900/30 border border-indigo-500/30 text-indigo-100 rounded-bl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTesting && (
                        <div className="flex justify-start">
                            <div className="bg-indigo-900/30 border border-indigo-500/30 p-3 rounded-2xl rounded-bl-none">
                                <div className="flex space-x-1">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 bg-[#0B0F19] border-t border-slate-800">
                    <div className="relative">
                        <input
                            type="text"
                            disabled={!isEditing}
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleTestChat()}
                            placeholder={isEditing ? "Test your agent..." : "Select agent to chat"}
                            className="w-full bg-[#131b2e] border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-xs text-white focus:border-indigo-500 outline-none placeholder:text-slate-600"
                        />
                        <button
                            onClick={handleTestChat}
                            disabled={!isEditing || !chatInput}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-orange-600 transition-all disabled:opacity-0"
                        >
                            <i className="fa-solid fa-paper-plane text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AgentRefundry;
