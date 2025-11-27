/**
 * Centralized logging system
 * Replaces console.error with environment-aware logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  error?: Error;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private formatMessage(level: LogLevel, message: string, error?: Error, metadata?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      } as unknown as Error : undefined,
      metadata,
      timestamp: new Date().toISOString(),
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) {
      return true; // Log everything in development
    }

    if (this.isProduction) {
      // In production, only log warnings and errors
      return level === 'warn' || level === 'error';
    }

    return true;
  }

  private log(level: LogLevel, message: string, error?: Error, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry = this.formatMessage(level, message, error, metadata);

    // In production, you might want to send logs to an external service
    // For now, we'll use console methods but with structured data
    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug('[DEBUG]', logEntry);
        }
        break;
      case 'info':
        if (this.isDevelopment) {
          console.info('[INFO]', logEntry);
        }
        break;
      case 'warn':
        console.warn('[WARN]', logEntry);
        // In production, you could send to monitoring service
        break;
      case 'error':
        console.error('[ERROR]', logEntry);
        // In production, send to error tracking service (e.g., Sentry)
        if (this.isProduction && error) {
          // TODO: Integrate with error tracking service
          // Example: Sentry.captureException(error, { extra: metadata });
        }
        break;
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log('debug', message, undefined, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log('info', message, undefined, metadata);
  }

  warn(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.log('warn', message, error, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.log('error', message, error, metadata);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export Logger class for testing
export { Logger };

