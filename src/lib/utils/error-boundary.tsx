"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error capturado por ErrorBoundary:", error, errorInfo)

    // Enviar error a servicio de monitoreo
    if (process.env.NODE_ENV === "production") {
      // Aquí integrarías con Sentry, LogRocket, etc.
      console.error("Error en producción:", { error, errorInfo })
    }

    this.setState({
      error,
      errorInfo,
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-red-500">
                <AlertTriangle className="h-full w-full" />
              </div>
              <CardTitle className="text-red-600">¡Oops! Algo salió mal</CardTitle>
              <CardDescription>Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="rounded-md bg-red-50 p-3">
                  <p className="text-sm text-red-800 font-mono">{this.state.error.message}</p>
                </div>
              )}
              <Button onClick={this.resetError} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Intentar de nuevo
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook para usar con React Query o SWR
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    console.error("Error manejado:", error, errorInfo)

    // Aquí puedes agregar lógica adicional como:
    // - Enviar a servicio de monitoreo
    // - Mostrar toast de error
    // - Redirigir a página de error
  }
}
