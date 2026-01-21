import { registry, ModuleInput, ModuleOutput, ModuleDefinition } from '../../ai/registry.js';
import { templateService } from '../../ai/templates.js';
import { aiProvider } from '../../ai/provider.js';

const stitchModule: ModuleDefinition = {
    id: 'stitch',
    name: 'Stitch',
    description: 'Real-time multimodal agent with streaming responses',
    type: 'multimodal',
    icon: 'fa-bolt-lightning',
    templateId: 'stitch_multimodal',
    capabilities: ['multimodal', 'streaming', 'real-time', 'complex-reasoning'],
    config: {
        model: 'gemini-2.5-flash-preview-05-20',
        useThinking: true,
    },

    async execute(input: ModuleInput): Promise<ModuleOutput> {
        const prompt = templateService.render('stitch_multimodal', {
            input: input.content,
            context: input.context || '',
        });

        const response = await aiProvider.generateWithThinking(prompt);

        return {
            success: true,
            content: response,
            type: 'text',
            metadata: {
                model: 'gemini-2.5-flash-preview-05-20',
                usedThinking: true,
            },
        };
    },
};

registry.register(stitchModule);

export { stitchModule };
