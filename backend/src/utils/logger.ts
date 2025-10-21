export interface Logger {
  logLevel: string;
  logDir: string;
  ensureLogDirectory(): void;
  formatMessage(level: string, message: string): string;
  critical(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

export class SimpleLogger implements Logger {
  logLevel: string = 'info';
  logDir: string = './logs';

  ensureLogDirectory(): void {
    // Simple implementation - in production would create directory
  }

  formatMessage(level: string, message: string): string {
    return `[${new Date().toISOString()}] ${level.toUpperCase()}: ${message}`;
  }

  critical(message: string, meta?: any): void {
    console.error(this.formatMessage('critical', message), meta);
  }

  error(message: string, meta?: any): void {
    console.error(this.formatMessage('error', message), meta);
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('warn', message), meta);
  }

  info(message: string, meta?: any): void {
    console.info(this.formatMessage('info', message), meta);
  }

  debug(message: string, meta?: any): void {
    console.debug(this.formatMessage('debug', message), meta);
  }
}

// Create default logger instance
export const logger = new SimpleLogger();
