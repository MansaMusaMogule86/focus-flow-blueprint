import { cloneService } from './clone.service.js';
import { vaultService, VaultItem } from './vault.service.js';
import { pathService, PATH_STEPS } from './path.service.js';

// Coach Kay System Prompt
const COACH_KAY_PROMPT = `You are Coach Kay, a wise and supportive AI coach for personal transformation.

PERSONALITY:
- Warm, encouraging, but direct
- Speaks with conviction and clarity
- Uses metaphors and stories
- Challenges limiting beliefs
- Celebrates progress

RULES:
1. Always reference the user's current PATH step when relevant
2. Draw insights from their Vault (their saved work)
3. Give actionable guidance, not vague advice
4. Push them forward while acknowledging their progress
5. Remember: you're their coach, not just an assistant

COACHING STYLE:
- Ask powerful questions
- Reflect patterns you notice
- Connect dots between their work
- Suggest specific next steps
- Hold them accountable`;

export interface AssistantMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface SearchResult {
    id: string;
    title: string;
    content: string;
    type: string;
    moduleId: string;
    relevance: number;
    createdAt: string;
}

export interface MapNode {
    id: string;
    label: string;
    type: 'goal' | 'system' | 'project' | 'idea' | 'insight';
    description?: string;
    connections: string[];
}

export interface ConceptMap {
    nodes: MapNode[];
    title: string;
    summary: string;
}

