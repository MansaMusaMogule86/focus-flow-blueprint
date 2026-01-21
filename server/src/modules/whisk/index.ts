import { registry, ModuleInput, ModuleOutput, ModuleDefinition } from '../../ai/registry.js';
import { templateService } from '../../ai/templates.js';
import { aiProvider } from '../../ai/provider.js';

const whiskModule: ModuleDefinition = {
    id: 'whisk',
    name: 'Whisk',
    description: 'Automation agent for workflow execution and task chaining',
    type: 'text',
    icon: 'fa-wand-magic-sparkles',
    templateId: 'whisk_automation',
    capabilities: ['automation', 'workflow', 'task-chaining', 'process-optimization'],
    config: {
        model: 'gemini-2.0-flash',
        maxTokens: 2048,
    },

    async execute(input: ModuleInput): Promise<ModuleOutput> {
        const prompt = templateService.render('whisk_automation', {
            input: input.content,
            context: input.context || '',
        });

        const response = await aiProvider.generateText(prompt, {
            model: 'gemini-2.0-flash',
            maxTokens: 2048,
            temperature: 0.6,
        });

        // Parse workflow steps if possible
        const steps = response.match(/^\d+\.\s+.+$/gm) || [];

        return {
            success: true,
            content: response,
            type: 'json',
            data: {
                workflow: steps,
                rawResponse: response,
            },
        };
    },
};

registry.register(whiskModule);

export { whiskModule };
