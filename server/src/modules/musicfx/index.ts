import { registry, ModuleInput, ModuleOutput, ModuleDefinition } from '../../ai/registry.js';
import { aiProvider } from '../../ai/provider.js';
import { mediaService } from '../../services/media.service.js';

const musicfxModule: ModuleDefinition = {
    id: 'musicfx',
    name: 'MusicFX',
    description: 'AI-powered music and audio generation with waveform preview and playback',
    type: 'audio',
    icon: 'fa-music',
    templateId: 'musicfx_prompt',
    capabilities: ['music-generation', 'sound-design', 'ambient', 'waveform-preview'],
    config: {
        defaultDuration: 30,
        maxDuration: 120,
        formats: ['mp3', 'wav'],
    },

    async execute(input: ModuleInput): Promise<ModuleOutput> {
        const duration = Math.min(input.options?.duration || 30, 120);
        const genre = input.options?.genre || 'ambient';
        const mood = input.options?.mood || 'neutral';
        const tempo = input.options?.tempo || 'medium';

        // Generate a detailed audio description
        const audioPrompt = `Create music/audio for the following:

Description: ${input.content}
Genre: ${genre}
Mood: ${mood}
Tempo: ${tempo}
Duration: ${duration} seconds

Provide:
1. Musical structure breakdown
2. Instrumentation suggestions
3. Key and time signature
4. Dynamics and progression
5. Production notes

Then generate a text prompt optimized for AI music generation.`;

        const audioDescription = await aiProvider.generateText(audioPrompt, {
            temperature: 0.8,
            maxTokens: 1024,
        });

        // Extract the optimized prompt for audio generation
        const optimizedPromptMatch = audioDescription.match(/(?:optimized prompt|generation prompt|final prompt):\s*(.+)/i);
        const generationPrompt = optimizedPromptMatch
            ? optimizedPromptMatch[1]
            : `${genre} music, ${mood} mood, ${tempo} tempo. ${input.content}`;

        try {
            // Call audio generation API
            const audioResult = await aiProvider.generateAudio(generationPrompt, duration);

            if (audioResult) {
                const savedPath = await mediaService.saveAudio(input.userId, audioResult, {
                    prompt: input.content,
                    genre,
                    mood,
                    tempo,
                    duration,
                    moduleId: 'musicfx',
                });

                return {
                    success: true,
                    content: savedPath,
                    type: 'audio',
                    data: {
                        audioUrl: savedPath,
                        description: audioDescription,
                        prompt: input.content,
                        genre,
                        mood,
                        tempo,
                        duration,
                    },
                };
            }

            // Fallback to description only
            return {
                success: true,
                content: audioDescription,
                type: 'json',
                data: {
                    description: audioDescription,
                    generationPrompt,
                    prompt: input.content,
                    genre,
                    mood,
                    tempo,
                    duration,
                    status: 'description_only',
                    message: 'Audio generation not available. Description generated for reference.',
                },
            };
        } catch (error: any) {
            return {
                success: true,
                content: audioDescription,
                type: 'json',
                data: {
                    description: audioDescription,
                    prompt: input.content,
                    error: error.message,
                    status: 'description_only',
                },
            };
        }
    },
};

registry.register(musicfxModule);

export { musicfxModule };
