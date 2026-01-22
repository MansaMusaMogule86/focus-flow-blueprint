import React, { useState } from 'react';
import { LabConfig } from '../../labs/LabConfig';

interface GeminiLiveShellProps {
    config: LabConfig;
    onClose: () => void;
    onSaveToVault: (content: string) => void;
}

const GeminiLiveLabShell: React.FC<GeminiLiveShellProps> = ({ config, onClose }) => {
    const [isActive, setIsActive] = useState(false);

    return (
        <div className="fixed inset-0 z-50 bg-[#eff6ff] text-blue-900 font-sans animate-in fade-in duration-500 flex flex-col items-center justify-center relative overflow-hidden pb-24">
            {/* Background Morphing Blobs */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-12">
                {/* Voice Orb */}
                <div className={`w-40 h-40 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-2xl flex items-center justify-center transition-all duration-1000 ${isActive ? 'scale-125 shadow-blue-500/50' : 'scale-100'}`}>
                    <div className="text-white text-5xl">
                        <i className={`fa-solid fa-microphone ${isActive ? 'animate-pulse' : ''}`}></i>
                    </div>
                </div>

                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-light tracking-tight text-slate-900">Gemini <span className="font-bold text-blue-600">Live</span></h1>
                    <p className="text-slate-500 font-medium">{isActive ? 'Listening...' : 'Tap to start conversation'}</p>
                </div>

                <div className="flex gap-6">
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${isActive ? 'bg-rose-500 text-white hover:bg-rose-600 rotate-180' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                    >
                        <i className={`fa-solid ${isActive ? 'fa-phone-slash' : 'fa-phone'}`}></i>
                    </button>
                    <button onClick={onClose} className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            <div className="absolute bottom-12 text-slate-400 text-xs font-bold uppercase tracking-widest">
                Ultra-Low Latency | Neural Voice
            </div>
        </div>
    );
};

export default GeminiLiveLabShell;
