import prisma from '../db/prisma.js';

// The 8 Canonical PATH Steps
export const PATH_STEPS = [
    {
        id: 'step-1',
        stepNumber: 1,
        title: 'The Mirror',
        purpose: 'See yourself clearly. Define your current reality and baseline.',
        description: 'Reflect on where you are right now. Capture your strengths, weaknesses, and starting point.',
        tools: ['Opal'],
        moduleId: 'opal',
        vaultType: 'text',
    },
    {
        id: 'step-2',
        stepNumber: 2,
        title: 'The Vision',
        purpose: 'Define your future self. Set your transformation goals.',
        description: 'Envision the person you want to become. Write your goals and aspirations.',
        tools: ['Imagen 4'],
        moduleId: 'imagen4',
        vaultType: 'image',
    },
    {
        id: 'step-3',
        stepNumber: 3,
        title: 'The Routine',
        purpose: 'Design daily habits that compound into transformation.',
        description: 'Build the systems and routines that will carry you to your vision.',
        tools: ['Whisk'],
        moduleId: 'whisk',
        vaultType: 'text',
    },
    {
        id: 'step-4',
        stepNumber: 4,
        title: 'The Story',
        purpose: 'Craft your personal narrative and brand message.',
        description: 'Write the story of your transformation. Define your voice and message.',
        tools: ['Help Me Script'],
        moduleId: 'helpme-script',
        vaultType: 'script',
    },
    {
        id: 'step-5',
        stepNumber: 5,
        title: 'The Language',
        purpose: 'Master communication and create compelling content.',
        description: 'Learn to speak your truth. Create content that resonates.',
        tools: ['NotebookLM', 'Mariner'],
        moduleId: 'notebooklm',
        vaultType: 'text',
    },
    {
        id: 'step-6',
        stepNumber: 6,
        title: 'The Wisdom',
        purpose: 'Research, learn, and synthesize knowledge.',
        description: 'Deepen your expertise. Build a knowledge base that powers your growth.',
        tools: ['Mariner', 'NotebookLM'],
        moduleId: 'mariner',
        vaultType: 'report',
    },
    {
        id: 'step-7',
        stepNumber: 7,
        title: 'The Home Base',
        purpose: 'Build your digital presence and visual identity.',
        description: 'Create your visual brand. Generate images and assets that represent you.',
        tools: ['Nano Banana', 'Vids Studio'],
        moduleId: 'nano-banana',
        vaultType: 'image',
    },
    {
        id: 'step-8',
        stepNumber: 8,
        title: 'The Clone',
        purpose: 'Activate your digital twin powered by all your Vault data.',
        description: 'Your Clone learns everything you saved. It becomes your AI extension.',
        tools: ['Clone', 'Vault'],
        moduleId: 'clone',
        vaultType: 'artifact',
    },
];

export const pathService = {
    // Get all steps with user progress
    async getPathForUser(userId: string) {
        const progress = await prisma.pathProgress.findMany({
            where: { userId },
        });

        // Loop through all canonical steps and merge with user progress
        const fullPath = [];

        for (let i = 0; i < PATH_STEPS.length; i++) {
            const step = PATH_STEPS[i];
            const userStep = progress.find(p => p.stepId === step.id);

            // Found progress record
            if (userStep) {
                fullPath.push({
                    ...step,
                    status: userStep.status,
                    completedAt: userStep.completedAt?.toISOString(),
                    vaultItemId: userStep.vaultItemId,
                });
                continue;
            }

            // Step 1 always unlocked by default if not exists
            if (i === 0) {
                await this.initStep(userId, step.id, 'unlocked');
                fullPath.push({ ...step, status: 'unlocked' });
                continue;
            }

            // Check if previous step is completed
            const prevStep = fullPath[i - 1];
            if (prevStep && prevStep.status === 'completed') {
                await this.initStep(userId, step.id, 'unlocked');
                fullPath.push({ ...step, status: 'unlocked' });
                continue;
            }

            // Otherwise locked
            fullPath.push({ ...step, status: 'locked' });
        }

        return fullPath;
    },

    // Initialize a step for user
    async initStep(userId: string, stepId: string, status: 'locked' | 'unlocked') {
        const existing = await prisma.pathProgress.findUnique({
            where: {
                userId_stepId: {
                    userId,
                    stepId,
                },
            },
        });

        if (!existing) {
            await prisma.pathProgress.create({
                data: {
                    userId,
                    stepId,
                    status,
                },
            });
        }
    },

    // Start a step (mark as in_progress)
    async startStep(userId: string, stepId: string): Promise<boolean> {
        // If it's step 1 and doesn't exist, create it
        if (stepId === 'step-1') {
            const existing = await prisma.pathProgress.findUnique({
                where: { userId_stepId: { userId, stepId } }
            });
            if (!existing) {
                await prisma.pathProgress.create({
                    data: {
                        userId,
                        stepId,
                        status: 'in_progress'
                    }
                });
                return true;
            }
        }

        const stepRecord = await prisma.pathProgress.findUnique({
            where: {
                userId_stepId: {
                    userId,
                    stepId,
                },
            },
        });

        if (stepRecord && (stepRecord.status === 'unlocked' || stepRecord.status === 'in_progress')) {
            await prisma.pathProgress.update({
                where: { id: stepRecord.id },
                data: { status: 'in_progress' },
            });
            return true;
        }

        return false;
    },

    // Complete a step (requires vaultItemId for Vault integration)
    async completeStep(userId: string, stepId: string, vaultItemId?: string): Promise<{ success: boolean; nextStep?: string; error?: string }> {
        const stepRecord = await prisma.pathProgress.findUnique({
            where: {
                userId_stepId: {
                    userId,
                    stepId,
                },
            },
        });

        // Create if missing (edge case) or update
        if (stepRecord) {
            if (stepRecord.status === 'locked') {
                return { success: false, error: 'Cannot complete a locked step' };
            }
            if (stepRecord.status === 'completed') {
                return { success: false, error: 'Step already completed' };
            }

            await prisma.pathProgress.update({
                where: { id: stepRecord.id },
                data: {
                    status: 'completed',
                    completedAt: new Date(),
                    vaultItemId: vaultItemId || null,
                },
            });
        } else {
            // Implicitly allow completion if it didn't exist (e.g. dev testing)
            await prisma.pathProgress.create({
                data: {
                    userId,
                    stepId,
                    status: 'completed',
                    completedAt: new Date(),
                    vaultItemId: vaultItemId || null,
                },
            });
        }

        // Unlock next step
        const currentStepIndex = PATH_STEPS.findIndex(s => s.id === stepId);
        if (currentStepIndex < PATH_STEPS.length - 1) {
            const nextStep = PATH_STEPS[currentStepIndex + 1];
            await this.initStep(userId, nextStep.id, 'unlocked');
            return { success: true, nextStep: nextStep.id };
        }

        return { success: true };
    },

    // Get progress summary
    async getProgressSummary(userId: string) {
        const completed = await prisma.pathProgress.count({
            where: {
                userId,
                status: 'completed',
            },
        });

        const total = PATH_STEPS.length;

        // Find current step (first in_progress or unlocked)
        // We can't rely just on DB sort, so we check the canonical order
        // But for summary, querying the DB is faster
        const currentStepRecord = await prisma.pathProgress.findFirst({
            where: {
                userId,
                status: { in: ['in_progress', 'unlocked'] },
            },
            // Ideally we would verify order with PATH_STEPS logic, but this is a good approximation
        });

        return {
            completed,
            total,
            percentage: Math.round((completed / total) * 100),
            currentStepId: currentStepRecord?.stepId,
        };
    },
};
