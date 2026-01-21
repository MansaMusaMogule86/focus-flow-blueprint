/**
 * Lab Executor Service
 * 
 * Thin execution layer between Shell components and geminiService.
 * Shells remain dumb — this layer handles prompt injection and routing.
 */

import { geminiService } from './geminiService';
import { getLabConfig, LabConfig } from '../labs/LabConfig';
import { LAB_SYSTEM_PROMPTS } from '../labs/PromptRegistry';

export interface LabExecutionResult {
    success: boolean;
    output: string;
    outputType: 'text' | 'image' | 'video' | 'error';
    metadata?: {
        aspectRatio?: string;
        duration?: number;
        videoUrl?: string;
    };
}

export interface LabExecutionOptions {
    aspectRatio?: string;
    imageSize?: string;
}

/**
 * Execute a Lab with the given user input.
 * Handles prompt injection and routes to the correct geminiService method.
 * 
 * @param labId - The Lab identifier
 * @param userInput - User's input text
 * @param options - Optional parameters for image/video generation
 * @returns Execution result with output and metadata
 */
export async function executeLab(
    labId: string,
    userInput: string,
    options: LabExecutionOptions = {}
): Promise<LabExecutionResult> {
    const config = getLabConfig(labId);

    if (!config) {
        return {
            success: false,
            output: `Unknown Lab: ${labId}`,
            outputType: 'error'
        };
    }

    const systemPrompt = LAB_SYSTEM_PROMPTS[config.promptKey];

    try {
        switch (config.mode) {
            case 'text':
                return await executeTextLab(config, systemPrompt, userInput);

            case 'image':
                return await executeImageLab(config, systemPrompt, userInput, options);

            case 'video':
                return await executeVideoLab(config, systemPrompt, userInput, options);

            case 'live':
                // Live mode is handled by liveApiService separately
                return {
                    success: true,
                    output: 'Live session requires voice interface. Use the Live Shell component.',
                    outputType: 'text'
                };

            case 'external':
                return await executeExternalLab(config, systemPrompt, userInput);

            default:
                return {
                    success: false,
                    output: `Unsupported Lab mode: ${config.mode}`,
                    outputType: 'error'
                };
        }
    } catch (error: any) {
        return {
            success: false,
            output: `Execution failed: ${error?.message || 'Unknown error'}`,
            outputType: 'error'
        };
    }
}

/**
 * Execute a text-mode Lab
 */
async function executeTextLab(
    config: LabConfig,
    systemPrompt: string | undefined,
    userInput: string
): Promise<LabExecutionResult> {
    let output: string;

    // Route to appropriate model based on Lab
    switch (config.id) {
        case 'opal':
            // Opal uses Flash-Lite for efficiency
            output = await geminiService.flashLiteChat(userInput);
            break;

        case 'stitch':
        case 'whisk':
        case 'notebooklm':
        case 'project-mariner':
        case 'help-me-script':
        case 'vids-studio':
            // Use system prompt for persona-based labs
            if (systemPrompt) {
                output = await geminiService.chatWithSystemPrompt(systemPrompt, userInput);
            } else {
                output = await geminiService.quickChat(userInput);
            }
            break;

        default:
            output = await geminiService.quickChat(userInput);
    }

    return {
        success: true,
        output,
        outputType: 'text'
    };
}

/**
 * Execute an image-mode Lab
 */
async function executeImageLab(
    config: LabConfig,
    systemPrompt: string | undefined,
    userInput: string,
    options: LabExecutionOptions
): Promise<LabExecutionResult> {
    // Build the image prompt with optional system enhancement
    const imagePrompt = systemPrompt
        ? `${systemPrompt}\n\nUser request: ${userInput}`
        : userInput;

    const aspectRatio = options.aspectRatio || '1:1';
    const imageSize = options.imageSize || '1K';

    const imageResult = await geminiService.generateImage(imagePrompt, aspectRatio, imageSize);

    if (imageResult) {
        return {
            success: true,
            output: imageResult,
            outputType: 'image',
            metadata: { aspectRatio }
        };
    } else {
        return {
            success: false,
            output: 'Image generation failed. Try a simpler prompt or different aspect ratio.',
            outputType: 'error'
        };
    }
}

/**
 * Execute a video-mode Lab
 */
async function executeVideoLab(
    config: LabConfig,
    systemPrompt: string | undefined,
    userInput: string,
    options: LabExecutionOptions
): Promise<LabExecutionResult> {
    const aspectRatio = (options.aspectRatio || '16:9') as '16:9' | '9:16';

    // Build prompt with storyboard guidance if system prompt exists
    const videoPrompt = systemPrompt
        ? `${systemPrompt}\n\nUser direction: ${userInput}`
        : userInput;

    const videoResult = await geminiService.generateVideo(videoPrompt, aspectRatio);

    return {
        success: true,
        output: 'Video generated successfully',
        outputType: 'video',
        metadata: {
            aspectRatio,
            videoUrl: videoResult.url
        }
    };
}

/**
 * Execute an external-mode Lab (prompt assistance + redirect)
 */
async function executeExternalLab(
    config: LabConfig,
    systemPrompt: string | undefined,
    userInput: string
): Promise<LabExecutionResult> {
    // Use system prompt to help craft the external tool prompt
    let optimizedPrompt = userInput;

    if (systemPrompt) {
        const response = await geminiService.chatWithSystemPrompt(
            systemPrompt,
            `Help me craft a better prompt for this request: "${userInput}". Return only the optimized prompt.`
        );
        optimizedPrompt = response;
    }

    const output = `**Optimized Prompt for ${config.title}:**

${optimizedPrompt}

---

**Next Step:** [Open ${config.title}](${config.externalUrl})

_Copy the prompt above and paste it in the external tool._`;

    return {
        success: true,
        output,
        outputType: 'text'
    };
}
