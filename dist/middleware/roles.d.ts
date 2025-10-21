import { Request, Response, NextFunction } from 'express';
export declare const adminOnly: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const sellerOnly: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const artisanOnly: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=roles.d.ts.map