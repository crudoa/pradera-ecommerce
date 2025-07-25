"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { TermsModal } from "@/components/legal/terms-modal"
import { PrivacyModal } from "@/components/legal/privacy-modal"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, isLoading } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const message = searchParams.get("message")
    if (message === "password-updated") {
      setSuccess("¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión con tu nueva contraseña.")
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (error) setError(null)
    if (success && searchParams.get("message") !== "password-updated") setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email.trim() || !formData.password) {
      setError("Por favor completa todos los campos")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("🔑 Attempting login for:", formData.email)

      const result = await signIn(formData.email.trim(), formData.password)

      if (result.success) {
        console.log("✅ Login successful")
        setSuccess("¡Inicio de sesión exitoso! Redirigiendo...")

        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 1500)
      } else {
        let errorMessage = "Error al iniciar sesión"
        let actualErrorMessage: string | undefined

        if (typeof result.error === "string") {
          actualErrorMessage = result.error
        } else if (result.error && typeof result.error === "object" && "message" in result.error) {
          actualErrorMessage = (result.error as { message: string }).message
        }

        if (actualErrorMessage) {
          if (actualErrorMessage.includes("Invalid login credentials")) {
            errorMessage = "Email o contraseña incorrectos"
          } else if (actualErrorMessage.includes("Email not confirmed")) {
            errorMessage = "Por favor confirma tu email antes de iniciar sesión"
          } else if (actualErrorMessage.includes("Too many requests")) {
            errorMessage = "Demasiados intentos. Intenta de nuevo más tarde"
          } else {
            errorMessage = actualErrorMessage
          }
        }
        setError(errorMessage)
      }
    } catch (err: any) {
      console.error("❌ Login error:", err)
      setError(err.message || "Ocurrió un error inesperado al iniciar sesión.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      {" "}
      {/* Adjusted py and px for mobile */}
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {" "}
        {/* Adjusted space-y for mobile */}
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/images/pradera-logo.png"
              alt="Pradera Servicios Generales E.I.R.L. Logo"
              width={180} // Adjusted width for mobile
              height={54} // Adjusted height for mobile
              priority
            />
          </Link>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900">Iniciar Sesión</h2>{" "}
          {/* Adjusted font size */}
          <p className="mt-2 text-sm text-gray-600">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="font-medium text-primary hover:text-primary/90">
              Regístrate aquí
            </Link>
          </p>
        </div>
        {/* Form */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            {" "}
            {/* Adjusted padding */}
            <CardTitle className="text-xl sm:text-2xl">Bienvenido de vuelta</CardTitle> {/* Adjusted font size */}
            <CardDescription className="text-sm sm:text-base">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>{" "}
            {/* Adjusted font size */}
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {" "}
            {/* Adjusted padding */}
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {" "}
              {/* Adjusted space-y */}
              {/* Botón de Inicio */}
              <div className="flex justify-center">
                <Link href="/">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent w-full sm:w-auto"
                  >
                    {" "}
                    {/* Full width on mobile */}
                    <Home className="h-4 w-4" />
                    Volver a Inicio
                  </Button>
                </Link>
              </div>
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10 h-10" // Ensure consistent height
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="pl-10 pr-10 h-10" // Ensure consistent height
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2 h-5 w-5 text-gray-400 hover:text-gray-600 flex items-center justify-center" // Adjusted size and centering
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{" "}
                    {/* Adjusted icon size */}
                  </button>
                </div>
              </div>
              {/* Forgot Password */}
              <div className="flex items-center justify-end">
                <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/90">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {/* Success Alert */}
              {success && (
                <Alert className="border-primary/20 bg-primary/50">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-black">{success}</AlertDescription>
                </Alert>
              )}
              {/* Submit Button */}
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-10" disabled={isSubmitting}>
                {" "}
                {/* Ensure consistent height */}
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        {/* Footer con Términos y Privacidad */}
        <div className="text-center text-xs sm:text-sm text-gray-500 px-2">
          {" "}
          {/* Adjusted font size and padding */}
          <p>
            Al iniciar sesión, aceptas nuestros{" "}
            <TermsModal>
              <span className="text-primary hover:text-primary/90 underline cursor-pointer">Términos de Servicio</span>
            </TermsModal>{" "}
            y{" "}
            <PrivacyModal>
              <span className="text-primary hover:text-primary/90 underline cursor-pointer">
                Política de Privacidad
              </span>
            </PrivacyModal>
          </p>
        </div>
      </div>
    </div>
  )
}
