"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Info, Bug, Mail, Settings, Database, Globe } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"

interface LogEntry {
  id: string
  timestamp: string
  level: "INFO" | "SUCCESS" | "ERROR" | "WARNING"
  message: string
  details?: any
}

export default function DebugAuthPage() {
  const { user, session, requestPasswordReset } = useAuth()
  const [testEmail, setTestEmail] = useState("junior2004crack@gmail.com")
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (level: LogEntry["level"], message: string, details?: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      details,
    }
    setLogs((prev) => [newLog, ...prev])
  }

  const clearLogs = () => {
    setLogs([])
  }

  const testSupabaseConfig = async () => {
    setIsLoading(true)
    addLog("INFO", "🔍 Verificando configuración completa de Supabase...")

    try {
      // 1. Variables de entorno
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      addLog("INFO", "📋 Variables de entorno", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlDomain: supabaseUrl ? new URL(supabaseUrl).hostname : "No configurada",
        currentOrigin: window.location.origin,
      })

      if (!supabaseUrl || !supabaseKey) {
        addLog("ERROR", "❌ Variables de entorno faltantes")
        return
      }

      // 2. Test de conexión básica
      const { data: connectionTest, error: connectionError } = await supabase
        .from("user_profiles")
        .select("count")
        .limit(1)

      if (connectionError) {
        addLog("ERROR", "❌ Error de conexión con base de datos", connectionError)
      } else {
        addLog("SUCCESS", "✅ Conexión con base de datos exitosa")
      }

      // 3. Test de Auth service
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        addLog("ERROR", "❌ Error obteniendo sesión", sessionError)
      } else {
        addLog("INFO", "📱 Estado de sesión actual", {
          hasSession: !!currentSession,
          userEmail: currentSession?.user?.email || "No user",
          expiresAt: currentSession?.expires_at || "No expiration",
        })
      }

      // 4. Verificar configuración de Auth
      addLog("INFO", "🔧 Configuración recomendada para Supabase Dashboard", {
        siteUrl: window.location.origin,
        redirectUrls: [`${window.location.origin}/reset-password`, `${window.location.origin}/auth/callback`],
        emailSettings: "Authentication > Settings > Enable email confirmations: ON",
      })

      addLog("SUCCESS", "✅ Verificación de configuración completada")
    } catch (error: any) {
      addLog("ERROR", "❌ Error inesperado en verificación", error)
    } finally {
      setIsLoading(false)
    }
  }

  const testPasswordResetDirect = async () => {
    if (!testEmail.trim()) {
      addLog("ERROR", "❌ Email requerido para la prueba")
      return
    }

    setIsLoading(true)
    addLog("INFO", `🔄 Probando reset directo con Supabase para: ${testEmail}`)

    try {
      const redirectUrl = `${window.location.origin}/reset-password`

      addLog("INFO", "🔗 URL de redirección configurada", { redirectUrl })

      // Test directo con Supabase
      const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: redirectUrl,
      })

      if (error) {
        addLog("ERROR", "❌ Error en Supabase directo", {
          message: error.message,
          status: error.status,
          name: error.name,
        })
      } else {
        addLog("SUCCESS", "✅ Supabase procesó la solicitud exitosamente", {
          data,
          timestamp: new Date().toISOString(),
          nextSteps: [
            "1. Revisa tu email (incluyendo spam)",
            "2. El email puede tardar 1-5 minutos",
            "3. Verifica que el email esté registrado en el sistema",
          ],
        })
      }
    } catch (error: any) {
      addLog("ERROR", "❌ Error inesperado en test directo", error)
    } finally {
      setIsLoading(false)
    }
  }

  const testPasswordResetContext = async () => {
    if (!testEmail.trim()) {
      addLog("ERROR", "❌ Email requerido para la prueba")
      return
    }

    setIsLoading(true)
    addLog("INFO", `🔄 Probando reset con contexto para: ${testEmail}`)

    try {
      const result = await requestPasswordReset(testEmail)

      if (result.success) {
        addLog("SUCCESS", "✅ Contexto procesó la solicitud exitosamente", result)
      } else {
        addLog("ERROR", "❌ Error en contexto", result)
      }
    } catch (error: any) {
      addLog("ERROR", "❌ Error inesperado en test de contexto", error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkEmailProvider = () => {
    const emailDomain = testEmail.split("@")[1]?.toLowerCase()

    addLog("INFO", "📧 Análisis del proveedor de email", {
      email: testEmail,
      domain: emailDomain,
      provider: getEmailProvider(emailDomain),
      recommendations: getEmailRecommendations(emailDomain),
    })
  }

  const getEmailProvider = (domain: string) => {
    const providers: Record<string, string> = {
      "gmail.com": "Google Gmail",
      "outlook.com": "Microsoft Outlook",
      "hotmail.com": "Microsoft Hotmail",
      "yahoo.com": "Yahoo Mail",
      "icloud.com": "Apple iCloud",
    }
    return providers[domain] || "Proveedor desconocido"
  }

  const getEmailRecommendations = (domain: string) => {
    const recommendations: Record<string, string[]> = {
      "gmail.com": [
        'Revisa la pestaña "Promociones" o "Social"',
        'Busca emails de "noreply" en tu bandeja',
        "Gmail puede tardar 2-5 minutos en entregar",
      ],
      "outlook.com": [
        'Revisa la carpeta "Correo no deseado"',
        "Agrega el dominio a contactos seguros",
        "Outlook puede bloquear emails automáticos",
      ],
      "hotmail.com": ["Similar a Outlook, revisa spam", "Hotmail es más estricto con emails automáticos"],
    }
    return recommendations[domain] || ["Revisa carpeta de spam", "Verifica que el email esté registrado"]
  }

  const getLevelIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "SUCCESS":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "ERROR":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "WARNING":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "SUCCESS":
        return "bg-green-100 text-green-800 border-green-200"
      case "ERROR":
        return "bg-red-100 text-red-800 border-red-200"
      case "WARNING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            <span className="text-green-600">Agro</span>
            <span className="text-blue-600">Peru</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Bug className="h-6 w-6" />
            Debug Avanzado de Emails
          </h1>
          <p className="text-gray-600">Diagnóstico completo del sistema de recuperación de contraseñas</p>
        </div>

        {/* Estado Actual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Usuario</div>
                <div className="font-medium">{user ? user.email : "No logueado"}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Sesión</div>
                <Badge variant={session ? "default" : "secondary"}>{session ? "Activa" : "Inactiva"}</Badge>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Entorno</div>
                <div className="font-medium">{process.env.NODE_ENV || "development"}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">URL Base</div>
                <div className="font-medium text-xs">
                  {typeof window !== "undefined" ? window.location.origin : "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Herramientas de Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Herramientas de Diagnóstico
            </CardTitle>
            <CardDescription>Pruebas específicas para diagnosticar problemas de email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Email de Prueba */}
              <div className="space-y-2">
                <Label htmlFor="testEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email de Prueba
                </Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="tu@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  disabled={isLoading}
                  className="font-mono"
                />
                <p className="text-xs text-gray-500">Usa tu email real para probar el sistema completo</p>
              </div>

              {/* Botones de Prueba */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button
                  onClick={testSupabaseConfig}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Database className="h-4 w-4" />
                  Config Supabase
                </Button>

                <Button
                  onClick={testPasswordResetDirect}
                  disabled={isLoading || !testEmail}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Test Directo
                </Button>

                <Button
                  onClick={testPasswordResetContext}
                  disabled={isLoading || !testEmail}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Test Contexto
                </Button>

                <Button
                  onClick={checkEmailProvider}
                  disabled={!testEmail}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Mail className="h-4 w-4" />
                  Analizar Email
                </Button>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button onClick={clearLogs} variant="destructive" size="sm">
                  Limpiar Logs
                </Button>
                <Badge variant="outline" className="text-xs">
                  {logs.length} entradas
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados del Debug */}
        <Card>
          <CardHeader>
            <CardTitle>Logs de Diagnóstico</CardTitle>
            <CardDescription>Información detallada de las pruebas ejecutadas</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bug className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay logs disponibles.</p>
                <p className="text-sm">Ejecuta una prueba para ver los resultados detallados.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border ${getLevelColor(log.level)}`}
                  >
                    {getLevelIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs font-mono">
                          {log.level}
                        </Badge>
                        <span className="text-xs text-gray-600">{log.timestamp}</span>
                      </div>
                      <div className="text-sm font-medium mb-2">{log.message}</div>
                      {log.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-800 mb-1">
                            Ver detalles técnicos
                          </summary>
                          <pre className="bg-white p-3 rounded border overflow-x-auto text-xs font-mono">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guía de Configuración */}
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <strong>Configuración requerida en Supabase Dashboard:</strong>
            <div className="mt-2 space-y-1 text-sm">
              <div>
                • <strong>Authentication → Settings:</strong> Enable email confirmations = ON
              </div>
              <div>
                • <strong>Site URL:</strong> {typeof window !== "undefined" ? window.location.origin : "tu-dominio.com"}
              </div>
              <div>
                • <strong>Redirect URLs:</strong>{" "}
                {typeof window !== "undefined"
                  ? `${window.location.origin}/reset-password`
                  : "tu-dominio.com/reset-password"}
              </div>
              <div>
                • <strong>Email Templates:</strong> Verificar que estén habilitados
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
