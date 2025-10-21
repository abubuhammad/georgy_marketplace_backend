import { Request, Response } from 'express';
export declare const getProperties: (req: Request, res: Response) => Promise<void>;
export declare const getPropertyById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createProperty: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateProperty: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteProperty: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserProperties: (req: Request, res: Response) => Promise<void>;
export declare const scheduleViewing: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=propertyController.d.ts.map