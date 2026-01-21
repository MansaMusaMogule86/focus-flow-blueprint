import { registry, ModuleInput, ModuleOutput, ModuleDefinition } from '../../ai/registry.js';
import { templateService } from '../../ai/templates.js';
import { aiProvider } from '../../ai/provider.js';

const vidsStudioModule: ModuleDefinition = {
    id: 'vids-studio',
    name: 'Vids Studio',
    description: 'Video pipeline with storyboard logic and asset orchestration',
    type: 'video',
    icon: 'fa-film',
    templateId: 'vids_storyboard',
    capabilities: ['storyboard', 'video-planning', 'script-to-visual', 'asset-orchestration'],
    config: {
        model: 'gemini-2.0-flash',
        maxTokens: 3072,
    },

    async execute(input: ModuleInput): Promise<ModuleOutput> {
        const style = input.options?.style || 'cinematic';

        const prompt = templateService.render('vids_storyboard', {
            input: input.content,
            style,
        });

        const response = await aiProvider.generateText(prompt, {
            model: 'gemini-2.0-flash',
            maxTokens: 3072,
            temperature: 0.8,
        });

        // Parse scenes from response
        const sceneMatches = response.match(/(?:Scene \d+|Shot \d+|Frame \d+)[\s\S]*?(?=(?:Scene \d+|Shot \d+|Frame \d+)|$)/gi) || [];

        return {
            success: true,
            content: response,
            type: 'json',
            data: {
                storyboard: response,
                scenes: sceneMatches.map((scene, index) => ({
                    id: index + 1,
                    content: scene.trim(),
                })),
                style,
                sceneCount: sceneMatches.length,
            },
        };
    },
};

registry.register(vidsStudioModule);

export { vidsStudioModule };
