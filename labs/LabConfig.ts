/**
 * Lab Configuration Registry
 * 
 * Single source of truth for all Lab metadata.
 * Each Lab has a distinct interaction mode that defines its UX.
 */

export type LabMode = 'text' | 'image' | 'video' | 'live' | 'external';
export type OutputFormat = 'text' | 'markdown' | 'image' | 'video';

export interface LabConfig {
    /** Unique identifier (lowercase, kebab-case safe) */
    id: string;

    /** Display name shown in UI */
    title: string;

    /** FontAwesome icon class (without fa-solid prefix) */
    icon: string;

    /** Short description for the Lab card */
    description: string;

    /** Interaction mode determines which shell component renders */
    mode: LabMode;

    /** TailwindCSS color name for theming */
    color: string;

    /** Button label on the Lab card */
    actionLabel: string;

    /** Key to look up system prompt in LAB_SYSTEM_PROMPTS */
    promptKey: string;

    /** Placeholder text for input field */
    placeholder: string;

    /** External URL for redirect-based labs */
    externalUrl?: string;

    /** Available aspect ratios for image/video labs */
    aspectRatios?: string[];

    /** How the output should be rendered */
    outputFormat: OutputFormat;
}

/**
 * All Lab configurations
 * Order determines display order in the grid
 */
export const LAB_CONFIGS: LabConfig[] = [
    // === TEXT MODE LABS ===
    {
        id: 'opal',
        title: 'Opal',
        icon: 'fa-feather',
        description: 'Optimized lite-weight core (Gemini 2.5 Flash-Lite) for high-volume reasoning efficiency.',
        mode: 'text',
        color: 'amber',
        actionLabel: 'Streamline',
        promptKey: 'Opal',
        placeholder: 'Enter a task for lightweight reasoning...',
        outputFormat: 'markdown'
    },
    {
        id: 'stitch',
        title: 'Stitch',
        icon: 'fa-bolt-lightning',
        description: 'Cutting-edge high-speed multimodal intelligence (Gemini 3 Flash) for real-time interaction.',
        mode: 'text',
        color: 'indigo',
        actionLabel: 'Initialize',
        promptKey: 'Stitch',
        placeholder: 'Describe a real-time task requiring speed and precision...',
        outputFormat: 'markdown'
    },
    {
        id: 'whisk',
        title: 'Whisk',
        icon: 'fa-wind',
        description: 'Versatile flash intelligence (Gemini 2.5 Flash) for seamless automation and rapid iteration.',
        mode: 'text',
        color: 'emerald',
        actionLabel: 'Execute',
        promptKey: 'Whisk',
        placeholder: 'Describe a workflow to automate or iterate on...',
        outputFormat: 'markdown'
    },
    {
        id: 'notebooklm',
        title: 'NotebookLM',
        icon: 'fa-book-open',
        description: 'Synthesize research and cohort notes into high-context intelligence.',
        mode: 'text',
        color: 'indigo',
        actionLabel: 'Load Context',
        promptKey: 'NotebookLM',
        placeholder: 'Paste research notes or context to synthesize...',
        outputFormat: 'markdown'
    },
    {
        id: 'project-mariner',
        title: 'Project Mariner',
        icon: 'fa-compass',
        description: 'Autonomous web agent for conducting deep market and legacy research.',
        mode: 'text',
        color: 'emerald',
        actionLabel: 'Deploy Agent',
        promptKey: 'Project Mariner',
        placeholder: 'Define a research objective or market question...',
        outputFormat: 'markdown'
    },
    {
        id: 'help-me-script',
        title: 'Help Me Script',
        icon: 'fa-pen-fancy',
        description: 'Craft boundary-setting scripts and automated responses for your routine.',
        mode: 'text',
        color: 'purple',
        actionLabel: 'Draft Logic',
        promptKey: 'Help Me Script',
        placeholder: 'Describe a situation requiring a professional script...',
        outputFormat: 'markdown'
    },
    {
        id: 'vids-studio',
        title: 'Vids Studio',
        icon: 'fa-clapperboard',
        description: 'Narrative-driven video creation with built-in AI storyboard intelligence.',
        mode: 'text',
        color: 'rose',
        actionLabel: 'Create Project',
        promptKey: 'Vids Studio',
        placeholder: 'Describe your video concept or narrative...',
        outputFormat: 'markdown'
    },

    // === IMAGE MODE LABS ===
    {
        id: 'nano-banana',
        title: 'Nano Banana',
        icon: 'fa-image',
        description: 'Ultra-fast visual synthesis core (Gemini 2.5 Flash Image) for rapid asset prototyping.',
        mode: 'image',
        color: 'yellow',
        actionLabel: 'Synthesize',
        promptKey: 'Nano Banana',
        placeholder: 'Describe the image you want to create...',
        aspectRatios: ['1:1', '16:9', '9:16'],
        outputFormat: 'image'
    },
    {
        id: 'imagen-4',
        title: 'Imagen 4',
        icon: 'fa-wand-magic-sparkles',
        description: 'State-of-the-art cinematic image synthesis for your visual identity.',
        mode: 'image',
        color: 'sky',
        actionLabel: 'Generate',
        promptKey: 'Imagen 4',
        placeholder: 'Describe a cinematic, high-fidelity image...',
        aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
        outputFormat: 'image'
    },

    // === VIDEO MODE LABS ===
    {
        id: 'veo-3',
        title: 'Veo 3.1',
        icon: 'fa-film',
        description: 'High-fidelity cinematic story generation for high-impact personal narratives.',
        mode: 'video',
        color: 'pink',
        actionLabel: 'Begin Render',
        promptKey: 'Veo 3.1',
        placeholder: 'Describe your video scene or storyboard...',
        aspectRatios: ['16:9', '9:16'],
        outputFormat: 'video'
    },

    // === LIVE MODE LABS ===
    {
        id: 'gemini-live',
        title: 'Gemini Live',
        icon: 'fa-microphone-lines',
        description: 'Engage in low-latency, high-fidelity neural voice conversations.',
        mode: 'live',
        color: 'blue',
        actionLabel: 'Start Session',
        promptKey: 'Gemini Live',
        placeholder: 'Begin speaking when the session starts...',
        outputFormat: 'text'
    },

    // === EXTERNAL MODE LABS ===
    {
        id: 'musicfx',
        title: 'MusicFX',
        icon: 'fa-music',
        description: 'Generate high-quality ambient soundtracks for your workspace and content.',
        mode: 'external',
        color: 'orange',
        actionLabel: 'Compose Audio',
        promptKey: 'MusicFX',
        placeholder: 'Describe the mood, tempo, and style of your soundtrack...',
        externalUrl: 'https://aitestkitchen.withgoogle.com/tools/music-fx',
        outputFormat: 'text'
    }
];

/**
 * Get a Lab config by its ID
 */
export function getLabConfig(labId: string): LabConfig | undefined {
    return LAB_CONFIGS.find(lab => lab.id === labId);
}

/**
 * Get all Labs of a specific mode
 */
export function getLabsByMode(mode: LabMode): LabConfig[] {
    return LAB_CONFIGS.filter(lab => lab.mode === mode);
}
