"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.logger = exports.LogLevel = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor(logLevel = LogLevel.INFO) {
        this.logLevel = logLevel;
        this.logDir = path_1.default.join(process.cwd(), 'logs');
        this.ensureLogDirectory();
    }
    ensureLogDirectory() {
        if (!fs_1.default.existsSync(this.logDir)) {
            fs_1.default.mkdirSync(this.logDir, { recursive: true });
        }
    }
    formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level}] ${message}${metaStr}`;
    }
    log(level, levelName, message, meta) {
        if (level < this.logLevel)
            return;
        const formattedMessage = this.formatMessage(levelName, message, meta);
        console.log(formattedMessage);
        // Write to file
        const logFile = path_1.default.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
        fs_1.default.appendFileSync(logFile, formattedMessage + '\n');
    }
    debug(message, meta) {
        this.log(LogLevel.DEBUG, 'DEBUG', message, meta);
    }
    info(message, meta) {
        this.log(LogLevel.INFO, 'INFO', message, meta);
    }
    warn(message, meta) {
        this.log(LogLevel.WARN, 'WARN', message, meta);
    }
    error(message, meta) {
        this.log(LogLevel.ERROR, 'ERROR', message, meta);
    }
    critical(message, meta) {
        this.log(LogLevel.ERROR, 'CRITICAL', message, meta);
    }
}
exports.Logger = Logger;
exports.logger = new Logger(process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO);
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map