import { config } from '../config/index.js';

export interface GenerateOptions {
    model?: string;
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
}

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
                inlineData?: { data: string; mimeType: string };
            }>;
        };
        groundingMetadata?: {
            groundingChunks?: any[];
        };
    }>;
    error?: { message: string };
}

interface ImagenResponse {
    predictions?: Array<{ bytesBase64Encoded?: string }>;
}

interface VideoResponse {
    name?: string;
    done?: boolean;
    response?: {
        generatedVideos?: Array<{
            video?: { uri?: string };
        }>;
    };
}

interface AudioResponse {
    audio?: { audioBytes?: string };
}

// AI provider with text, image, video, and audio generation
export const aiProvider = {
    async generateText(prompt: string, options: GenerateOptions = {}): Promise<string> {
        const model = options.model || 'gemini-2.0-flash';

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.ai.googleApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: options.systemPrompt ? { parts: [{ text: options.systemPrompt }] } : undefined,
                    generationConfig: {
                        maxOutputTokens: options.maxTokens || 4096,
                        temperature: options.temperature || 0.7,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json() as GeminiResponse;
            throw new Error(error.error?.message || 'AI generation failed');
        }

        const data = await response.json() as GeminiResponse;
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    },

    async generateWithThinking(prompt: string, options: GenerateOptions = {}): Promise<string> {
        const model = 'gemini-2.0-flash-thinking-exp';

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.ai.googleApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        systemInstruction: options.systemPrompt ? { parts: [{ text: options.systemPrompt }] } : undefined,
                    }),
                }
            );

            if (!response.ok) {
                return this.generateText(prompt, options);
            }

            const data = await response.json() as GeminiResponse;
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } catch {
            return this.generateText(prompt, options);
        }
    },

    async generateImage(prompt: string, aspectRatio: string = '1:1'): Promise<string | null> {
        try {
            // Try Imagen 3
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${config.ai.googleApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instances: [{ prompt }],
                        parameters: {
                            sampleCount: 1,
                            aspectRatio,
                        },
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json() as ImagenResponse;
                const imageBytes = data.predictions?.[0]?.bytesBase64Encoded;
                if (imageBytes) {
                    return `data:image/png;base64,${imageBytes}`;
                }
            }

            // Fallback to Gemini image generation
            const geminiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${config.ai.googleApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            responseModalities: ['IMAGE', 'TEXT'],
                        },
                    }),
                }
            );

            if (geminiResponse.ok) {
                const data = await geminiResponse.json() as GeminiResponse;
                const imagePart = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
                if (imagePart?.inlineData?.data) {
                    return `data:image/png;base64,${imagePart.inlineData.data}`;
                }
            }

            return null;
        } catch (error) {
            console.error('Image generation error:', error);
            return null;
        }
    },

    async generateVideo(prompt: string, aspectRatio: string = '16:9', duration: number = 5): Promise<string | null> {
        try {
            // Veo API call (when available)
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:generateVideos?key=${config.ai.googleApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt,
                        config: {
                            aspectRatio,
                            durationSeconds: duration,
                            numberOfVideos: 1,
                        },
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json() as VideoResponse;
                // Video generation is async, would need to poll for completion
                if (data.name) {
                    return await this.pollVideoGeneration(data.name);
                }
            }

            return null;
        } catch (error) {
            console.error('Video generation error:', error);
            return null;
        }
    },

    async pollVideoGeneration(operationName: string): Promise<string | null> {
        // Poll for video completion (max 2 minutes)
        const maxAttempts = 24;
        const pollInterval = 5000;

        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));

            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${config.ai.googleApiKey}`
                );

                if (response.ok) {
                    const data = await response.json() as VideoResponse;
                    if (data.done) {
                        const videoUri = data.response?.generatedVideos?.[0]?.video?.uri;
                        if (videoUri) {
                            // Fetch the video data
                            const videoResponse = await fetch(`${videoUri}&key=${config.ai.googleApiKey}`);
                            if (videoResponse.ok) {
                                const buffer = await videoResponse.arrayBuffer();
                                return Buffer.from(buffer).toString('base64');
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Poll error:', error);
            }
        }

        return null;
    },

    async generateAudio(prompt: string, duration: number = 30): Promise<string | null> {
        try {
            // MusicFX API (when available)
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/musicfx:generate?key=${config.ai.googleApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt,
                        config: {
                            durationSeconds: duration,
                        },
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json() as AudioResponse;
                const audioData = data.audio?.audioBytes;
                if (audioData) {
                    return `data:audio/mp3;base64,${audioData}`;
                }
            }

            return null;
        } catch (error) {
            console.error('Audio generation error:', error);
            return null;
        }
    },

    async searchGrounding(query: string): Promise<{ text: string; sources: any[] }> {
        const model = 'gemini-2.0-flash';

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.ai.googleApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: query }] }],
                    tools: [{ googleSearch: {} }],
                }),
            }
        );

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const data = await response.json() as GeminiResponse;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const sources = data.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return { text, sources };
    },
};
