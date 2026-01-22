import React, { useState } from 'react';

const AGENT_TEMPLATES = [
    { id: 'blank', title: 'Blank Slate', icon: 'fa-cube', description: 'Start from substantial nothingness. Build pure custom logic.' },
    { id: 'growth', title: 'Growth Architect', icon: 'fa-chart-line', description: 'Pre-configured for viral loops, funnel optimization, and scaling metrics.' },
    { id: 'systems', title: 'Systems Thinker', icon: 'fa-network-wired', description: 'Optimized for second-order thinking, root cause analysis, and architectural design.' },
    { id: 'creative', title: 'Muse Engine', icon: 'fa-pen-nib', description: 'High-temperature settings for divergent thinking and creative blocks.' },
];

const AgentBuilder: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [step, setStep] = useState(0);
    const [selectedTemplate, setSelectedTemplate] = useState('blank');

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans animate-in zoom-in-95 duration-500">
            {/* Split Layout */}
            <div className="flex flex-col lg:flex-row min-h-screen">

                {/* Visual Side */}
                <div className="lg:w-1/3 bg-slate-950 text-white p-12 flex flex-col justify-between relative overflow-hidden">
                    {/* Gemini Star Animation */}
                    <div className="absolute top-10 right-10 text-indigo-500 animate-slow-spin opacity-50">
                        <i className="fa-solid fa-star-of-life text-9xl"></i>
                    </div>
                    <div className="absolute bottom-20 left-10 text-purple-500 animate-float opacity-30">
                        <i className="fa-solid fa-star text-4xl"></i>
                    </div>

                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full -mr-20 -mt-20 blur-[100px] animate-pulse-slow"></div>

                    <div className="relative z-10">
                        <button onClick={onClose} className="mb-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <i className="fa-solid fa-arrow-left"></i>
                            <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
                        </button>

                        <h1 className="text-5xl font-black tracking-tighter mb-6 leading-none">
                            AGENT<br />REFUNDRY
                        </h1>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                            Construct autonomous neural agents. Access masterclass templates or forge from raw code.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className={`p-6 rounded-3xl border transition-all ${step === 0 ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/50' : 'bg-white/5 border-white/10'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Step 00</span>
                            <h3 className="text-xl font-bold mt-1">Select Template</h3>
                        </div>
                        <div className={`p-6 rounded-3xl border transition-all ${step === 1 ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/50' : 'bg-white/5 border-white/10'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Step 01</span>
                            <h3 className="text-xl font-bold mt-1">Core Identity</h3>
                        </div>
                        <div className={`p-6 rounded-3xl border transition-all ${step === 2 ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/50' : 'bg-white/5 border-white/10'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Step 02</span>
                            <h3 className="text-xl font-bold mt-1">Directives</h3>
                        </div>
                        <div className={`p-6 rounded-3xl border transition-all ${step === 3 ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/50' : 'bg-white/5 border-white/10'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Step 03</span>
                            <h3 className="text-xl font-bold mt-1">Deployment</h3>
                        </div>
                    </div>
                </div>

                {/* Interaction Side */}
                <div className="lg:w-2/3 p-12 lg:p-24 flex flex-col justify-center bg-[#FAFAFA] relative overflow-hidden">
                    {/* Background decor */}
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-indigo-50 to-white rounded-full translate-x-1/2 -translate-y-1/2 blur-[100px] -z-10"></div>

                    <div className="max-w-3xl w-full mx-auto relative z-10">

                        {step === 0 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 mb-2">Choose Foundation</h2>
                                    <p className="text-slate-500 font-medium">Select a neural architecture for your agent.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {AGENT_TEMPLATES.map(tmpl => (
                                        <div
                                            key={tmpl.id}
                                            onClick={() => setSelectedTemplate(tmpl.id)}
                                            className={`p-6 rounded-3xl border-2 cursor-pointer transition-all hover:-translate-y-1 ${selectedTemplate === tmpl.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${selectedTemplate === tmpl.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                <i className={`fa-solid ${tmpl.icon}`}></i>
                                            </div>
                                            <h3 className="font-bold text-slate-900">{tmpl.title}</h3>
                                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{tmpl.description}</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setStep(1)} className="px-10 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                                    Continue <i className="fa-solid fa-arrow-right ml-2"></i>
                                </button>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 mb-2">Define Identity</h2>
                                    <p className="text-slate-500 font-medium">Give your agent a name and a role.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-900">Agent Name</label>
                                        <input type="text" placeholder="e.g., Nexus, Orion, Keeper..." className="w-full text-2xl font-bold bg-transparent border-b-2 border-slate-200 focus:border-indigo-600 outline-none py-4 placeholder:text-slate-300 transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-900">Primary Function</label>
                                        <select className="w-full text-xl font-medium bg-transparent border-b-2 border-slate-200 focus:border-indigo-600 outline-none py-4 transition-colors">
                                            <option>Strategic Analysis</option>
                                            <option>Content Generation</option>
                                            <option>Process Automation</option>
                                            <option>Code Synthesis</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setStep(0)} className="px-10 py-5 bg-slate-100 text-slate-900 rounded-full font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">
                                        Back
                                    </button>
                                    <button onClick={() => setStep(2)} className="px-10 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                                        Continue <i className="fa-solid fa-arrow-right ml-2"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 mb-2">Prime Directives</h2>
                                    <p className="text-slate-500 font-medium">What rules must this agent follow?</p>
                                </div>
                                <div className="space-y-4">
                                    <textarea
                                        placeholder="Enter system instructions..."
                                        defaultValue={selectedTemplate === 'growth' ? 'You are a Growth Architect. Your goal is to identify viral loops and optimize conversion funnels.' : ''}
                                        className="w-full h-64 bg-white rounded-3xl p-8 border border-slate-200 focus:border-indigo-600 outline-none text-lg font-medium resize-none shadow-sm transition-colors"
                                    ></textarea>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="px-10 py-5 bg-slate-100 text-slate-900 rounded-full font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">
                                        Back
                                    </button>
                                    <button onClick={() => setStep(3)} className="px-10 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                                        Initialize <i className="fa-solid fa-bolt ml-2"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center space-y-8 animate-in zoom-in-90 duration-500">
                                <div className="w-32 h-32 mx-auto bg-indigo-600 rounded-full flex items-center justify-center text-white text-5xl shadow-2xl shadow-indigo-300 animate-pulse">
                                    <i className="fa-solid fa-check"></i>
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 mb-2">Agent Assembled</h2>
                                    <p className="text-slate-500 font-medium">Your autonomous unit is ready for deployment.</p>
                                </div>
                                <button onClick={onClose} className="px-12 py-6 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-sm hover:bg-emerald-600 transition-all shadow-2xl hover:-translate-y-2">
                                    Launch Agent
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentBuilder;
