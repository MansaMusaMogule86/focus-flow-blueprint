import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const ONBOARDING_DB_PATH = path.resolve(process.cwd(), 'data/onboarding.json');

export interface OnboardingData {
    id: string;
    userId: string;
    completed: boolean;
    step: 'welcome' | 'intent' | 'commit' | 'done';
    answers: {
        goals?: string[];
        timeline?: string;
        experience?: string;
        commitment?: boolean;
    };
    createdAt: string;
    completedAt?: string;
}

export const onboardingService = {
    // Get onboarding status for user
    getStatus(userId: string): OnboardingData | null {
        const db = this.getDb();
        return db.find(o => o.userId === userId) || null;
    },

    // Initialize onboarding for new user
    initOnboarding(userId: string): OnboardingData {
        const db = this.getDb();
        const existing = db.find(o => o.userId === userId);

        if (existing) return existing;

        const record: OnboardingData = {
            id: uuidv4(),
            userId,
            completed: false,
            step: 'welcome',
            answers: {},
            createdAt: new Date().toISOString(),
        };

        db.push(record);
        this.saveDb(db);
        return record;
    },

    // Update onboarding step
    updateStep(userId: string, step: OnboardingData['step'], answers?: Partial<OnboardingData['answers']>): OnboardingData | null {
        const db = this.getDb();
        const index = db.findIndex(o => o.userId === userId);

        if (index === -1) return null;

        db[index].step = step;
        if (answers) {
            db[index].answers = { ...db[index].answers, ...answers };
        }

        if (step === 'done') {
            db[index].completed = true;
            db[index].completedAt = new Date().toISOString();
        }

        this.saveDb(db);
        return db[index];
    },

    // Check if onboarding is required
    isOnboardingRequired(userId: string): boolean {
        const record = this.getStatus(userId);
        return !record || !record.completed;
    },

    // Database helpers
    getDb(): OnboardingData[] {
        if (!fs.existsSync(ONBOARDING_DB_PATH)) {
            const dir = path.dirname(ONBOARDING_DB_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(ONBOARDING_DB_PATH, '[]');
            return [];
        }
        try {
            return JSON.parse(fs.readFileSync(ONBOARDING_DB_PATH, 'utf-8'));
        } catch {
            return [];
        }
    },

    saveDb(data: OnboardingData[]): void {
        fs.writeFileSync(ONBOARDING_DB_PATH, JSON.stringify(data, null, 2));
    },
};
