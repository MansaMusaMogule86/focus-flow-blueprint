import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

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
        tools: ['Stitch'],
        moduleId: 'stitch',
        vaultType: 'text',
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

export interface UserPathProgress {
    id: string;
    userId: string;
    stepId: string;
    status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
    completedAt?: string;
    vaultItemId?: string; // Link to Vault item that completed this step
    createdAt: string;
    updatedAt: string;
}

// Database path
const getDbPath = () => path.resolve(process.cwd(), 'data/path_progress.json');

export const pathService = {
    // Get all steps with user progress
    getPathForUser(userId: string): Array<typeof PATH_STEPS[0] & { status: string; completedAt?: string; vaultItemId?: string }> {
        const progress = this.getUserProgress(userId);

        return PATH_STEPS.map((step, index) => {
            const userStep = progress.find(p => p.stepId === step.id);

            if (userStep) {
                return {
                    ...step,
                    status: userStep.status,
                    completedAt: userStep.completedAt,
                    vaultItemId: userStep.vaultItemId,
                };
            }

            // Step 1 always unlocked by default
            if (index === 0) {
                this.initStep(userId, step.id, 'unlocked');
                return { ...step, status: 'unlocked' };
            }

            // Check if previous step is completed
            const prevStep = PATH_STEPS[index - 1];
            const prevProgress = progress.find(p => p.stepId === prevStep.id);

            if (prevProgress?.status === 'completed') {
                this.initStep(userId, step.id, 'unlocked');
                return { ...step, status: 'unlocked' };
            }

            return { ...step, status: 'locked' };
        });
    },

    // Get raw user progress
    getUserProgress(userId: string): UserPathProgress[] {
        const db = this.getProgressDb();
        return db.filter(p => p.userId === userId);
    },

    // Initialize a step for user
    initStep(userId: string, stepId: string, status: 'locked' | 'unlocked'): void {
        const db = this.getProgressDb();
        const existing = db.find(p => p.userId === userId && p.stepId === stepId);

        if (!existing) {
            const now = new Date().toISOString();
            db.push({
                id: uuidv4(),
                userId,
                stepId,
                status,
                createdAt: now,
                updatedAt: now,
            });
            this.saveProgressDb(db);
        }
    },

    // Start a step (mark as in_progress)
    startStep(userId: string, stepId: string): boolean {
        const db = this.getProgressDb();
        let stepRecord = db.find(p => p.userId === userId && p.stepId === stepId);

        // If no record exists and this is step 1, create it
        if (!stepRecord && stepId === 'step-1') {
            const now = new Date().toISOString();
            stepRecord = {
                id: uuidv4(),
                userId,
                stepId,
                status: 'in_progress',
                createdAt: now,
                updatedAt: now,
            };
            db.push(stepRecord);
            this.saveProgressDb(db);
            return true;
        }

        if (stepRecord && (stepRecord.status === 'unlocked' || stepRecord.status === 'in_progress')) {
            stepRecord.status = 'in_progress';
            stepRecord.updatedAt = new Date().toISOString();
            this.saveProgressDb(db);
            return true;
        }

        return false;
    },

    // Complete a step (requires vaultItemId for Vault integration)
    completeStep(userId: string, stepId: string, vaultItemId?: string): { success: boolean; nextStep?: string; error?: string } {
        const db = this.getProgressDb();
        const stepIndex = db.findIndex(p => p.userId === userId && p.stepId === stepId);

        // Verify step can be completed (must be in_progress or unlocked)
        if (stepIndex !== -1) {
            const current = db[stepIndex];
            if (current.status === 'locked') {
                return { success: false, error: 'Cannot complete a locked step' };
            }
            if (current.status === 'completed') {
                return { success: false, error: 'Step already completed' };
            }

            // Mark completed
            db[stepIndex].status = 'completed';
            db[stepIndex].completedAt = new Date().toISOString();
            db[stepIndex].updatedAt = new Date().toISOString();
            if (vaultItemId) {
                db[stepIndex].vaultItemId = vaultItemId;
            }
        } else {
            // Create completed record
            const now = new Date().toISOString();
            db.push({
                id: uuidv4(),
                userId,
                stepId,
                status: 'completed',
                completedAt: now,
                vaultItemId,
                createdAt: now,
                updatedAt: now,
            });
        }

        this.saveProgressDb(db);

        // Unlock next step
        const currentStepIndex = PATH_STEPS.findIndex(s => s.id === stepId);
        if (currentStepIndex < PATH_STEPS.length - 1) {
            const nextStep = PATH_STEPS[currentStepIndex + 1];
            this.initStep(userId, nextStep.id, 'unlocked');
            return { success: true, nextStep: nextStep.id };
        }

        return { success: true };
    },

    // Get progress summary
    getProgressSummary(userId: string): { completed: number; total: number; percentage: number; currentStepId?: string } {
        const path = this.getPathForUser(userId);
        const completed = path.filter(s => s.status === 'completed').length;
        const total = path.length;
        const currentStep = path.find(s => s.status === 'in_progress' || s.status === 'unlocked');

        return {
            completed,
            total,
            percentage: Math.round((completed / total) * 100),
            currentStepId: currentStep?.id,
        };
    },

    // Database helpers
    getProgressDb(): UserPathProgress[] {
        const dbPath = getDbPath();
        const dir = path.dirname(dbPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, '[]');
            return [];
        }

        try {
            return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        } catch {
            return [];
        }
    },

    saveProgressDb(data: UserPathProgress[]): void {
        const dbPath = getDbPath();
        const dir = path.dirname(dbPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    },
};
