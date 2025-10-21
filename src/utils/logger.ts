import fs from 'fs';
import path from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private logLevel: LogLevel;
  private logDir: string;

  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  private log(level: LogLevel, levelName: string, message: string, meta?: any): void {
    if (level < this.logLevel) return;

    const formattedMessage = this.formatMessage(levelName, message, meta);
    console.log(formattedMessage);

    // Write to file
    const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, formattedMessage + '\n');
  }

  debug(message: string, meta?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, meta);
  }

  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, meta);
  }

  error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, meta);
  }

  critical(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, 'CRITICAL', message, meta);
  }
}

export const logger = new Logger(
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
);

// Export the Logger class for services that need it
export { Logger };

export default logger;
