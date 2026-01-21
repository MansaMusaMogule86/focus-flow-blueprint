import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { dbHelpers } from '../db/index.js';

const MEDIA_DIR = path.resolve(process.cwd(), 'data/media');

// Ensure media directories exist
const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

ensureDir(path.join(MEDIA_DIR, 'images'));
ensureDir(path.join(MEDIA_DIR, 'videos'));
ensureDir(path.join(MEDIA_DIR, 'audio'));

export interface MediaMetadata {
    prompt?: string;
    style?: string;
    aspectRatio?: string;
    duration?: number;
    moduleId?: string;
    [key: string]: any;
}

export interface MediaRecord {
    id: string;
    userId: string;
    type: 'image' | 'video' | 'audio';
    filename: string;
    mimeType: string;
    sizeBytes: number;
    path: string;
    metadata: string;
    createdAt: string;
}

export const mediaService = {
    async saveImage(userId: string, base64Data: string, metadata: MediaMetadata): Promise<string> {
        const id = uuidv4();
        const filename = `${id}.png`;
        const filePath = path.join(MEDIA_DIR, 'images', filename);

        // Remove data URL prefix if present
        const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Content, 'base64');

        fs.writeFileSync(filePath, buffer);

        const record: MediaRecord = {
            id,
            userId,
            type: 'image',
            filename,
            mimeType: 'image/png',
            sizeBytes: buffer.length,
            path: `/api/media/images/${filename}`,
            metadata: JSON.stringify(metadata),
            createdAt: new Date().toISOString(),
        };

        // Save to database (add to executions for now, or create media table)
        this.saveRecord(record);

        return record.path;
    },

    async saveVideo(userId: string, data: string | Buffer, metadata: MediaMetadata): Promise<string> {
        const id = uuidv4();
        const filename = `${id}.mp4`;
        const filePath = path.join(MEDIA_DIR, 'videos', filename);

        let buffer: Buffer;
        if (typeof data === 'string') {
            const base64Content = data.replace(/^data:video\/\w+;base64,/, '');
            buffer = Buffer.from(base64Content, 'base64');
        } else {
            buffer = data;
        }

        fs.writeFileSync(filePath, buffer);

        const record: MediaRecord = {
            id,
            userId,
            type: 'video',
            filename,
            mimeType: 'video/mp4',
            sizeBytes: buffer.length,
            path: `/api/media/videos/${filename}`,
            metadata: JSON.stringify(metadata),
            createdAt: new Date().toISOString(),
        };

        this.saveRecord(record);

        return record.path;
    },

    async saveAudio(userId: string, data: string | Buffer, metadata: MediaMetadata): Promise<string> {
        const id = uuidv4();
        const filename = `${id}.mp3`;
        const filePath = path.join(MEDIA_DIR, 'audio', filename);

        let buffer: Buffer;
        if (typeof data === 'string') {
            const base64Content = data.replace(/^data:audio\/\w+;base64,/, '');
            buffer = Buffer.from(base64Content, 'base64');
        } else {
            buffer = data;
        }

        fs.writeFileSync(filePath, buffer);

        const record: MediaRecord = {
            id,
            userId,
            type: 'audio',
            filename,
            mimeType: 'audio/mpeg',
            sizeBytes: buffer.length,
            path: `/api/media/audio/${filename}`,
            metadata: JSON.stringify(metadata),
            createdAt: new Date().toISOString(),
        };

        this.saveRecord(record);

        return record.path;
    },

    saveRecord(record: MediaRecord): void {
        // Store in a simple JSON structure in the database
        const existingMedia = this.getAllMedia();
        existingMedia.push(record);
        fs.writeFileSync(
            path.join(MEDIA_DIR, 'index.json'),
            JSON.stringify(existingMedia, null, 2)
        );
    },

    getAllMedia(): MediaRecord[] {
        const indexPath = path.join(MEDIA_DIR, 'index.json');
        if (!fs.existsSync(indexPath)) {
            return [];
        }
        return JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    },

    getMediaByUser(userId: string, type?: 'image' | 'video' | 'audio'): MediaRecord[] {
        const all = this.getAllMedia();
        return all.filter(m => m.userId === userId && (!type || m.type === type));
    },

    getMediaById(id: string): MediaRecord | undefined {
        const all = this.getAllMedia();
        return all.find(m => m.id === id);
    },

    deleteMedia(id: string): boolean {
        const record = this.getMediaById(id);
        if (!record) return false;

        const filePath = path.join(MEDIA_DIR, record.type + 's', record.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        const all = this.getAllMedia();
        const filtered = all.filter(m => m.id !== id);
        fs.writeFileSync(
            path.join(MEDIA_DIR, 'index.json'),
            JSON.stringify(filtered, null, 2)
        );

        return true;
    },

    getFilePath(type: 'image' | 'video' | 'audio', filename: string): string | null {
        const filePath = path.join(MEDIA_DIR, type + 's', filename);
        if (fs.existsSync(filePath)) {
            return filePath;
        }
        return null;
    },
};
