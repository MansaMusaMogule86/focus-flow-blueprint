import { registry, ModuleInput, ModuleOutput, ModuleDefinition } from '../../ai/registry.js';
import { templateService } from '../../ai/templates.js';
import { aiProvider } from '../../ai/provider.js';

const notebooklmModule: ModuleDefinition = {
    id: 'notebooklm',
    name: 'NotebookLM',
    description: 'Context ingestion, summarization, and long memory handling',
    type: 'text',
    icon: 'fa-book-open',
    templateId: 'notebooklm_synthesis',
    capabilities: ['summarization', 'synthesis', 'context-ingestion', 'long-memory'],
    config: {
        model: 'gemini-2.5-flash-preview-05-20',
        maxTokens: 4096,
        useThinking: true,
    },

    async execute(input: ModuleInput): Promise<ModuleOutput> {
        const prompt = templateService.render('notebooklm_synthesis', {
            input: input.content,
            context: input.context || '',
        });

        const response = await aiProvider.generateWithThinking(prompt);

        // Extract key insights
        const insights = response.match(/(?:insight|key point|takeaway):\s*(.+)/gi) || [];

        return {
            success: true,
            content: response,
            type: 'json',
            data: {
                synthesis: response,
                insights: insights.map(i => i.replace(/^(insight|key point|takeaway):\s*/i, '')),
            },
        };
    },
};

registry.register(notebooklmModule);

export { notebooklmModule };
