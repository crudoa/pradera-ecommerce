"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image" // Import Image component
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setMessage({ type: "error", text: "Por favor ingresa tu email" })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      setEmailSent(true)
      setMessage({
        type: "success",
        text: "¡Email enviado! Revisa tu bandeja de entrada y spam para restablecer tu contraseña.",
      })
    } catch (error: any) {
      console.error("Error sending reset email:", error)
      setMessage({
        type: "error",
        text: error.message || "Error al enviar el email. Intenta de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      setMessage({
        type: "success",
        text: "Email reenviado exitosamente. Revisa tu bandeja de entrada.",
      })
    } catch (error: any) {
      setMessage({
        type: "error",
        text: "Error al reenviar el email. Intenta de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            {/* Replaced text logo with image logo */}
            <Image
              src="/images/pradera-logo.png"
              alt="Pradera Servicios Generales E.I.R.L. Logo"
              width={200}
              height={60}
              className="mx-auto"
            />
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {emailSent ? "Email Enviado" : "Recuperar Contraseña"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {emailSent
              ? "Sigue las instrucciones en tu email para restablecer tu contraseña"
              : "Ingresa tu email para recibir instrucciones de recuperación"}
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{emailSent ? "Revisa tu Email" : "Restablecer Contraseña"}</CardTitle>
            <CardDescription>
              {emailSent
                ? "Te hemos enviado un enlace para restablecer tu contraseña"
                : "Te enviaremos un enlace seguro para crear una nueva contraseña"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Back to Login */}
                <div className="flex justify-center">
                  <Link href="/login">
                    <Button type="button" variant="outline" className="flex items-center gap-2 bg-transparent">
                      <ArrowLeft className="h-4 w-4" />
                      Volver al Login
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
                      className="pl-10"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
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
                      <CheckCircle className="h-4 w-4 text-black" />
                    )}
                    <AlertDescription className={message.type === "success" ? "text-black" : ""}>
                      {message.text}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Enlace de Recuperación
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Success State */}
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Email Enviado Exitosamente</h3>
                  <p className="text-sm text-gray-600 mb-4">Hemos enviado un enlace de recuperación a:</p>
                  <p className="text-sm font-medium text-black bg-primary/50 px-3 py-2 rounded-md">{email}</p>
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
                      <CheckCircle className="h-4 w-4 text-black" />
                    )}
                    <AlertDescription className={message.type === "success" ? "text-black" : ""}>
                      {message.text}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Instructions */}
                <div className="bg-secondary/50 border border-secondary/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Próximos pasos:</h4>
                  <ol className="text-sm text-gray-800 space-y-1 list-decimal list-inside">
                    <li>Revisa tu bandeja de entrada</li>
                    <li>Si no lo encuentras, revisa la carpeta de spam</li>
                    <li>Haz clic en el enlace del email</li>
                    <li>Crea tu nueva contraseña</li>
                  </ol>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-3">
                  <Button
                    onClick={handleResendEmail}
                    variant="outline"
                    className="w-full bg-transparent"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Reenviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Reenviar Email
                      </>
                    )}
                  </Button>

                  <Link href="/login">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Volver al Login
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help */}
        <div className="text-center text-sm text-gray-500">
          <p>
            ¿Problemas para recuperar tu cuenta?{" "}
            <a href="mailto: pradera.sg@gmail.com" className="text-primary hover:text-primary/90">
              Contacta soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
