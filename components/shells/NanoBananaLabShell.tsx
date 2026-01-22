import React, { useState } from 'react';
import { LabConfig } from '../../labs/LabConfig';
import { executeLab, LabExecutionResult } from '../../services/labExecutor';

interface NanoBananaLabShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

const NanoBananaLabShell: React.FC<NanoBananaLabShellProps> = ({ config, onClose, onSaveToVault }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState(''); // Stores image URL or status
    const [isProcessing, setIsProcessing] = useState(false);

    const handleExecute = async () => {
        if (!input.trim()) return;
        setIsProcessing(true);
        setOutput('');
        try {
            const result: LabExecutionResult = await executeLab(config.id, input);
            if (result.success) setOutput(result.output);
            else setOutput(`Error: ${result.output}`);
        } catch (err: any) {
            setOutput(`Synthesis Error: ${err?.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#FFD700] text-slate-900 font-sans animate-in zoom-in-95 duration-300 flex flex-col">
            {/* Pop Header */}
            <header className="h-16 flex items-center justify-between px-6 bg-yellow-400 border-b-4 border-black">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:translate-y-1 transition-transform shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <h1 className="text-2xl font-black uppercase italic tracking-tighter">Nano Banana <span className="text-xs not-italic bg-black text-yellow-400 px-2 py-0.5 rounded-full">FAST</span></h1>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-yellow-300 p-8 gap-8">
                {/* Controls */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
                        <label className="font-black uppercase text-xl">Prompt</label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe the image..."
                            className="bg-slate-100 border-2 border-black rounded-xl p-4 text-lg font-bold focus:outline-none focus:bg-white resize-none h-48"
                        />
                        <div className="flex gap-2">
                            {['1:1', '16:9', '9:16'].map(ratio => (
                                <button key={ratio} className="flex-1 py-2 border-2 border-black rounded-lg font-bold hover:bg-black hover:text-white transition-colors">{ratio}</button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleExecute}
                        disabled={isProcessing || !input}
                        className="py-6 bg-black text-yellow-400 font-black text-2xl uppercase tracking-widest rounded-full shadow-[8px_8px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_rgba(255,255,255,1)] transition-all active:translate-y-2 active:shadow-none disabled:opacity-50"
                    >
                        {isProcessing ? 'Blitzing...' : 'GO!'}
                    </button>
                </div>

                {/* Output Display */}
                <div className="flex-1 bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] flex items-center justify-center p-4 relative overflow-hidden">
                    {/* Placeholder Pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '10px 10px' }}></div>

                    {output ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Assuming output is a URL or markdown image for now, handling simply */}
                            <img src={output} alt="Generated" className="max-w-full max-h-full object-contain rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.2)]" />
                        </div>
                    ) : (
                        <div className="text-center opacity-20 rotate-[-5deg]">
                            <i className="fa-solid fa-bolt text-9xl text-black"></i>
                            <p className="font-black text-4xl mt-4">INSTANT</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NanoBananaLabShell;
