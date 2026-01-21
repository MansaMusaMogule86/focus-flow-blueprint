import { registry, ModuleDefinition } from '../../ai/registry.js';

// Gemini Live is a special module that uses WebSocket for real-time voice
// The actual voice handling happens in the WebSocket server

const geminiLiveModule: ModuleDefinition = {
    id: 'gemini-live',
    name: 'Gemini Live',
    description: 'Real-time voice conversation with low-latency streaming and live transcription',
    type: 'audio',
    icon: 'fa-microphone-lines',
    templateId: 'gemini_live',
    capabilities: ['voice-conversation', 'realtime-streaming', 'transcription', 'low-latency'],
    config: {
        model: 'gemini-2.0-flash-live-001',
        sampleRate: 16000,
        outputSampleRate: 24000,
        voices: ['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede', 'Leda', 'Orus', 'Zephyr'],
        defaultVoice: 'Zephyr',
    },

    // This module doesn't use standard execute - it uses WebSocket
    async execute(input) {
        return {
            success: true,
            content: JSON.stringify({
                type: 'gemini-live-init',
                message: 'Gemini Live uses WebSocket for real-time voice. Connect to ws://server/api/live',
                config: {
                    endpoint: '/api/live',
                    protocol: 'websocket',
                    sampleRate: 16000,
                    outputSampleRate: 24000,
                },
            }),
            type: 'json',
            data: {
                type: 'websocket-required',
                endpoint: '/api/live',
            },
        };
    },
};

registry.register(geminiLiveModule);

export { geminiLiveModule };
