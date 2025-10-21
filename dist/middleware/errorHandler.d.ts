import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare const createError: (message: string, statusCode?: number) => AppError;
export declare const errorHandler: (error: AppError | Prisma.PrismaClientKnownRequestError | Error, req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map