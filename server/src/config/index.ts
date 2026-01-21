import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
    PORT: z.string().default('3001'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('7d'),
    DATABASE_PATH: z.string().default('./data/platform.json'),
    GOOGLE_AI_API_KEY: z.string().min(1),
    OPENAI_API_KEY: z.string().optional(),
    RATE_LIMIT_WINDOW_MS: z.string().default('60000'),
    RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const config = {
    port: parseInt(parsed.data.PORT, 10),
    nodeEnv: parsed.data.NODE_ENV,
    isDev: parsed.data.NODE_ENV === 'development',
    isProd: parsed.data.NODE_ENV === 'production',
    jwt: {
        secret: parsed.data.JWT_SECRET,
        expiresIn: parsed.data.JWT_EXPIRES_IN,
    },
    database: {
        path: parsed.data.DATABASE_PATH,
    },
    ai: {
        googleApiKey: parsed.data.GOOGLE_AI_API_KEY,
        openaiApiKey: parsed.data.OPENAI_API_KEY,
    },
    rateLimit: {
        windowMs: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS, 10),
        maxRequests: parseInt(parsed.data.RATE_LIMIT_MAX_REQUESTS, 10),
    },
} as const;

export type Config = typeof config;
