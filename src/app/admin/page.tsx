"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database"

export default function AdminDashboardPage() {
  const { user, isAdmin, isLoading } = useAuth() // Corrected destructuring
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const [totalUsers, setTotalUsers] = useState<number | null>(null)
  const [totalProducts, setTotalProducts] = useState<number | null>(null)
  const [totalOrders, setTotalOrders] = useState<number | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true)
      try {
        // Fetch total users
        const { count: usersCount, error: usersError } = await supabase
          .from("user_profiles") // Corrected table name
          .select("*", { count: "exact", head: true })
        if (usersError) throw usersError
        setTotalUsers(usersCount)

        // Fetch total products
        const { count: productsCount, error: productsError } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
        if (productsError) throw productsError
        setTotalProducts(productsCount)

        // Fetch total orders
        const { count: ordersCount, error: ordersError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
        if (ordersError) throw ordersError
        setTotalOrders(ordersCount)
      } catch (error: any) {
        console.error("Error fetching admin stats:", error.message)
      } finally {
        setLoadingStats(false)
      }
    }

    if (isAdmin) {
      fetchStats()
    }
  }, [isAdmin, supabase])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-3 text-lg text-gray-700">Cargando panel de administración...</p>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
        <p className="text-gray-700 mb-6">No tienes permisos de administrador para acceder a esta página.</p>
        <Button onClick={() => router.push("/login")}>Ir a Iniciar Sesión</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mx-auto px-8 py-2">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Opciones de Administrador</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87m-3-12a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              ) : (
                <div className="text-2xl font-bold">{totalUsers !== null ? totalUsers : "N/A"}</div>
              )}
              <p className="text-xs text-muted-foreground">Usuarios registrados en la plataforma</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2" />
              </svg>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              ) : (
                <div className="text-2xl font-bold">{totalProducts !== null ? totalProducts : "N/A"}</div>
              )}
              <p className="text-xs text-muted-foreground">Productos disponibles en la tienda</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Órdenes</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2h.01" />
                <path d="M16 16h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                <path d="M12 16v4" />
                <path d="M12 12v4" />
                <path d="M12 8v4" />
                <path d="M12 4v4" />
                <path d="M12 20v4" />
              </svg>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              ) : (
                <div className="text-2xl font-bold">{totalOrders !== null ? totalOrders : "N/A"}</div>
              )}
              <p className="text-xs text-muted-foreground">Órdenes procesadas hasta la fecha</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Gestiona el inventario, añade nuevos productos, edita los existentes o realiza cargas masivas.
              </p>
              <Button onClick={() => router.push("/admin/products/bulk-upload")}>Gestionar Productos</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gestión de Órdenes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Revisa y actualiza el estado de las órdenes, gestiona envíos y devoluciones.
              </p>
              <Button onClick={() => router.push("/admin/orders")} >
                Gestionar Órdenes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Administra las cuentas de usuario, roles y permisos.</p>
              <Button onClick={() => router.push("/admin/users")} disabled>
                Gestionar Usuarios (Próximamente)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analíticas y Reportes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Visualiza métricas clave y genera reportes para entender el rendimiento de tu tienda.
              </p>
              <Button onClick={() => router.push("/admin/analytics")} disabled>
                Ver Analíticas (Próximamente)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
