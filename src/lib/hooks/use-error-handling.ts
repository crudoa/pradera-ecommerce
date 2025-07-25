"use client"

import { useState, useCallback } from "react"
import { AppError } from "../errors/app-error" // Import from the universal error definitions
import { useToast } from "@/lib/hooks/use-toast"

// Hook para manejar errores en componentes React
export function useErrorHandler() {
  const { toast } = useToast()

  return (error: any, context?: Record<string, any>) => {
    let appError: AppError
    if (error instanceof AppError) {
      appError = error
    } else {
      appError = new AppError(error?.message || "An unexpected error occurred", 500, "CLIENT_ERROR", context)
    }

    console.error("🚨 Client-side error handled:", {
      name: appError.name,
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      context: { ...context, ...appError.context },
      stack: appError.stack,
      timestamp: new Date().toISOString(),
    })

    toast({
      title: "Error",
      description: appError.message,
      variant: "destructive",
    })
  }
}

// Hook para manejar estados de carga y error en operaciones asíncronas
export function useSafeAsync<T = any, E extends AppError = AppError>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<E | null>(null)
  const errorHandler = useErrorHandler()

  const execute = useCallback(
    async (asyncFn: () => Promise<T>, context?: string): Promise<T | null> => {
      setLoading(true)
      setError(null)
      try {
        const result = await asyncFn()
        return result
      } catch (err: any) {
        const appError =
          err instanceof AppError
            ? err
            : new AppError(err.message || "An unexpected error occurred", 500, "ASYNC_ERROR", { context })
        setError(appError as E)
        errorHandler(appError, { source: context || "useSafeAsync" })
        return null
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  return { execute, loading, error }
}
