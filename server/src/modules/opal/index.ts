import { registry, ModuleInput, ModuleOutput, ModuleDefinition } from '../../ai/registry.js';
import { templateService } from '../../ai/templates.js';
import { aiProvider } from '../../ai/provider.js';

const opalModule: ModuleDefinition = {
    id: 'opal',
    name: 'Opal',
    description: 'Lightweight reasoning agent for fast, efficient responses',
    type: 'text',
    icon: 'fa-gem',
    templateId: 'opal_reasoning',
    capabilities: ['reasoning', 'quick-response', 'task-execution'],
    config: {
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.5,
    },

    async execute(input: ModuleInput): Promise<ModuleOutput> {
        const prompt = templateService.render('opal_reasoning', {
            input: input.content,
            context: input.context || '',
        });

        const response = await aiProvider.generateText(prompt, {
            model: 'gemini-2.0-flash',
            maxTokens: 1024,
            temperature: 0.5,
        });

        return {
            success: true,
            content: response,
            type: 'text',
        };
    },
};

// Register on import
registry.register(opalModule);

export { opalModule };
