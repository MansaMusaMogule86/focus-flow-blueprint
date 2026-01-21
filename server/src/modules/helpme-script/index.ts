import { registry, ModuleInput, ModuleOutput, ModuleDefinition } from '../../ai/registry.js';
import { templateService } from '../../ai/templates.js';
import { aiProvider } from '../../ai/provider.js';

const helpmeScriptModule: ModuleDefinition = {
    id: 'helpme-script',
    name: 'Help Me Script',
    description: 'Script generator with tone control and reusable templates',
    type: 'text',
    icon: 'fa-file-code',
    templateId: 'helpme_script',
    capabilities: ['script-generation', 'tone-control', 'templates', 'boundary-setting'],
    config: {
        model: 'gemini-2.0-flash',
        maxTokens: 2048,
    },

    async execute(input: ModuleInput): Promise<ModuleOutput> {
        const tone = input.options?.tone || 'professional';

        const prompt = templateService.render('helpme_script', {
            input: input.content,
            tone,
        });

        const response = await aiProvider.generateText(prompt, {
            model: 'gemini-2.0-flash',
            maxTokens: 2048,
            temperature: 0.7,
        });

        // Extract scripts/templates
        const scripts = response.split(/(?=Script \d+:|Option \d+:|Template \d+:)/gi).filter(s => s.trim());

        return {
            success: true,
            content: response,
            type: 'json',
            data: {
                scripts,
                tone,
                count: scripts.length,
            },
        };
    },
};

registry.register(helpmeScriptModule);

export { helpmeScriptModule };
