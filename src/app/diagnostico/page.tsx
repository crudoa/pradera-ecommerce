"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ExternalLink, Copy, CheckCircle, XCircle } from "lucide-react"

export default function VerifySupabasePage() {
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  const extractProjectId = (url: string) => {
    const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
    return match ? match[1] : null
  }

  const projectId = extractProjectId(supabaseUrl)

  const checkSupabaseStatus = async () => {
    setChecking(true)
    setResults(null)

    const checks = {
      envVars: false,
      urlFormat: false,
      projectReachable: false,
      apiResponse: false,
      errorDetails: null as any,
    }

    try {
      // Check 1: Environment variables
      if (supabaseUrl && supabaseKey) {
        checks.envVars = true
      }

      // Check 2: URL format
      if (supabaseUrl.includes("supabase.co") && projectId) {
        checks.urlFormat = true
      }

      // Check 3: Try to reach the project
      try {
        const healthUrl = `${supabaseUrl}/rest/v1/`
        const response = await fetch(healthUrl, {
          method: "GET",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        })

        if (response.ok || response.status === 404) {
          checks.projectReachable = true
        }

        // Check 4: Try a simple API call
        const testUrl = `${supabaseUrl}/rest/v1/products?select=count&head=true`
        const testResponse = await fetch(testUrl, {
          method: "HEAD",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          signal: AbortSignal.timeout(5000),
        })

        if (testResponse.ok) {
          checks.apiResponse = true
        } else {
          checks.errorDetails = {
            status: testResponse.status,
            statusText: testResponse.statusText,
            headers: Object.fromEntries(testResponse.headers.entries()),
          }
        }
      } catch (fetchError: any) {
        checks.errorDetails = {
          name: fetchError.name,
          message: fetchError.message,
          cause: fetchError.cause?.message,
        }
      }
    } catch (error: any) {
      checks.errorDetails = {
        general: error.message,
      }
    }

    setResults(checks)
    setChecking(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Verificador de Supabase</h1>
          <p className="text-gray-600">Diagnosticando problemas de conexión con tu proyecto Supabase</p>
        </div>

        {/* Current Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>⚙️ Configuración Actual</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">NEXT_PUBLIC_SUPABASE_URL:</label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                    {supabaseUrl || "❌ No configurada"}
                  </code>
                  {supabaseUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(supabaseUrl)}
                      className="flex items-center space-x-1"
                    >
                      <Copy className="h-3 w-3" />
                      {copied ? "✓" : "Copiar"}
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Project ID:</label>
                <div className="mt-1">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{projectId || "❌ No se puede extraer"}</code>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">NEXT_PUBLIC_SUPABASE_ANON_KEY:</label>
                <div className="mt-1">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : "❌ No configurada"}
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Button */}
        <div className="mb-6">
          <Button onClick={checkSupabaseStatus} disabled={checking} className="w-full">
            {checking ? "🔄 Verificando..." : "🚀 Verificar Conexión"}
          </Button>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📊 Resultados del Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Variables de entorno configuradas</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(results.envVars)}
                      <Badge variant={results.envVars ? "default" : "destructive"}>
                        {results.envVars ? "✅ OK" : "❌ Falta"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Formato de URL válido</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(results.urlFormat)}
                      <Badge variant={results.urlFormat ? "default" : "destructive"}>
                        {results.urlFormat ? "✅ OK" : "❌ Inválido"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Proyecto accesible</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(results.projectReachable)}
                      <Badge variant={results.projectReachable ? "default" : "destructive"}>
                        {results.projectReachable ? "✅ OK" : "❌ No accesible"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>API responde correctamente</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(results.apiResponse)}
                      <Badge variant={results.apiResponse ? "default" : "destructive"}>
                        {results.apiResponse ? "✅ OK" : "❌ Error"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {results.errorDetails && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                    <h4 className="font-medium text-red-800 mb-2">🚨 Detalles del Error:</h4>
                    <pre className="text-xs text-red-700 overflow-auto">
                      {JSON.stringify(results.errorDetails, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Solutions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>🛠️ Soluciones Comunes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Project Paused */}
              <div className="border-l-4 border-yellow-400 pl-4">
                <h4 className="font-medium text-gray-900 mb-2">1. Proyecto Pausado (Más Común)</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Los proyectos gratuitos de Supabase se pausan automáticamente después de inactividad.
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ir a Dashboard
                  </Button>
                  <span className="text-xs text-gray-500">→ Busca tu proyecto y haz clic en &quot;Resume&quot;</span>
                </div>
              </div>

              {/* Wrong URL */}
              <div className="border-l-4 border-red-400 pl-4">
                <h4 className="font-medium text-gray-900 mb-2">2. URL Incorrecta</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Verifica que tu URL sea exactamente como aparece en Supabase:
                </p>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">https://tu-proyecto-id.supabase.co</code>
              </div>

              {/* Missing Project */}
              <div className="border-l-4 border-blue-400 pl-4">
                <h4 className="font-medium text-gray-900 mb-2">3. Crear Nuevo Proyecto</h4>
                <p className="text-sm text-gray-600 mb-3">Si no tienes un proyecto de Supabase:</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open("https://supabase.com/dashboard/projects", "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Crear Proyecto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
