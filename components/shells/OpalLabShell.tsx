import React, { useState } from 'react';
import { LabConfig } from '../../labs/LabConfig';
import { executeLab, LabExecutionResult } from '../../services/labExecutor';

interface OpalLabShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

const OpalLabShell: React.FC<OpalLabShellProps> = ({ config, onClose, onSaveToVault }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

    const handleExecute = async () => {
        if (!input.trim()) return;
        setIsProcessing(true);
        setOutput('');
        try {
            const result: LabExecutionResult = await executeLab(config.id, input);
            if (result.success) setOutput(result.output);
            else setOutput(`// Error: ${result.output}`);
        } catch (err: any) {
            setOutput(`// System Failure: ${err?.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#0F172A] text-slate-300 font-mono animate-in fade-in duration-500 flex flex-col">
            {/* App Builder Header */}
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-[#0B1120]">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-400 transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <i className="fa-solid fa-code"></i>
                        </div>
                        <span className="font-bold text-slate-100 tracking-wider">OPAL ENGINE <span className="text-slate-600 text-xs text-amber-500/50">v2.5 FLASH-LITE</span></span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-800 rounded-lg p-1">
                        <button onClick={() => setActiveTab('code')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'code' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>CODE</button>
                        <button onClick={() => setActiveTab('preview')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>PREVIEW</button>
                    </div>
                    <button onClick={() => onSaveToVault(output)} className="px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 text-xs font-bold uppercase tracking-widest transition-all">
                        <i className="fa-solid fa-save mr-2"></i> Save
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Inputs Sidebar */}
                <div className="w-1/3 border-r border-slate-800 flex flex-col bg-[#0B1120]">
                    <div className="p-6 flex-1 flex flex-col">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Application Specification</label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe the application architecture, stack, and core logic..."
                            className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:border-amber-500/50 transition-colors resize-none font-mono leading-relaxed custom-scrollbar"
                        />
                    </div>
                    <div className="p-6 border-t border-slate-800">
                        <button
                            onClick={handleExecute}
                            disabled={isProcessing || !input}
                            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${isProcessing ? 'bg-slate-800 text-slate-500' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20'}`}
                        >
                            {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-terminal"></i>}
                            {isProcessing ? 'Compiling...' : 'Build Application'}
                        </button>
                    </div>
                </div>

                {/* Code/Output Area */}
                <div className="flex-1 bg-[#0F172A] relative overflow-hidden flex flex-col">
                    {activeTab === 'code' ? (
                        <div className="flex-1 p-8 overflow-auto custom-scrollbar">
                            {output ? (
                                <pre className="text-sm font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                                    <code>{output}</code>
                                </pre>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-700 select-none pointer-events-none">
                                    <i className="fa-solid fa-laptop-code text-6xl mb-6 opacity-20"></i>
                                    <span className="font-bold tracking-widest text-xs uppercase opacity-40">Awaiting Specifications</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-white">
                            <div className="text-center text-slate-300">
                                <i className="fa-brands fa-react text-6xl mb-4 text-slate-200 animate-spin-slow"></i>
                                <p className="text-slate-400 font-medium">Live Preview Mode (Simulation)</p>
                            </div>
                        </div>
                    )}

                    {/* Status Bar */}
                    <div className="h-8 bg-[#0B1120] border-t border-slate-800 flex items-center px-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider justify-between">
                        <div className="flex items-center gap-4">
                            <span><i className="fa-solid fa-server mr-2"></i>Status: Ready</span>
                            <span><i className="fa-solid fa-memory mr-2"></i>Mem: 64MB</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>TypeScript</span>
                            <span>React</span>
                            <span>Tailwind</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OpalLabShell;
