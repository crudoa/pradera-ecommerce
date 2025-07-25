import { NextResponse } from "next/server"
import { AppError, NotFoundError, ConflictError, ValidationError, AuthorizationError } from "./app-error" // Import from the universal error definitions

// Función para manejar errores de forma centralizada en Route Handlers
export function handleError(error: any, context?: Record<string, any>): NextResponse {
  let appError: AppError

  if (error instanceof AppError) {
    appError = error
  } else {
    // Convert non-AppError to a generic AppError or a more specific one if possible
    appError = convertSupabaseError(error, context)
  }

  // Log del error con contexto
  console.error("🚨 Server Error Handled:", {
    name: appError.name,
    message: appError.message,
    code: appError.code,
    statusCode: appError.statusCode,
    context: { ...context, ...appError.context },
    stack: appError.stack,
    timestamp: new Date().toISOString(),
  })

  // En desarrollo, mostrar más detalles
  if (process.env.NODE_ENV === "development") {
    console.error("Full error object:", error)
  }

  return NextResponse.json(
    {
      error: appError.message,
      code: appError.code,
      ...(appError.context && Object.keys(appError.context).length > 0 && { details: appError.context }),
    },
    { status: appError.statusCode },
  )
}

// Función para determinar si un error es operacional (esperado)
export function isOperationalError(error: any): boolean {
  if (error instanceof AppError) {
    return true
  }

  // Errores de Supabase que son operacionales
  const operationalSupabaseCodes = [
    "PGRST116", // Not found
    "23505", // Unique violation
    "23503", // Foreign key violation
    "42501", // Insufficient privilege
  ]

  return operationalSupabaseCodes.includes(error?.code)
}

// Función para convertir errores de Supabase a errores de aplicación
export function convertSupabaseError(error: any, context?: Record<string, any>): AppError {
  if (error instanceof AppError) {
    return error
  }

  switch (error?.code) {
    case "PGRST116":
      return new NotFoundError("Resource", context)
    case "23505":
      return new ConflictError("Resource already exists", context)
    case "23503":
      return new ValidationError("Invalid reference", context)
    case "42501":
      return new AuthorizationError("Insufficient permissions", context)
    default:
      return new AppError(error?.message || "Database error", 500, "DATABASE_ERROR", context)
  }
}

// Wrapper para funciones async que maneja errores automáticamente
export function withErrorHandling<T extends any[], R>(fn: (...args: T) => Promise<R>, context?: Record<string, any>) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      const appError = convertSupabaseError(error, context)
      throw handleError(appError, context)
    }
  }
}
