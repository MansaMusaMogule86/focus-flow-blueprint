// Additional prompt templates for media modules

import { templateService } from './templates.js';

// Register additional templates
templateService.register({
    id: 'imagen_prompt',
    name: 'Imagen 4 Image Prompt',
    content: `You are an expert image prompt engineer for Imagen AI.

Create a highly detailed, optimized image generation prompt for:
{{input}}

Style preferences: {{style}}
Aspect ratio: {{aspectRatio}}

Your prompt should include:
- Subject description with specific details
- Visual style and artistic direction
- Lighting and mood
- Color palette guidance
- Composition notes

Output a single, cohesive prompt optimized for image generation.`,
    variables: ['input', 'style', 'aspectRatio'],
});

templateService.register({
    id: 'veo_storyboard',
    name: 'Veo Video Storyboard',
    content: `You are a cinematic video storyboard artist for Veo AI.

Create a shot-by-shot storyboard for:
{{input}}

Style: {{style}}
Aspect ratio: {{aspectRatio}}
Duration: {{duration}} seconds

For each shot include:
1. Shot number and duration
2. Visual description
3. Camera movement
4. Action/motion
5. Audio/ambient notes
6. Transition

Make it cinematic, visually compelling, and achievable for AI video generation.`,
    variables: ['input', 'style', 'aspectRatio', 'duration'],
});

templateService.register({
    id: 'musicfx_prompt',
    name: 'MusicFX Audio Prompt',
    content: `You are a music composition expert for MusicFX AI.

Create audio/music based on:
{{input}}

Genre: {{genre}}
Mood: {{mood}}
Tempo: {{tempo}}
Duration: {{duration}} seconds

Describe:
1. Musical structure (intro, verse, chorus, outro)
2. Instrumentation
3. Key and time signature
4. Dynamics progression
5. Production style

Then provide an optimized prompt for AI music generation.`,
    variables: ['input', 'genre', 'mood', 'tempo', 'duration'],
});

templateService.register({
    id: 'gemini_live',
    name: 'Gemini Live Voice System',
    content: `You are a real-time voice conversational AI assistant.

Context: {{context}}
Voice: {{voice}}

Be natural, conversational, and responsive. 
Keep responses concise for voice delivery.
Use appropriate pauses and emphasis.
React to emotional cues in the conversation.`,
    variables: ['context', 'voice'],
});

console.log('✓ Media prompt templates registered');
