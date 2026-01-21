import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { memoryService } from '../ai/memory.js';

interface LiveSession {
    userId: string;
    ws: WebSocket;
    voice: string;
    isActive: boolean;
    startedAt: Date;
    transcripts: { role: string; text: string; timestamp: Date }[];
}

const activeSessions: Map<string, LiveSession> = new Map();

export const initWebSocketServer = (server: Server) => {
    const wss = new WebSocketServer({
        server,
        path: '/api/live'
    });

    wss.on('connection', (ws, req) => {
        console.log('WebSocket connection attempt');

        // Extract token from query string
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const token = url.searchParams.get('token');

        if (!token) {
            ws.close(4001, 'Authentication required');
            return;
        }

        try {
            const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
            const sessionId = `${decoded.userId}-${Date.now()}`;

            const session: LiveSession = {
                userId: decoded.userId,
                ws,
                voice: 'Zephyr',
                isActive: true,
                startedAt: new Date(),
                transcripts: [],
            };

            activeSessions.set(sessionId, session);

            ws.send(JSON.stringify({
                type: 'connected',
                sessionId,
                message: 'Gemini Live session started',
                config: {
                    inputSampleRate: 16000,
                    outputSampleRate: 24000,
                    voice: session.voice,
                },
            }));

            ws.on('message', async (data) => {
                try {
                    const message = JSON.parse(data.toString());

                    switch (message.type) {
                        case 'audio':
                            // Handle incoming audio chunk
                            await handleAudioInput(sessionId, session, message.data);
                            break;

                        case 'text':
                            // Handle text input (for testing)
                            await handleTextInput(sessionId, session, message.text);
                            break;

                        case 'config':
                            // Update session config
                            if (message.voice) {
                                session.voice = message.voice;
                            }
                            ws.send(JSON.stringify({
                                type: 'config_updated',
                                config: { voice: session.voice },
                            }));
                            break;

                        case 'end':
                            // End session
                            session.isActive = false;
                            await saveSessionTranscripts(session);
                            ws.send(JSON.stringify({
                                type: 'session_ended',
                                transcripts: session.transcripts,
                            }));
                            break;
                    }
                } catch (error: any) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: error.message,
                    }));
                }
            });

            ws.on('close', async () => {
                session.isActive = false;
                await saveSessionTranscripts(session);
                activeSessions.delete(sessionId);
                console.log(`Session ${sessionId} closed`);
            });

            ws.on('error', (error) => {
                console.error(`WebSocket error for session ${sessionId}:`, error);
                activeSessions.delete(sessionId);
            });

        } catch (error) {
            ws.close(4002, 'Invalid token');
        }
    });

    console.log('✓ WebSocket server initialized for Gemini Live');

    return wss;
};

async function handleAudioInput(sessionId: string, session: LiveSession, audioData: string) {
    // In production, this would:
    // 1. Send audio to Gemini Live API
    // 2. Receive streaming audio response
    // 3. Stream back to client

    // For now, send a placeholder response
    session.ws.send(JSON.stringify({
        type: 'processing',
        message: 'Audio received, processing...',
    }));

    // Simulate response
    setTimeout(() => {
        if (session.isActive) {
            session.transcripts.push({
                role: 'user',
                text: '[Audio input received]',
                timestamp: new Date(),
            });

            session.transcripts.push({
                role: 'assistant',
                text: 'I received your audio message. Voice processing is being set up.',
                timestamp: new Date(),
            });

            session.ws.send(JSON.stringify({
                type: 'transcript',
                role: 'assistant',
                text: 'I received your audio message.',
            }));
        }
    }, 500);
}

async function handleTextInput(sessionId: string, session: LiveSession, text: string) {
    session.transcripts.push({
        role: 'user',
        text,
        timestamp: new Date(),
    });

    session.ws.send(JSON.stringify({
        type: 'transcript',
        role: 'user',
        text,
    }));

    // Generate response (simplified)
    const response = `I heard you say: "${text}". This is a test response from Gemini Live.`;

    session.transcripts.push({
        role: 'assistant',
        text: response,
        timestamp: new Date(),
    });

    session.ws.send(JSON.stringify({
        type: 'transcript',
        role: 'assistant',
        text: response,
    }));
}

async function saveSessionTranscripts(session: LiveSession) {
    if (session.transcripts.length > 0) {
        // Save transcripts to memory
        for (const transcript of session.transcripts) {
            memoryService.addMessage(session.userId, 'gemini-live', {
                role: transcript.role as 'user' | 'assistant',
                content: transcript.text,
            });
        }
    }
}
