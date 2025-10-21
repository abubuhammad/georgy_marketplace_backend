import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getDashboardStats: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSellerProducts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProduct: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteProduct: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const bulkUpdateProducts: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSellerOrders: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateOrderStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getEarnings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const requestWithdrawal: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getStoreSettings: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateStoreSettings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAnalytics: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=sellerController.d.ts.map