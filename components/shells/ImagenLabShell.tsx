import React, { useState } from 'react';
import { LabConfig } from '../../labs/LabConfig';
import { executeLab, LabExecutionResult } from '../../services/labExecutor';

interface ImagenLabShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

const ImagenLabShell: React.FC<ImagenLabShellProps> = ({ config, onClose, onSaveToVault }) => {
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
            else setOutput(`Error: ${result.output}`);
        } catch (err: any) {
            setOutput(`Generation Error: ${err?.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 text-sky-50 font-sans animate-in fade-in duration-700 flex flex-col">
            {/* Studio Header */}
            <header className="h-20 flex items-center justify-between px-10 bg-gradient-to-r from-slate-950 to-slate-900 border-b border-sky-900/30">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} className="w-10 h-10 rounded-full border border-sky-800 text-sky-500 hover:bg-sky-500/10 hover:text-sky-300 transition-all flex items-center justify-center">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <h1 className="text-2xl font-light tracking-wide text-white">Imagen <span className="font-bold text-sky-400">04</span></h1>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-sky-600">Cinematic Synthesis</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Control Panel */}
                <div className="w-80 bg-slate-900 border-r border-sky-900/20 p-8 flex flex-col z-10">
                    <div className="flex-1 space-y-8">
                        <div>
                            <label className="text-xs font-bold text-sky-700 uppercase tracking-widest mb-3 block">Visual Description</label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Describe lighting, composition, and subject..."
                                className="w-full h-48 bg-slate-950 border border-sky-900/30 rounded-lg p-4 text-sm font-medium text-sky-100 focus:outline-none focus:border-sky-500 transition-all resize-none placeholder:text-sky-900/50"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleExecute}
                        disabled={isProcessing || !input}
                        className="w-full py-4 bg-sky-600 text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-sky-500 transition-all shadow-[0_0_40px_rgba(2,132,199,0.3)] disabled:opacity-50 disabled:shadow-none"
                    >
                        {isProcessing ? 'Rendering...' : 'Generate Asset'}
                    </button>
                </div>

                {/* Viewport */}
                <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                    {/* Grid Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-20 text-sky-900 text-[10px]" style={{ backgroundImage: 'linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>

                    <div className="relative z-10 max-w-4xl w-full aspect-video bg-slate-900/50 border border-sky-900/30 flex items-center justify-center p-1 rounded-sm shadow-2xl">
                        {output ? (
                            <img src={output} alt="Cinematic Output" className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-center opacity-30">
                                <div className="w-20 h-20 border-t-2 border-l-2 border-sky-500 mx-auto mb-4"></div>
                                <p className="text-sky-500 font-light tracking-widest text-sm">VIEWPORT IDLE</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImagenLabShell;
