export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
declare class Logger {
    private logLevel;
    private logDir;
    constructor(logLevel?: LogLevel);
    private ensureLogDirectory;
    private formatMessage;
    private log;
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
    critical(message: string, meta?: any): void;
}
export declare const logger: Logger;
export { Logger };
export default logger;
//# sourceMappingURL=logger.d.ts.map