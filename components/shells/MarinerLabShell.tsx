import React, { useState } from 'react';
import { LabConfig } from '../../labs/LabConfig';
import { executeLab, LabExecutionResult } from '../../services/labExecutor';

interface MarinerLabShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

const MarinerLabShell: React.FC<MarinerLabShellProps> = ({ config, onClose, onSaveToVault }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleExecute = async () => {
        if (!input.trim()) return;
        setIsProcessing(true);
        setOutput('');
        try {
            const result: LabExecutionResult = await executeLab(config.id, input);
            if (result.success) setOutput(result.output);
            else setOutput(`Agent Error: ${result.output}`);
        } catch (err: any) {
            setOutput(`Connect Error: ${err?.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-cyan-950 text-cyan-50 font-mono animate-in zoom-in-95 duration-500 flex flex-col">
            {/* Overlay Map Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#22d3ee 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            {/* Header */}
            <header className="h-20 bg-cyan-900/50 backdrop-blur-md border-b border-cyan-800 flex items-center justify-between px-8 relative z-10">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} className="w-10 h-10 border border-cyan-700 text-cyan-400 flex items-center justify-center hover:bg-cyan-800 transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-widest text-white">Project Mariner</h1>
                        <p className="text-[10px] text-cyan-400 uppercase tracking-widest">Autonomous Web Agent</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-cyan-400">
                    <span className="flex items-center gap-2"><i className="fa-solid fa-globe"></i> Network: Active</span>
                    <span className="flex items-center gap-2"><i className="fa-solid fa-shield-halved"></i> Proxy: Secure</span>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative z-10 p-8 gap-8">
                {/* Command Input */}
                <div className="w-1/3 flex flex-col gap-4">
                    <div className="bg-black/40 border border-cyan-800 p-6 flex-1 relative backdrop-blur-sm">
                        <div className="absolute top-0 left-0 px-2 py-1 bg-cyan-900/80 text-[10px] uppercase font-bold text-cyan-300">Mission Parameters</div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Define search vectors and objectives..."
                            className="w-full h-full bg-transparent border-none focus:outline-none text-cyan-100 placeholder:text-cyan-800 resize-none font-mono text-sm pt-6"
                        />
                    </div>
                    <button
                        onClick={handleExecute}
                        disabled={isProcessing || !input}
                        className="w-full py-5 bg-cyan-600 text-black font-bold uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:shadow-none clip-path-polygon"
                        style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                    >
                        {isProcessing ? 'Deploying...' : 'Launch Agent'}
                    </button>
                </div>

                {/* Data Feed */}
                <div className="flex-1 bg-black/60 border border-cyan-900 p-2 relative backdrop-blur-md flex flex-col">
                    <div className="h-8 flex items-center justify-between px-4 bg-cyan-950/50 border-b border-cyan-900 mb-2">
                        <span className="text-[10px] font-bold uppercase text-cyan-500">Live Data Stream</span>
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-cyan-900 rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-cyan-900 rounded-full"></span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed text-cyan-100 custom-scrollbar">
                        {output ? (
                            <div className="whitespace-pre-wrap">{output}</div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-30">
                                <i className="fa-solid fa-radar text-6xl mb-4 animate-[spin_4s_linear_infinite]"></i>
                                <p className="uppercase tracking-widest text-xs">Scanning Frequencies...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarinerLabShell;
