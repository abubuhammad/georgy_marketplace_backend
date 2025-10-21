import { Request, Response, NextFunction } from 'express';
import '../types';
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeRoles: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map