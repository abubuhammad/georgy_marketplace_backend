import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getDashboardStats: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProperties: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createProperty: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProperty: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteProperty: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const bulkUpdateProperties: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getViewings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const scheduleViewing: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateViewingStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAnalytics: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getClients: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMarketInsights: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=realtorController.d.ts.map