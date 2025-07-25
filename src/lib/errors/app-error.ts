export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly context?: Record<string, any>

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR", context?: Record<string, any>) {
    super(message)
    this.name = "AppError"
    this.statusCode = statusCode
    this.code = code
    this.context = context

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 400, "VALIDATION_ERROR", context)
    this.name = "ValidationError"
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 401, "AUTHENTICATION_ERROR", context)
    this.name = "AuthenticationError"
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 403, "AUTHORIZATION_ERROR", context)
    this.name = "AuthorizationError"
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, any>) {
    super(`${resource} not found`, 404, "NOT_FOUND_ERROR", context)
    this.name = "NotFoundError"
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 409, "CONFLICT_ERROR", context)
    this.name = "ConflictError"
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded", context?: Record<string, any>) {
    super(message, 429, "RATE_LIMIT_ERROR", context)
    this.name = "RateLimitError"
  }
}

export class UnauthorizedError extends AuthenticationError {
  constructor(message = "Unauthorized", context?: Record<string, any>) {
    super(message, context)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends AuthorizationError {
  constructor(message = "Forbidden", context?: Record<string, any>) {
    super(message, context)
    this.name = "ForbiddenError"
  }
}
