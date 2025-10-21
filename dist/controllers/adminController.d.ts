import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: {
        id: string;
        userId?: string;
        email: string;
        role: string;
        [key: string]: any;
    };
}
export declare const getDashboardStats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUsers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserDetails: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateUserStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getVendors: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCommissionSettings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateCommissionScheme: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createCommissionScheme: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getRefunds: (req: AuthRequest, res: Response) => Promise<void>;
export declare const processRefund: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPlatformAnalytics: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getModerationQueue: (req: AuthRequest, res: Response) => Promise<void>;
export declare const moderateContent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSystemSettings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateSystemSettings: (req: AuthRequest, res: Response) => Promise<void>;
export declare class AdminController {
    createRevenueShareScheme(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getRevenueShareSchemes(req: Request, res: Response): Promise<void>;
    updateRevenueShareScheme(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteRevenueShareScheme(req: Request, res: Response): Promise<void>;
    createTaxRule(req: Request, res: Response): Promise<void>;
    getTaxRules(req: Request, res: Response): Promise<void>;
    updateTaxRule(req: Request, res: Response): Promise<void>;
    deleteTaxRule(req: Request, res: Response): Promise<void>;
    getPaymentAnalytics(req: Request, res: Response): Promise<void>;
    getRevenueBreakdown(req: Request, res: Response): Promise<void>;
    getPendingPayouts(req: Request, res: Response): Promise<void>;
    processPayouts(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPaymentConfig(req: Request, res: Response): Promise<void>;
    updatePaymentConfig(req: Request, res: Response): Promise<void>;
}
export declare const adminController: AdminController;
export {};
//# sourceMappingURL=adminController.d.ts.map