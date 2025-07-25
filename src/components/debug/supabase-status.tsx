"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SupabaseDebug } from "@/lib/supabase/debug"

export function SupabaseStatus() {
  const [status, setStatus] = useState<{
    connection: boolean | null
    tables: boolean | null
    loading: boolean
    logs: string[]
  }>({
    connection: null,
    tables: null,
    loading: false,
    logs: [],
  })

  const runDiagnostic = async () => {
    setStatus((prev) => ({ ...prev, loading: true, logs: [] }))

    // Capturar logs de consola
    const originalLog = console.log
    const originalError = console.error
    const logs: string[] = []

    console.log = (...args) => {
      logs.push(args.join(" "))
      originalLog(...args)
    }

    console.error = (...args) => {
      logs.push(`ERROR: ${args.join(" ")}`)
      originalError(...args)
    }

    try {
      const connectionOk = await SupabaseDebug.checkConnection()
      const tablesOk = await SupabaseDebug.checkTables()

      setStatus({
        connection: connectionOk,
        tables: tablesOk,
        loading: false,
        logs,
      })
    } catch (error) {
      setStatus({
        connection: false,
        tables: false,
        loading: false,
        logs: [...logs, `ERROR: ${error}`],
      })
    } finally {
      // Restaurar console
      console.log = originalLog
      console.error = originalError
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🔍 Diagnóstico de Supabase
          <Button onClick={runDiagnostic} disabled={status.loading}>
            {status.loading ? "Verificando..." : "Ejecutar Prueba"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado de conexión */}
        <div className="flex items-center justify-between">
          <span>Conexión a Supabase:</span>
          <Badge variant={status.connection === null ? "secondary" : status.connection ? "default" : "destructive"}>
            {status.connection === null ? "No probado" : status.connection ? "✅ Conectado" : "❌ Error"}
          </Badge>
        </div>

        {/* Estado de tablas */}
        <div className="flex items-center justify-between">
          <span>Estructura de tablas:</span>
          <Badge variant={status.tables === null ? "secondary" : status.tables ? "default" : "destructive"}>
            {status.tables === null ? "No probado" : status.tables ? "✅ OK" : "❌ Error"}
          </Badge>
        </div>

        {/* Logs */}
        {status.logs.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Logs de diagnóstico:</h4>
            <div className="bg-gray-100 p-3 rounded-md text-sm font-mono max-h-60 overflow-y-auto">
              {status.logs.map((log, index) => (
                <div key={index} className={log.startsWith("ERROR:") ? "text-red-600" : "text-gray-800"}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📋 Pasos para configurar:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>
              1. Ve a{" "}
              <a href="https://supabase.com/dashboard" target="_blank" className="underline" rel="noreferrer">
                supabase.com/dashboard
              </a>
            </li>
            <li>2. Crea un nuevo proyecto o selecciona uno existente</li>
            <li>3. Ve a Settings → API</li>
            <li>4. Copia la URL y la clave anónima</li>
            <li>5. Pégalas en tu archivo .env.local</li>
            <li>6. Ejecuta los scripts SQL para crear las tablas</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
