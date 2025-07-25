type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: any
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development"

  private formatMessage(level: LogLevel, message: string, data?: any, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      error,
    }
  }

  private log(entry: LogEntry): void {
    const { level, message, timestamp, data, error } = entry
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    switch (level) {
      case "debug":
        console.debug(prefix, message, data || "")
        break
      case "info":
        console.info(prefix, message, data || "")
        break
      case "warn":
        console.warn(prefix, message, data || "")
        break
      case "error":
        console.error(prefix, message, data || "", error || "")
        break
    }

    // In production, you might want to send logs to a service like Sentry, LogRocket, etc.
    if (!this.isDevelopment && entry.level === "error") {
      // Send to error tracking service
      // Example: Sentry.captureException(error || new Error(message))
    }
  }

  debug(message: string, data?: any): void {
    this.log(this.formatMessage("debug", message, data))
  }

  info(message: string, data?: any): void {
    this.log(this.formatMessage("info", message, data))
  }

  warn(message: string, data?: any): void {
    this.log(this.formatMessage("warn", message, data))
  }

  error(message: string, data?: any, error?: Error): void {
    this.log(this.formatMessage("error", message, data, error))
  }
}

export const logger = new Logger()
export default logger
