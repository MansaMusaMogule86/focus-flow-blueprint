import { registry, ModuleInput, ModuleOutput, ModuleDefinition } from '../../ai/registry.js';
import { templateService } from '../../ai/templates.js';
import { aiProvider } from '../../ai/provider.js';

const marinerModule: ModuleDefinition = {
    id: 'mariner',
    name: 'Project Mariner',
    description: 'Research agent with web search and report generation',
    type: 'text',
    icon: 'fa-compass',
    templateId: 'mariner_research',
    capabilities: ['research', 'web-search', 'analysis', 'report-generation'],
    config: {
        model: 'gemini-2.0-flash',
        useSearch: true,
    },

    async execute(input: ModuleInput): Promise<ModuleOutput> {
        // First, do grounded search
        const searchResult = await aiProvider.searchGrounding(input.content);

        // Then synthesize with template
        const synthesisPrompt = templateService.render('mariner_research', {
            input: input.content,
            context: `Search results:\n${searchResult.text}\n\nPrevious research:\n${input.context || ''}`,
        });

        const response = await aiProvider.generateWithThinking(synthesisPrompt);

        return {
            success: true,
            content: response,
            type: 'json',
            data: {
                report: response,
                sources: searchResult.sources,
                query: input.content,
            },
        };
    },
};

registry.register(marinerModule);

export { marinerModule };
