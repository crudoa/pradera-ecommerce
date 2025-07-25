"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
const router = useRouter()
const searchParams = useSearchParams()
const [password, setPassword] = useState("")
const [confirmPassword, setConfirmPassword] = useState("")
const [showPassword, setShowPassword] = useState(false)
const [showConfirmPassword, setShowConfirmPassword] = useState(false)
const [isLoading, setIsLoading] = useState(false)
const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
const [isValidSession, setIsValidSession] = useState(false)
const [passwordUpdated, setPasswordUpdated] = useState(false)

useEffect(() => {
  // Verificar si hay una sesión válida para reset de contraseña
  const checkSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) {
      setIsValidSession(true)
    } else {
      setMessage({
        type: "error",
        text: "Enlace inválido o expirado. Solicita un nuevo enlace de recuperación.",
      })
    }
  }

  checkSession()
}, [])

const validatePassword = (pwd: string) => {
  if (pwd.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres"
  }
  if (!/(?=.*[a-z])/.test(pwd)) {
    return "La contraseña debe contener al menos una letra minúscula"
  }
  if (!/(?=.*[A-Z])/.test(pwd)) {
    return "La contraseña debe contener al menos una letra mayúscula"
  }
  if (!/(?=.*\d)/.test(pwd)) {
    return "La contraseña debe contener al menos un número"
  }
  return null
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!password || !confirmPassword) {
    setMessage({ type: "error", text: "Por favor completa todos los campos" })
    return
  }

  if (password !== confirmPassword) {
    setMessage({ type: "error", text: "Las contraseñas no coinciden" })
    return
  }

  const passwordError = validatePassword(password)
  if (passwordError) {
    setMessage({ type: "error", text: passwordError })
    return
  }

  setIsLoading(true)
  setMessage(null)

  try {
    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      throw error
    }

    setPasswordUpdated(true)
    setMessage({
      type: "success",
      text: "¡Contraseña actualizada exitosamente! Redirigiendo al login...",
    })

    // Cerrar sesión y redirigir al login
    setTimeout(async () => {
      await supabase.auth.signOut()
      router.push("/login?message=password-updated")
    }, 3000)
  } catch (error: any) {
    console.error("Error updating password:", error)
    setMessage({
      type: "error",
      text: error.message || "Error al actualizar la contraseña. Intenta de nuevo.",
    })
  } finally {
    setIsLoading(false)
  }
}

if (!isValidSession && !message) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Verificando enlace...</p>
      </div>
    </div>
  )
}

return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full space-y-8">
      {/* Header */}
      <div className="text-center">
        <Link href="/" className="inline-block">
          <div className="text-3xl font-bold">
            <span className="text-primary">Agro</span>
            <span className="text-blue-600">Peru</span>
          </div>
        </Link>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          {passwordUpdated ? "Contraseña Actualizada" : "Nueva Contraseña"}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {passwordUpdated
            ? "Tu contraseña ha sido actualizada exitosamente"
            : "Crea una nueva contraseña segura para tu cuenta"}
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {passwordUpdated ? "¡Listo!" : "Restablecer Contraseña"}
          </CardTitle>
          <CardDescription>
            {passwordUpdated
              ? "Ahora puedes iniciar sesión con tu nueva contraseña"
              : "Tu nueva contraseña debe ser segura y fácil de recordar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isValidSession ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Enlace Inválido</h3>
              <p className="text-sm text-gray-600 mb-6">Este enlace ha expirado o no es válido.</p>
              <Link href="/forgot-password">
                <Button className="bg-primary hover:bg-primary/90">Solicitar Nuevo Enlace</Button>
              </Link>
            </div>
          ) : passwordUpdated ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">¡Contraseña Actualizada!</h3>
              <p className="text-sm text-gray-600 mb-6">
                Tu contraseña ha sido cambiada exitosamente. Serás redirigido al login en unos segundos.
              </p>
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary/90">Ir al Login Ahora</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nueva Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pl-10 pr-10"
                    placeholder="Tu nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="pl-10 pr-10"
                    placeholder="Confirma tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-secondary/50 border border-secondary/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Requisitos de contraseña:</h4>
                <ul className="text-sm text-gray-800 space-y-1">
                  <li className={`flex items-center gap-2 ${password.length >= 6 ? "text-primary/70" : ""}`}>
                    <div
                      className={`w-2 h-2 rounded-full ${password.length >= 6 ? "bg-primary" : "bg-gray-300"}`}
                    ></div>
                    Al menos 6 caracteres
                  </li>
                  <li className={`flex items-center gap-2 ${/(?=.*[a-z])/.test(password) ? "text-primary/70" : ""}`}>
                    <div
                      className={`w-2 h-2 rounded-full ${/(?=.*[a-z])/.test(password) ? "bg-primary" : "bg-gray-300"}`}
                    ></div>
                    Una letra minúscula
                  </li>
                  <li className={`flex items-center gap-2 ${/(?=.*[A-Z])/.test(password) ? "text-primary/70" : ""}`}>
                    <div
                      className={`w-2 h-2 rounded-full ${/(?=.*[A-Z])/.test(password) ? "bg-primary" : "bg-gray-300"}`}
                    ></div>
                    Una letra mayúscula
                  </li>
                  <li className={`flex items-center gap-2 ${/(?=.*\d)/.test(password) ? "text-primary/70" : ""}`}>
                    <div
                      className={`w-2 h-2 rounded-full ${/(?=.*\d)/.test(password) ? "bg-primary" : "bg-gray-300"}`}
                    ></div>
                    Un número
                  </li>
                </ul>
              </div>

              {/* Message */}
              {message && (
                <Alert
                  variant={message.type === "error" ? "destructive" : "default"}
                  className={message.type === "success" ? "border-primary/20 bg-primary/50" : ""}
                >
                  {message.type === "error" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                  <AlertDescription className={message.type === "success" ? "text-primary/80" : ""}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Actualizar Contraseña
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
)}
