import { labPrompts } from './labPrompts';
import { LAB_SYSTEM_PROMPTS } from './systemPrompts';

export { LAB_SYSTEM_PROMPTS };

export type LabKey = keyof typeof labPrompts;
export type SystemLabKey = keyof typeof LAB_SYSTEM_PROMPTS;

export const PromptRegistry = {
    labs: labPrompts,
    system: LAB_SYSTEM_PROMPTS,

    getLabPrompt(key: LabKey): string {
        return this.labs[key];
    },

    getSystemPrompt(key: SystemLabKey): string {
        return this.system[key];
    },

    listLabs(): LabKey[] {
        return Object.keys(this.labs) as LabKey[];
    },

    listSystemLabs(): SystemLabKey[] {
        return Object.keys(this.system) as SystemLabKey[];
    }
};
