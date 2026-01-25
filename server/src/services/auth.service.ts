import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { dbHelpers, User } from '../db/index.js';
import { config } from '../config/index.js';
import { HttpError } from '../middleware/error.js';

export interface RegisterInput {
    email: string;
    password: string;
    name: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: Omit<User, 'password_hash'>;
}

export const authService = {
    async register(input: RegisterInput): Promise<AuthResponse> {
        const existing = await dbHelpers.findUser(input.email);
        if (existing) {
            throw new HttpError(400, 'Email already registered');
        }

        const id = uuidv4();
        const passwordHash = await bcrypt.hash(input.password, 12);
        const now = new Date().toISOString();

        const user: User = {
            id,
            email: input.email,
            password_hash: passwordHash,
            name: input.name,
            role: 'user',
            created_at: now,
            updated_at: now,
        };

        await dbHelpers.createUser(user);
        const token = this.generateToken(user);

        const { password_hash, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    },

    async login(input: LoginInput): Promise<AuthResponse> {
        const user = await dbHelpers.findUser(input.email);
        if (!user) {
            throw new HttpError(401, 'Invalid credentials');
        }

        const isValid = await bcrypt.compare(input.password, user.password_hash);
        if (!isValid) {
            throw new HttpError(401, 'Invalid credentials');
        }

        const token = this.generateToken(user);
        const { password_hash, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    },

    generateToken(user: User): string {
        const payload = { userId: user.id, email: user.email, role: user.role };
        const options: SignOptions = { expiresIn: '7d' };
        return jwt.sign(payload, config.jwt.secret, options);
    },

    async getUser(userId: string): Promise<Omit<User, 'password_hash'> | null> {
        const user = await dbHelpers.findUserById(userId);
        if (!user) return null;
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },

    async updateUser(userId: string, data: Partial<Pick<User, 'name' | 'email'>>): Promise<void> {
        await dbHelpers.updateUser(userId, { ...data, updated_at: new Date().toISOString() });
    },
};
