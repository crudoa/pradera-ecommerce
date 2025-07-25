"use client"

import type React from "react"
import { Home } from "lucide-react" // Import Home component
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import type { AdminUser } from "@/lib/auth/admin-auth"
import Link from "next/link"

interface AdminGuardProps {
  children: React.ReactNode
  initialAuthStatus: {
    isAdmin: boolean
    user: AdminUser | null
    error: string | null
  }
  requiredRole?: "admin" | "super_admin" // Optional: specify a higher required role
}

export function AdminGuard({ children, initialAuthStatus, requiredRole = "admin" }: AdminGuardProps) {
  const router = useRouter()

  // Determine initial authorization state immediately
  const [isAuthorized, setIsAuthorized] = useState(initialAuthStatus.isAdmin)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(initialAuthStatus.user)
  const [error, setError] = useState<string | null>(initialAuthStatus.error)

  useEffect(() => {
    // This useEffect runs on the client after initial render.
    // It's primarily for refining permissions if a specific requiredRole is set,
    // or for handling client-side changes if the initial server-side check was insufficient.

    // If initialAuthStatus already indicates an error or lack of admin rights,
    // we don't need to do further checks here for initial display.
    if (!initialAuthStatus.isAdmin && initialAuthStatus.error) {
      setError(initialAuthStatus.error)
      setIsAuthorized(false)
      return // Exit early if already determined as unauthorized with an error
    }

    // If initially authorized, check the specific role if required
    if (initialAuthStatus.isAdmin) {
      if (requiredRole === "super_admin" && adminUser?.role !== "super_admin") {
        setError("Acceso denegado: Se requiere rol de Super Administrador.")
        setIsAuthorized(false)
      } else {
        setIsAuthorized(true)
      }
    } else {
      // If initialAuthStatus.isAdmin is false but no error was provided by server,
      // it means the user is simply not an admin. Provide a generic message.
      setError("Usuario no autenticado o no autorizado.")
      setIsAuthorized(false)
    }
  }, [initialAuthStatus, requiredRole, adminUser])

  if (isAuthorized) {
    return <>{children}</>
  }

  // If not authorized, display the restricted access message
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8 text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold text-red-600">Acceso Restringido</CardTitle>
          <CardDescription className="text-gray-600">
            {error ? (
              <div className="flex items-center justify-center gap-2 text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            ) : (
              "Esta área está restringida a administradores autorizados."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500">Si crees que esto es un error, contacta al administrador del sistema.</p>
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Volver
            </Button>
            <Link href="/" passHref>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">Ir a Inicio</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
