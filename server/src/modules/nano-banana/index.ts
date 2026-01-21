import { registry, ModuleInput, ModuleOutput, ModuleDefinition } from '../../ai/registry.js';
import { templateService } from '../../ai/templates.js';
import { aiProvider } from '../../ai/provider.js';

const nanoBananaModule: ModuleDefinition = {
    id: 'nano-banana',
    name: 'Nano Banana',
    description: 'Ultra-fast image synthesis with prompt-to-image pipeline',
    type: 'image',
    icon: 'fa-image',
    templateId: 'nano_image',
    capabilities: ['image-generation', 'prompt-engineering', 'visual-assets', 'creative-direction'],
    config: {
        model: 'gemini-2.0-flash-exp-image-generation',
        defaultAspectRatio: '1:1',
    },

    async execute(input: ModuleInput): Promise<ModuleOutput> {
        const style = input.options?.style || 'professional';
        const aspectRatio = input.options?.aspectRatio || '1:1';
        const generateImage = input.options?.generateImage !== false;

        // First, enhance the prompt
        const promptEnhancement = templateService.render('nano_image', {
            input: input.content,
            style,
        });

        const enhancedPrompt = await aiProvider.generateText(promptEnhancement, {
            model: 'gemini-2.0-flash',
            maxTokens: 1024,
            temperature: 0.9,
        });

        let imageData: string | null = null;
        if (generateImage) {
            // Extract the optimized prompt and generate image
            const imagePromptMatch = enhancedPrompt.match(/(?:Optimized Prompt|Image Prompt|Final Prompt):\s*(.+)/i);
            const imagePrompt = imagePromptMatch ? imagePromptMatch[1] : input.content;

            imageData = await aiProvider.generateImage(imagePrompt, aspectRatio);
        }

        return {
            success: true,
            content: imageData || enhancedPrompt,
            type: imageData ? 'image' : 'text',
            data: {
                enhancedPrompt,
                imageData,
                style,
                aspectRatio,
                generated: !!imageData,
            },
        };
    },
};

registry.register(nanoBananaModule);

export { nanoBananaModule };
