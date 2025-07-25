"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Shield, AlertTriangle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { PasswordValidator } from "@/lib/auth/password-validator"
import { RateLimiter } from "@/lib/auth/rate-limiter"

interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export function EnhancedLoginForm({ onSuccess, redirectTo = "/dashboard" }: LoginFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twoFactorCode: "",
    rememberMe: false,
  })

  const [ui, setUI] = useState({
    showPassword: false,
    isLoading: false,
    step: "credentials" as "credentials" | "2fa" | "locked",
    remainingAttempts: 5,
    lockoutTime: null as number | null,
  })

  const [validation, setValidation] = useState({
    email: { isValid: true, message: "" },
    password: { isValid: true, message: "" },
    twoFactor: { isValid: true, message: "" },
  })

  // Countdown para lockout
  useEffect(() => {
    if (ui.lockoutTime) {
      const interval = setInterval(() => {
        const remaining = ui.lockoutTime! - Date.now()
        if (remaining <= 0) {
          setUI((prev) => ({ ...prev, lockoutTime: null, step: "credentials" }))
          clearInterval(interval)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [ui.lockoutTime])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(email)

    setValidation((prev) => ({
      ...prev,
      email: {
        isValid,
        message: isValid ? "" : "Ingresa un email válido",
      },
    }))

    return isValid
  }

  const validatePassword = (password: string) => {
    const result = PasswordValidator.validate(password)

    setValidation((prev) => ({
      ...prev,
      password: {
        isValid: result.isValid,
        message: result.errors.join(", "),
      },
    }))

    return result.isValid
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Validación en tiempo real
    if (field === "email" && value) {
      validateEmail(value)
    } else if (field === "password" && value) {
      validatePassword(value)
    }
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(formData.email) || !validatePassword(formData.password)) {
      return
    }

    setUI((prev) => ({ ...prev, isLoading: true }))

    try {
      // Verificar rate limiting
      const rateLimitResult = await RateLimiter.checkLoginAttempt(
        formData.email,
        "user-ip", // En producción, obtener IP real
        navigator.userAgent,
      )

      if (!rateLimitResult.allowed) {
        if (rateLimitResult.resetTime) {
          setUI((prev) => ({
            ...prev,
            step: "locked",
            lockoutTime: rateLimitResult.resetTime!,
          }))
        }
        return
      }

      // Simular autenticación
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        if (result.requires2FA) {
          setUI((prev) => ({ ...prev, step: "2fa" }))
        } else {
          onSuccess?.()
          router.push(redirectTo)
        }
      } else {
        // Registrar intento fallido
        RateLimiter.recordFailedAttempt(formData.email, "user-ip", navigator.userAgent)

        setUI((prev) => ({
          ...prev,
          remainingAttempts: rateLimitResult.remainingAttempts - 1,
        }))
      }
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setUI((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUI((prev) => ({ ...prev, isLoading: true }))

    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          code: formData.twoFactorCode,
        }),
      })

      const result = await response.json()

      if (result.success) {
        onSuccess?.()
        router.push(redirectTo)
      } else {
        setValidation((prev) => ({
          ...prev,
          twoFactor: {
            isValid: false,
            message: "Código incorrecto",
          },
        }))
      }
    } catch (error) {
      console.error("2FA verification error:", error)
    } finally {
      setUI((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const formatLockoutTime = () => {
    if (!ui.lockoutTime) return ""

    const remaining = Math.max(0, ui.lockoutTime - Date.now())
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)

    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (ui.step === "locked") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-red-600">Cuenta Bloqueada Temporalmente</CardTitle>
          <CardDescription>Demasiados intentos de inicio de sesión fallidos</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-2xl font-mono font-bold text-red-600 mb-4">{formatLockoutTime()}</div>
          <p className="text-sm text-gray-600 mb-4">
            Por seguridad, tu cuenta ha sido bloqueada temporalmente. Podrás intentar nuevamente cuando termine el
            tiempo.
          </p>
          <Button
            variant="outline"
            onClick={() => setUI((prev) => ({ ...prev, step: "credentials" }))}
            disabled={!!ui.lockoutTime}
          >
            Volver al Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (ui.step === "2fa") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Verificación en Dos Pasos</CardTitle>
          <CardDescription>Ingresa el código de tu aplicación de autenticación</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handle2FASubmit} className="space-y-4">
            <div>
              <Label htmlFor="twoFactorCode">Código de 6 dígitos</Label>
              <Input
                id="twoFactorCode"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={formData.twoFactorCode}
                onChange={(e) => handleInputChange("twoFactorCode", e.target.value)}
                className={`text-center text-lg tracking-widest ${
                  !validation.twoFactor.isValid ? "border-red-500" : ""
                }`}
              />
              {!validation.twoFactor.isValid && (
                <p className="text-sm text-red-600 mt-1">{validation.twoFactor.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={ui.isLoading || formData.twoFactorCode.length !== 6}>
              {ui.isLoading ? "Verificando..." : "Verificar Código"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setUI((prev) => ({ ...prev, step: "credentials" }))}
            >
              Volver
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>Accede a tu cuenta de forma segura</CardDescription>

        {ui.remainingAttempts < 5 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Te quedan {ui.remainingAttempts} intentos antes del bloqueo</AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={!validation.email.isValid ? "border-red-500" : ""}
              disabled={ui.isLoading}
            />
            {!validation.email.isValid && <p className="text-sm text-red-600 mt-1">{validation.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={ui.showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`pr-10 ${!validation.password.isValid ? "border-red-500" : ""}`}
                disabled={ui.isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setUI((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
              >
                {ui.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!validation.password.isValid && <p className="text-sm text-red-600 mt-1">{validation.password.message}</p>}
          </div>

          {/* Security Features */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Conexión segura SSL</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Sesión 24h
            </Badge>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={ui.isLoading || !validation.email.isValid || !validation.password.isValid}
          >
            {ui.isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
