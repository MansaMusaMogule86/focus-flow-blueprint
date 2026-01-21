import { config } from '../config/index.js';

interface TranscriptionResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{ text?: string }>;
        };
    }>;
}

interface TTSResponse {
    audioContent?: string;
}

interface GeminiAudioResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                inlineData?: { data: string; mimeType: string };
            }>;
        };
    }>;
}

export const voiceService = {
    // Transcribe audio to text using Google Speech API
    async transcribe(audioBuffer: Buffer, mimeType: string): Promise<string> {
        try {
            // Use Gemini's multimodal capability for transcription
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.ai.googleApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: 'Transcribe this audio accurately. Return only the transcription, nothing else.' },
                                {
                                    inlineData: {
                                        mimeType: mimeType || 'audio/webm',
                                        data: audioBuffer.toString('base64'),
                                    }
                                }
                            ]
                        }],
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Transcription failed');
            }

            const data = await response.json() as TranscriptionResponse;
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } catch (error) {
            console.error('Transcription error:', error);
            throw new Error('Failed to transcribe audio');
        }
    },

    // Synthesize text to speech
    async synthesize(text: string, _voice: string = 'Zephyr'): Promise<Buffer | null> {
        try {
            // Use Google Text-to-Speech via Gemini Live API
            const response = await fetch(
                `https://texttospeech.googleapis.com/v1/text:synthesize?key=${config.ai.googleApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        input: { text },
                        voice: {
                            languageCode: 'en-US',
                            name: 'en-US-Neural2-J',
                            ssmlGender: 'MALE',
                        },
                        audioConfig: {
                            audioEncoding: 'MP3',
                            speakingRate: 1.0,
                            pitch: 0,
                        },
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json() as TTSResponse;
                if (data.audioContent) {
                    return Buffer.from(data.audioContent, 'base64');
                }
            }

            // Fallback: Try alternative TTS approach
            const altResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.ai.googleApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: `Convert to speech: "${text}"` }]
                        }],
                        generationConfig: {
                            responseModalities: ['AUDIO'],
                        },
                    }),
                }
            );

            if (altResponse.ok) {
                const altData = await altResponse.json() as GeminiAudioResponse;
                const audioPart = altData.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.mimeType?.startsWith('audio'));
                if (audioPart?.inlineData?.data) {
                    return Buffer.from(audioPart.inlineData.data, 'base64');
                }
            }

            return null;
        } catch (error) {
            console.error('TTS error:', error);
            return null;
        }
    },
};
