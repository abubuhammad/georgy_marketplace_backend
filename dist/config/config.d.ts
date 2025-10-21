export declare const config: {
    nodeEnv: string;
    isDevelopment: boolean;
    isProduction: boolean;
    port: number;
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    bcrypt: {
        saltRounds: number;
    };
    frontend: {
        url: string;
    };
    email: {
        host: string;
        port: number;
        user: string;
        password: string;
        from: string;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
};
//# sourceMappingURL=config.d.ts.map