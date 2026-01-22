/**
 * Generic Lab Shell
 * 
 * Mode-aware router component.
 * Purely delegational — no AI logic, no geminiService calls.
 * Reads labId, resolves config, delegates to appropriate Shell.
 */

import React from 'react';
import { getLabConfig, LabConfig } from '../labs/LabConfig';
import TextLabShell from './shells/TextLabShell';
import ImageLabShell from './shells/ImageLabShell';
import VideoLabShell from './shells/VideoLabShell';
import LiveLabShell from './shells/LiveLabShell';
import ExternalLabShell from './shells/ExternalLabShell';
import OpalLabShell from './shells/OpalLabShell';
import StitchLabShell from './shells/StitchLabShell';
import WhiskLabShell from './shells/WhiskLabShell';
import NotebookLMLabShell from './shells/NotebookLMLabShell';
import MarinerLabShell from './shells/MarinerLabShell';
import ScriptLabShell from './shells/ScriptLabShell';
import VidsLabShell from './shells/VidsLabShell';
import NanoBananaLabShell from './shells/NanoBananaLabShell';
import ImagenLabShell from './shells/ImagenLabShell';
import VeoLabShell from './shells/VeoLabShell';
import MusicFXLabShell from './shells/MusicFXLabShell';
import GeminiLiveLabShell from './shells/GeminiLiveLabShell';

interface GenericLabShellProps {
    labId: string;
    onClose: () => void;
    onSaveToVault: (labTitle: string, content: string) => void;
}

const GenericLabShell: React.FC<GenericLabShellProps> = ({
    labId,
    onClose,
    onSaveToVault
}) => {
    const config = getLabConfig(labId);

    // Unknown Lab fallback
    if (!config) {
        return (
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl text-center">
                <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fa-solid fa-triangle-exclamation text-rose-400 text-3xl"></i>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Unknown Lab</h3>
                <p className="text-white/50 text-sm mb-8">Lab "{labId}" not found in registry.</p>
                <button
                    onClick={onClose}
                    className="px-8 py-4 bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20"
                >
                    Return to Labs
                </button>
            </div>
        );
    }

    // Create a save handler that includes lab title
    const handleSaveToVault = (content: string) => {
        onSaveToVault(config.title, content);
    };

    // Delegate to mode-specific shell

    // Special Overrides for High-Value Labs
    if (labId === 'opal') {
        return <OpalLabShell config={config} onClose={onClose} onSaveToVault={handleSaveToVault} />;
    }

    if (labId === 'stitch') {
        return <StitchLabShell config={config} onClose={onClose} onSaveToVault={handleSaveToVault} />;
    }

    if (labId === 'whisk') {
        return <WhiskLabShell config={config} onClose={onClose} onSaveToVault={handleSaveToVault} />;
    }

    if (labId === 'notebooklm') {
        return <NotebookLMLabShell config={config} onClose={onClose} onSaveToVault={handleSaveToVault} />;
    }

    if (labId === 'project-mariner') {
        return <MarinerLabShell config={config} onClose={onClose} onSaveToVault={handleSaveToVault} />;
    }

    if (labId === 'help-me-script') {
        return <ScriptLabShell config={config} onClose={onClose} onSaveToVault={handleSaveToVault} />;
    }

    if (labId === 'vids-studio') {
        return <VidsLabShell config={config} onClose={onClose} onSaveToVault={handleSaveToVault} />;
    }

    if (labId === 'nano-banana') {
        return <NanoBananaLabShell config={config} onClose={onClose} onSaveToVault={handleSaveToVault} />;
    }

    if (labId === 'imagen-4') {
        return <ImagenLabShell config={config} onClose={onClose} onSaveToVault={handleSaveToVault} />;
    }

    if (labId === 'veo-3') {
        return <VeoLabShell config={config} onClose={onClose} onSaveToVault={handleSaveToVault} />;
    }

    if (labId === 'musicfx') {
        return <MusicFXLabShell config={config} onClose={onClose} onSaveToVault={handleSaveToVault} />;
    }

    if (labId === 'gemini-live') {
        return <GeminiLiveLabShell config={config} onClose={onClose} onSaveToVault={handleSaveToVault} />;
    }

    switch (config.mode) {
        case 'text':
            return (
                <TextLabShell
                    config={config}
                    onClose={onClose}
                    onSaveToVault={handleSaveToVault}
                />
            );

        case 'image':
            return (
                <ImageLabShell
                    config={config}
                    onClose={onClose}
                    onSaveToVault={handleSaveToVault}
                />
            );

        case 'video':
            return (
                <VideoLabShell
                    config={config}
                    onClose={onClose}
                    onSaveToVault={handleSaveToVault}
                />
            );

        case 'live':
            return (
                <LiveLabShell
                    config={config}
                    onClose={onClose}
                    onSaveToVault={handleSaveToVault}
                />
            );

        case 'external':
            return (
                <ExternalLabShell
                    config={config}
                    onClose={onClose}
                    onSaveToVault={handleSaveToVault}
                />
            );

        default:
            // Fallback to text shell for unknown modes
            return (
                <TextLabShell
                    config={config}
                    onClose={onClose}
                    onSaveToVault={handleSaveToVault}
                />
            );
    }
};

export default GenericLabShell;
