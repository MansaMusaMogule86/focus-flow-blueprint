import { registry, ModuleInput, ModuleOutput, ModuleDefinition } from '../../ai/registry.js';
import { aiProvider } from '../../ai/provider.js';
import { mediaService } from '../../services/media.service.js';

interface VideoJob {
    id: string;
    userId: string;
    prompt: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    videoUrl?: string;
    error?: string;
    createdAt: string;
}

const activeJobs: Map<string, VideoJob> = new Map();

const veo31Module: ModuleDefinition = {
    id: 'veo31',
    name: 'Veo 3.1',
    description: 'Cinematic video generation with storyboard logic and render progress tracking',
    type: 'video',
    icon: 'fa-film',
    templateId: 'veo_storyboard',
    capabilities: ['video-generation', 'storyboard', 'cinematic', 'progress-tracking'],
    config: {
        model: 'veo-2.0-generate-001',
        defaultDuration: 5,
        maxDuration: 10,
        supportedRatios: ['16:9', '9:16', '1:1'],
    },

    async execute(input: ModuleInput): Promise<ModuleOutput> {
        const aspectRatio = input.options?.aspectRatio || '16:9';
        const duration = Math.min(input.options?.duration || 5, 10);
        const style = input.options?.style || 'cinematic';

        // First generate a storyboard/script
        const storyboardPrompt = `Create a 5-shot cinematic storyboard for the following video concept:

"${input.content}"

For each shot, describe:
1. Visual composition
2. Camera movement
3. Key action
4. Duration (in seconds that sum to ${duration})
5. Transition to next shot

Style: ${style}
Aspect Ratio: ${aspectRatio}`;

        const storyboard = await aiProvider.generateText(storyboardPrompt, {
            temperature: 0.8,
            maxTokens: 2048,
        });

        // Construct the video generation prompt
        const videoPrompt = `${input.content}. ${style} style, cinematic quality, smooth motion, ${duration} seconds. ${aspectRatio} aspect ratio.`;

        try {
            // For now, return the storyboard and a placeholder for video
            // Real video generation would use Veo API
            const videoResult = await aiProvider.generateVideo(videoPrompt, aspectRatio, duration);

            if (videoResult) {
                const savedPath = await mediaService.saveVideo(input.userId, videoResult, {
                    prompt: input.content,
                    storyboard,
                    style,
                    aspectRatio,
                    duration,
                    moduleId: 'veo31',
                });

                return {
                    success: true,
                    content: savedPath,
                    type: 'video',
                    data: {
                        videoUrl: savedPath,
                        storyboard,
                        prompt: input.content,
                        style,
                        aspectRatio,
                        duration,
                    },
                };
            }

            // Fallback to storyboard only
            return {
                success: true,
                content: storyboard,
                type: 'json',
                data: {
                    storyboard,
                    prompt: input.content,
                    style,
                    aspectRatio,
                    duration,
                    status: 'storyboard_only',
                    message: 'Video generation not available. Storyboard generated for reference.',
                },
            };
        } catch (error: any) {
            return {
                success: true,
                content: storyboard,
                type: 'json',
                data: {
                    storyboard,
                    prompt: input.content,
                    style,
                    error: error.message,
                    status: 'storyboard_only',
                },
            };
        }
    },
};

registry.register(veo31Module);

export { veo31Module };
