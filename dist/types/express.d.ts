declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                userId?: string;
                email: string;
                role: string;
                [key: string]: any;
            };
        }
    }
}
export {};
//# sourceMappingURL=express.d.ts.map