"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { TermsModal } from "@/components/legal/terms-modal"
import { PrivacyModal } from "@/components/legal/privacy-modal"

// Funciones de validación
const validateName = (name: string): string | null => {
  if (!name.trim()) return "Este campo es obligatorio"
  if (name.trim().length < 2) return "Debe tener al menos 2 caracteres"
  if (name.trim().length > 50) return "No puede tener más de 50 caracteres"
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name.trim())) return "Solo se permiten letras y espacios"
  if (/^\s*[a-zA-Z]\s*$/.test(name.trim())) return "Ingresa un nombre válido"
  return null
}

const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) return null // Opcional
  if (!/^\d{9}$/.test(phone.trim())) return "Debe tener exactamente 9 dígitos"
  if (/^(\d)\1{8}$/.test(phone.trim())) return "Ingresa un número de teléfono válido"
  if (!phone.trim().startsWith("9")) return "Debe comenzar con 9"
  return null
}

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (error) setError(null)
    if (success) setSuccess(null)
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    const firstNameError = validateName(formData.firstName)
    if (firstNameError) errors.firstName = firstNameError

    const lastNameError = validateName(formData.lastName)
    if (lastNameError) errors.lastName = lastNameError

    if (!formData.email.trim()) {
      errors.email = "El email es obligatorio"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Ingresa un email válido"
    }

    const phoneError = validatePhone(formData.phone)
    if (phoneError) errors.phone = phoneError

    if (!formData.password) {
      errors.password = "La contraseña es obligatoria"
    } else if (formData.password.length < 6) {
      errors.password = "Debe tener al menos 6 caracteres"
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setError("Por favor corrige los errores en el formulario")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("🔑 Attempting registration for:", formData.email)

      const result = await register({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
      })

      if (result.success) {
        console.log("✅ Registration successful")
        if (result.needsEmailConfirmation) {
          setSuccess("¡Registro exitoso! Por favor, verifica tu email para iniciar sesión.")
          setTimeout(() => {
            router.push("/login?message=verify-email") // Redirect to login with a message
          }, 1500)
        } else {
          // This case should ideally not happen if emailRedirectTo is set
          setSuccess("¡Cuenta creada exitosamente! Redirigiendo...")
          setTimeout(() => {
            router.push("/")
            router.refresh()
          }, 1500)
        }
      } else {
        let errorMessage = "Error al crear la cuenta"
        let actualErrorMessage: string | undefined

        if (typeof result.error === "string") {
          actualErrorMessage = result.error
        } else if (result.error && typeof result.error === "object" && "message" in result.error) {
          actualErrorMessage = (result.error as { message: string }).message
        }

        if (actualErrorMessage) {
          if (actualErrorMessage.includes("User already registered")) {
            errorMessage = "Este email ya está registrado. Intenta iniciar sesión."
          } else if (actualErrorMessage.includes("Password should be at least")) {
            errorMessage = "La contraseña debe tener al menos 6 caracteres"
          } else if (actualErrorMessage.includes("Invalid email")) {
            errorMessage = "El formato del email no es válido"
          } else {
            errorMessage = actualErrorMessage
          }
        }
        setError(errorMessage)
      }
    } catch (err: any) {
      console.error("❌ Unexpected registration error:", err)

      let errorMessage = "Error al crear la cuenta"
      if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
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
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900">Crear Cuenta</h2>{" "}
          {/* Adjusted font size */}
          <p className="mt-2 text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/90">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
        {/* Form */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            {" "}
            {/* Adjusted padding */}
            <CardTitle className="text-xl sm:text-2xl">Únete a Pradera</CardTitle> {/* Adjusted font size */}
            <CardDescription className="text-sm sm:text-base">Completa tus datos para crear tu cuenta</CardDescription>{" "}
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
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {" "}
                {/* Stack on mobile, 2 columns on sm+ */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className={`pl-10 h-10 ${fieldErrors.firstName ? "border-red-500" : ""}`} // Ensure consistent height
                      placeholder="Nombre"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  {fieldErrors.firstName && <p className="text-sm text-red-600">{fieldErrors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className={`pl-10 h-10 ${fieldErrors.lastName ? "border-red-500" : ""}`} // Ensure consistent height
                      placeholder="Apellido"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  {fieldErrors.lastName && <p className="text-sm text-red-600">{fieldErrors.lastName}</p>}
                </div>
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
                    className={`pl-10 h-10 ${fieldErrors.email ? "border-red-500" : ""}`} // Ensure consistent height
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>
                {fieldErrors.email && <p className="text-sm text-red-600">{fieldErrors.email}</p>}
              </div>
              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`pl-10 h-10 ${fieldErrors.phone ? "border-red-500" : ""}`} // Ensure consistent height
                    placeholder="987654321"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>
                {fieldErrors.phone && <p className="text-sm text-red-600">{fieldErrors.phone}</p>}
                <p className="text-xs text-gray-500">Formato: 9 dígitos, comenzando con 9</p>
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
                    autoComplete="new-password"
                    required
                    className={`pl-10 pr-10 h-10 ${fieldErrors.password ? "border-red-500" : ""}`} // Ensure consistent height
                    placeholder="Mínimo 6 caracteres"
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
                {fieldErrors.password && <p className="text-sm text-red-600">{fieldErrors.password}</p>}
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
                    autoComplete="new-password"
                    required
                    className={`pl-10 pr-10 h-10 ${fieldErrors.confirmPassword ? "border-red-500" : ""}`} // Ensure consistent height
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2 h-5 w-5 text-gray-400 hover:text-gray-600 flex items-center justify-center" // Adjusted size and centering
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{" "}
                    {/* Adjusted icon size */}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>}
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
                  <CheckCircle className="h-4 w-4 text-black" />
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
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
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
            Al crear una cuenta, aceptas nuestros{" "}
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
