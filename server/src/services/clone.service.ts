import { vaultService } from './vault.service.js';
import { aiProvider } from '../ai/provider.js';

export interface CloneResponse {
    message: string;
    confidence: number;
    sourcesUsed: number;
    metadata: {
        vaultItemsCount: number;
        contextLength: number;
    };
}

export const cloneService = {
    async talk(userId: string, userMessage: string): Promise<CloneResponse> {
        const vaultItems = vaultService.getAll(userId);

        if (vaultItems.length === 0) {
            return {
                message: "I don't have enough memory yet. Save some content to your Vault first, and I'll learn from it to become your digital twin.",
                confidence: 0,
                sourcesUsed: 0,
                metadata: {
                    vaultItemsCount: 0,
                    contextLength: 0,
                },
            };
        }

        const memoryContext = this.buildMemoryContext(vaultItems);

        const systemPrompt = `You are a DIGITAL TWIN - an AI clone that speaks exactly like the user based on their saved content.

CORE RULES:
1. You ARE the user's digital twin. Speak in first person AS them.
2. Your knowledge comes ONLY from the Vault items below.
3. If asked something not in the Vault, say "I don't have that in my memory yet."
4. Mirror the user's writing style, vocabulary, and tone from their saved content.
5. Be confident about things in your memory, uncertain about things not in it.

YOUR MEMORY (from Vault):
${memoryContext}

---

Respond as their digital twin.`;

        const response = await aiProvider.generateText(userMessage, {
            systemPrompt,
            temperature: 0.7,
            maxTokens: 1024,
        });

        return {
            message: response,
            confidence: Math.min(vaultItems.length * 10, 100),
            sourcesUsed: vaultItems.length,
            metadata: {
                vaultItemsCount: vaultItems.length,
                contextLength: memoryContext.length,
            },
        };
    },

    // Streaming version for real-time responses
    async *talkStream(userId: string, userMessage: string): AsyncGenerator<string> {
        const vaultItems = vaultService.getAll(userId);

        if (vaultItems.length === 0) {
            yield "I don't have enough memory yet. Save some content to your Vault first.";
            return;
        }

        const memoryContext = this.buildMemoryContext(vaultItems);

        const systemPrompt = `You are a DIGITAL TWIN. Speak as the user based on their Vault:
${memoryContext.slice(0, 4000)}`;

        // Stream from AI provider
        const fullResponse = await aiProvider.generateText(userMessage, {
            systemPrompt,
            temperature: 0.7,
            maxTokens: 1024,
        });

        // Simulate streaming by yielding chunks
        const words = fullResponse.split(' ');
        const chunkSize = 3;

        for (let i = 0; i < words.length; i += chunkSize) {
            const chunk = words.slice(i, i + chunkSize).join(' ');
            yield chunk + ' ';
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    },

    buildMemoryContext(vaultItems: any[]): string {
        const grouped: Record<string, any[]> = {};

        vaultItems.forEach(item => {
            if (!grouped[item.type]) grouped[item.type] = [];
            grouped[item.type].push(item);
        });

        let context = '';

        Object.entries(grouped).forEach(([type, items]) => {
            context += `\n=== ${type.toUpperCase()} (${items.length}) ===\n`;

            items.slice(0, 15).forEach((item, i) => {
                context += `\n[${i + 1}] "${item.title}"\n`;
                const content = item.content.length > 600 ? item.content.slice(0, 600) + '...' : item.content;
                context += content + '\n';
            });
        });

        context += '\n=== PATTERNS ===\n';
        context += this.extractPatterns(vaultItems);

        return context;
    },

    extractPatterns(vaultItems: any[]): string {
        const patterns: string[] = [];

        const moduleUsage: Record<string, number> = {};
        vaultItems.forEach(item => {
            moduleUsage[item.moduleName] = (moduleUsage[item.moduleName] || 0) + 1;
        });

        const topModules = Object.entries(moduleUsage)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, count]) => `${name} (${count})`);

        if (topModules.length > 0) {
            patterns.push(`Most used: ${topModules.join(', ')}`);
        }

        const allTags = vaultItems.flatMap(item => item.tags || []);
        const tagCounts: Record<string, number> = {};
        allTags.forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });

        const topTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tag]) => tag);

        if (topTags.length > 0) {
            patterns.push(`Themes: ${topTags.join(', ')}`);
        }

        patterns.push(`Total memories: ${vaultItems.length}`);

        return patterns.join('\n');
    },
};
