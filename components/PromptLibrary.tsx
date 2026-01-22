import React, { useState } from 'react';

const PROMPT_CATEGORIES = [
    { id: 'masterclass', label: 'Masterclass Strategy', color: 'bg-slate-900 text-white border-none' },
    { id: 'creative', label: 'Creative Writing', color: 'bg-purple-100 text-purple-700' },
    { id: 'coding', label: 'Code & Logic', color: 'bg-blue-100 text-blue-700' },
    { id: 'business', label: 'Business Strategy', color: 'bg-emerald-100 text-emerald-700' },
    { id: 'personal', label: 'Personal Growth', color: 'bg-orange-100 text-orange-700' },
    { id: 'marketing', label: 'Growth Marketing', color: 'bg-rose-100 text-rose-700' },
];

const PRESET_PROMPTS = [
    // === MASTERCLASS ===
    { category: 'masterclass', title: 'Start-up CEO Simulator', prompt: 'Act as a seasoned Silicon Valley CEO mentor. I will present a business problem, and you will critique my approach, offer a counter-intuitive strategy, and outline a 30-day execution plan.' },
    { category: 'masterclass', title: 'First Principles Thinker', prompt: 'Break down the following complex problem into its fundamental truths. Remove all analogies and assumptions. Rebuild a solution from scratch based only on what is physically possible.' },
    { category: 'masterclass', title: 'The Antigravity Pivot', prompt: 'Identify the friction points in my current workflow/business model. Propose an "Antigravity" solution—one that removes the friction entirely rather than just managing it.' },
    { category: 'masterclass', title: 'Socratic Architect', prompt: 'I want to build a system. Do not give me the answer. Ask me 5 deep, structural questions that will force me to design the architecture myself. Guide me, do not drive.' },

    // === CREATIVE ===
    { category: 'creative', title: 'World Builder', prompt: 'Create a detailed lore system for a sci-fi universe where gravity fluctuates randomly.' },
    { category: 'creative', title: 'Character Deep Dive', prompt: 'Interview a fictional character about their deepest regret and how it shaped their future.' },
    { category: 'creative', title: 'The Villain\'s Monologue', prompt: 'Write a monologue for a sympathetic villain explaining why they had to destroy the utopia.' },

    // === CODING ===
    { category: 'coding', title: 'React Performance', prompt: 'Analyze this React component for render optimization and memory leaks.' },
    { category: 'coding', title: 'API Design', prompt: 'Design a RESTful API schema for a user authentication system with role-based access.' },
    { category: 'coding', title: 'Clean Code Refactor', prompt: 'Refactor this function to adhere to SOLID principles. Explain each change.' },

    // === BUSINESS ===
    { category: 'business', title: 'Market Analysis', prompt: 'Perform a SWOT analysis for a new AI-driven fitness app targeting remote workers.' },
    { category: 'business', title: 'Pitch Deck Flow', prompt: 'Outline a 10-slide pitch deck for a Series A funding round.' },
    { category: 'business', title: 'Blue Ocean Strategy', prompt: 'Identify a "Blue Ocean" in the current saturated SaaS market for productivity tools.' },

    // === PERSONAL ===
    { category: 'personal', title: 'Morning Routine', prompt: 'Design a 30-minute morning routine optimized for high dopamine and focus.' },
    { category: 'personal', title: 'Habit Stacking', prompt: 'Create a habit stacking protocol to integrate reading into a busy schedule.' },
    { category: 'personal', title: 'Skill Acquisition', prompt: 'Create a 4-week intensive curriculum to learn Python from scratch, assuming 1 hour per day.' },

    // === MARKETING ===
    { category: 'marketing', title: 'Viral Hook Generator', prompt: 'Generate 10 viral hooks for a Twitter thread about "Deep Work".' },
    { category: 'marketing', title: 'Email Sequence', prompt: 'Write a 5-email welcome sequence for a newsletter about AI tools. Focus on value first, sales last.' },
];

const PromptLibrary: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const filteredPrompts = selectedCategory === 'all'
        ? PRESET_PROMPTS
        : PRESET_PROMPTS.filter(p => p.category === selectedCategory);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans animate-in fade-in duration-500">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-1">Prompt Library_</h1>
                        <p className="text-slate-500 text-sm font-medium">Curated intelligence triggers for your workflow.</p>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-full hover:bg-slate-100 transition-colors">
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                {/* Categories */}
                <div className="max-w-7xl mx-auto mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                        All
                    </button>
                    {PROMPT_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === cat.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPrompts.map((item, idx) => (
                        <div key={idx} className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-200 rounded-[2rem] p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-6">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${PROMPT_CATEGORIES.find(c => c.id === item.category)?.color || 'bg-slate-200 text-slate-600'}`}>
                                    {PROMPT_CATEGORIES.find(c => c.id === item.category)?.label}
                                </span>
                                <button
                                    onClick={() => handleCopy(item.prompt, idx)}
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors active:scale-95"
                                >
                                    <i className={`fa-solid ${copiedIndex === idx ? 'fa-check' : 'fa-copy'}`}></i>
                                </button>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 group-hover:line-clamp-none transition-all">
                                "{item.prompt}"
                            </p>
                            <button
                                onClick={() => handleCopy(item.prompt, idx)}
                                className="w-full py-4 rounded-xl bg-white border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-900 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all"
                            >
                                {copiedIndex === idx ? 'Copied to Clipboard' : 'Use Prompt'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PromptLibrary;
