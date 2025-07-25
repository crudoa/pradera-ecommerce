import { NextResponse } from "next/server"
import type { ZodIssue } from "zod"

// Base custom error class
export class AppError extends Error {
  statusCode: number
  code?: string
  context?: { [key: string]: any }

  constructor(message: string, statusCode = 500, code?: string, context?: { [key: string]: any }) {
    super(message)
    this.name = "AppError"
    this.statusCode = statusCode
    this.code = code
    this.context = context
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

// Specific error classes for common scenarios
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", context?: { [key: string]: any }) {
    super(message, 401, "UNAUTHORIZED", context)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", context?: { [key: string]: any }) {
    super(message, 403, "FORBIDDEN", context)
    this.name = "ForbiddenError"
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", context?: { [key: string]: any }) {
    super(message, 404, "NOT_FOUND", context)
    this.name = "NotFoundError"
  }
}

export class ValidationError extends AppError {
  issues?: ZodIssue[] // Optional property to hold Zod validation issues

  constructor(message = "Validation failed", context?: { issues?: ZodIssue[]; [key: string]: any }) {
    super(message, 400, "VALIDATION_ERROR", context)
    this.name = "ValidationError"
    this.issues = context?.issues
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", context?: { [key: string]: any }) {
    super(message, 409, "CONFLICT", context)
    this.name = "ConflictError"
  }
}

/**
 * Centralized error handler for API routes.
 * It catches custom AppErrors and returns appropriate NextResponse.
 * For unexpected errors, it returns a generic 500 Internal Server Error.
 * @param error The error object caught.
 * @returns A NextResponse object with error details.
 */
export function handleError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    const responseBody: { error: string; code?: string; issues?: ZodIssue[] } = {
      error: error.message,
    }
    if (error.code) {
      responseBody.code = error.code
    }
    if (error instanceof ValidationError && error.issues) {
      responseBody.issues = error.issues
    }
    return NextResponse.json(responseBody, { status: error.statusCode })
  } else if (error instanceof Error) {
    // Handle generic JavaScript Errors
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  } else {
    // Handle unknown error types
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