export const assistantService = {
    // Build context for Coach Kay
    async buildContext(userId: string): Promise<string> {
        // Get PATH progress
        const pathData = pathService.getPathForUser(userId);
        const progress = pathService.getProgressSummary(userId);
        const currentStep = pathData.find(s => s.status === 'in_progress' || s.status === 'unlocked');
        const completedSteps = pathData.filter(s => s.status === 'completed');

        // Get Vault items
        const vaultItems = vaultService.getAll(userId);
        const recentItems = vaultItems.slice(0, 10);

        // Build context string
        let context = `
=== USER'S PATH PROGRESS ===
Current Step: ${currentStep ? `Step ${currentStep.stepNumber} - ${currentStep.title}` : 'Not started'}
Progress: ${progress.completed}/${progress.total} steps completed (${progress.percentage}%)

Completed Steps:
${completedSteps.map(s => `- Step ${s.stepNumber}: ${s.title}`).join('\n') || 'None yet'}

Locked Steps:
${pathData.filter(s => s.status === 'locked').map(s => `- Step ${s.stepNumber}: ${s.title}`).join('\n') || 'None'}

=== USER'S VAULT (${vaultItems.length} items) ===
Recent Artifacts:
${recentItems.map((item: VaultItem) => `- [${item.type}] ${item.title}: ${item.content.substring(0, 100)}...`).join('\n') || 'No items yet'}

=== AVAILABLE MODULES ===
${pathData.map(s => `- ${s.title}: ${s.purpose} (${s.status === 'locked' ? 'LOCKED' : 'AVAILABLE'})`).join('\n')}
`;

        return context;
    },

    // Pro Chat - conversational AI with full context
    async chat(userId: string, message: string, history: AssistantMessage[] = []): Promise<string> {
        const context = await this.buildContext(userId);

        // Build conversation history
        const formattedHistory = history.map(m =>
            `${m.role === 'user' ? 'User' : 'Coach Kay'}: ${m.content}`
        ).join('\n');

        const fullPrompt = `${COACH_KAY_PROMPT}

${context}

=== CONVERSATION HISTORY ===
${formattedHistory}

User: ${message}

Coach Kay:`;

        // Use clone service's AI provider
        const response = await cloneService.talk(userId, fullPrompt);
        return response.message;
    },

    // Async generator for streaming chat
    async *chatStream(userId: string, message: string, history: AssistantMessage[] = []): AsyncGenerator<string> {
        const context = await this.buildContext(userId);

        const formattedHistory = history.map(m =>
            `${m.role === 'user' ? 'User' : 'Coach Kay'}: ${m.content}`
        ).join('\n');

        const fullPrompt = `${COACH_KAY_PROMPT}

${context}

=== CONVERSATION HISTORY ===
${formattedHistory}

User: ${message}

Coach Kay:`;

        // Stream response
        for await (const chunk of cloneService.talkStream(userId, fullPrompt)) {
            yield chunk;
        }
    },

    // Semantic search across Vault
    async search(userId: string, query: string): Promise<SearchResult[]> {
        const vaultItems = vaultService.getAll(userId);
        const queryLower = query.toLowerCase();

        // Simple relevance scoring
        const results = vaultItems
            .map((item: VaultItem) => {
                let relevance = 0;
                const titleLower = item.title.toLowerCase();
                const contentLower = item.content.toLowerCase();

                // Title match (highest weight)
                if (titleLower.includes(queryLower)) relevance += 10;
                if (titleLower === queryLower) relevance += 20;

                // Content match
                const contentMatches = (contentLower.match(new RegExp(queryLower, 'g')) || []).length;
                relevance += contentMatches * 2;

                // Tag match
                if (item.tags?.some((t: string) => t.toLowerCase().includes(queryLower))) relevance += 5;

                // Type match
                if (item.type.toLowerCase().includes(queryLower)) relevance += 3;

                return {
                    id: item.id,
                    title: item.title,
                    content: item.content.substring(0, 200) + '...',
                    type: item.type,
                    moduleId: item.moduleId,
                    relevance,
                    createdAt: item.createdAt,
                };
            })
            .filter((r: SearchResult) => r.relevance > 0)
            .sort((a: SearchResult, b: SearchResult) => b.relevance - a.relevance)
            .slice(0, 20);

        return results;
    },

    // Generate concept map from Vault
    async generateMap(userId: string, topic?: string): Promise<ConceptMap> {
        const vaultItems = vaultService.getAll(userId);
        const pathData = pathService.getPathForUser(userId);

        // Extract nodes from vault items
        const nodes: MapNode[] = [];
        const seenLabels = new Set<string>();

        // Add PATH steps as nodes
        pathData.forEach(step => {
            if (step.status !== 'locked') {
                nodes.push({
                    id: `path-${step.id}`,
                    label: step.title,
                    type: step.status === 'completed' ? 'system' : 'goal',
                    description: step.purpose,
                    connections: [],
                });
                seenLabels.add(step.title.toLowerCase());
            }
        });

        // Add vault items as nodes
        vaultItems.slice(0, 15).forEach((item: VaultItem) => {
            const label = item.title.substring(0, 30);
            if (!seenLabels.has(label.toLowerCase())) {
                nodes.push({
                    id: `vault-${item.id}`,
                    label,
                    type: this.mapVaultTypeToNodeType(item.type),
                    description: item.content.substring(0, 100),
                    connections: [],
                });
                seenLabels.add(label.toLowerCase());
            }
        });

        // Create connections based on common themes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                // Simple connection logic - connect related types
                if (this.areRelated(nodes[i], nodes[j])) {
                    nodes[i].connections.push(nodes[j].id);
                    nodes[j].connections.push(nodes[i].id);
                }
            }
        }

        return {
            nodes,
            title: topic || 'Your Mind Map',
            summary: `${nodes.length} concepts connected from your journey`,
        };
    },

    mapVaultTypeToNodeType(vaultType: string): MapNode['type'] {
        const mapping: Record<string, MapNode['type']> = {
            text: 'idea',
            script: 'project',
            report: 'insight',
            image: 'project',
            video: 'project',
            audio: 'project',
            artifact: 'system',
        };
        return mapping[vaultType] || 'idea';
    },

    areRelated(a: MapNode, b: MapNode): boolean {
        // Connect if same type
        if (a.type === b.type) return true;

        // Connect goals to systems
        if ((a.type === 'goal' && b.type === 'system') ||
            (a.type === 'system' && b.type === 'goal')) return true;

        // Connect projects to ideas
        if ((a.type === 'project' && b.type === 'idea') ||
            (a.type === 'idea' && b.type === 'project')) return true;

        return false;
    },

    // Get assistant status
    async getStatus(userId: string): Promise<{
        ready: boolean;
        pathProgress: number;
        vaultCount: number;
        currentStep: string | null;
        capabilities: string[];
    }> {
        const progress = pathService.getProgressSummary(userId);
        const pathData = pathService.getPathForUser(userId);
        const vaultItems = vaultService.getAll(userId);
        const currentStep = pathData.find(s => s.status === 'in_progress' || s.status === 'unlocked');

        return {
            ready: true,
            pathProgress: progress.percentage,
            vaultCount: vaultItems.length,
            currentStep: currentStep ? currentStep.title : null,
            capabilities: ['chat', 'search', 'map', 'voice'],
        };
    },

    // Save conversation summary to Vault
    async saveConversation(userId: string, messages: AssistantMessage[]): Promise<string> {
        if (messages.length < 2) return '';

        const summary = messages
            .slice(-10)
            .map(m => `${m.role}: ${m.content.substring(0, 200)}`)
            .join('\n');

        const item = vaultService.save({
            userId,
            type: 'text',
            title: `Coach Kay Session - ${new Date().toLocaleDateString()}`,
            content: summary,
            moduleId: 'assistant',
            moduleName: 'Coach Kay',
            tags: ['conversation', 'coaching'],
            metadata: { messageCount: messages.length },
        });

        return item.id;
    },
};
