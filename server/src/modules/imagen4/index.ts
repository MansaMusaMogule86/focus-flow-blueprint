import { registry, ModuleInput, ModuleOutput, ModuleDefinition } from '../../ai/registry.js';
import { templateService } from '../../ai/templates.js';
import { aiProvider } from '../../ai/provider.js';
import { mediaService } from '../../services/media.service.js';

const imagen4Module: ModuleDefinition = {
    id: 'imagen4',
    name: 'Imagen 4',
    description: 'Advanced image generation with prompt-to-image pipeline, variations, and gallery storage',
    type: 'image',
    icon: 'fa-wand-magic-sparkles',
    templateId: 'imagen_prompt',
    capabilities: ['image-generation', 'variations', 'gallery', 'prompt-engineering'],
    config: {
        model: 'imagen-3.0-generate-002',
        defaultAspectRatio: '1:1',
        supportedRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    },

    async execute(input: ModuleInput): Promise<ModuleOutput> {
        const aspectRatio = input.options?.aspectRatio || '1:1';
        const style = input.options?.style || 'photorealistic';
        const count = Math.min(input.options?.count || 1, 4);

        // Enhanced prompt for better image generation
        const enhancedPrompt = `${input.content}. Style: ${style}. High quality, detailed, professional.`;

        try {
            const images: string[] = [];

            for (let i = 0; i < count; i++) {
                const imageData = await aiProvider.generateImage(enhancedPrompt, aspectRatio);
                if (imageData) {
                    // Save to media storage
                    const savedPath = await mediaService.saveImage(input.userId, imageData, {
                        prompt: input.content,
                        style,
                        aspectRatio,
                        moduleId: 'imagen4',
                    });
                    images.push(savedPath);
                }
            }

            if (images.length === 0) {
                return {
                    success: false,
                    content: 'Failed to generate images. Please try again with a different prompt.',
                    type: 'text',
                };
            }

            return {
                success: true,
                content: images[0], // Primary image
                type: 'image',
                data: {
                    images,
                    prompt: input.content,
                    enhancedPrompt,
                    style,
                    aspectRatio,
                    count: images.length,
                },
            };
        } catch (error: any) {
            return {
                success: false,
                content: `Image generation failed: ${error.message}`,
                type: 'text',
            };
        }
    },
};

registry.register(imagen4Module);

export { imagen4Module };
