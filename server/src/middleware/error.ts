import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
    statusCode?: number;
    details?: any;
}

export const errorHandler = (
    err: ApiError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(`[ERROR] ${err.message}`, err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack, details: err.details }),
    });
};

export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
};

export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export class HttpError extends Error {
    constructor(public statusCode: number, message: string, public details?: any) {
        super(message);
        this.name = 'HttpError';
    }
}
