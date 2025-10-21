import { Request, Response } from 'express';
import multer from 'multer';
export declare const upload: multer.Multer;
export declare const uploadSingleImage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const uploadMultipleImages: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteImage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=uploadController.d.ts.map