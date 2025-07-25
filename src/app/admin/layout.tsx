import type React from "react"
import { AdminGuard } from "@/components/admin/admin-guard"
import AdminNavbar from "@/components/layout/admin-navbar"
import { AdminAuthService } from "@/lib/auth/admin-auth"

export default async function AdminOrdersLayout({ children }: { children: React.ReactNode }) {
  // Obtener el estado de autenticación del administrador en el servidor
  const { isAdmin, user, error } = await AdminAuthService.isCurrentUserAdmin()

  // Ensure user and error are explicitly null if they are undefined
  const initialAuthStatus = {
    isAdmin,
    user: user || null,
    error: error || null,
  }

  return (
    <AdminGuard initialAuthStatus={initialAuthStatus}>
      <div className="flex min-h-screen w-full flex-col">
        <AdminNavbar />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">{children}</main>
      </div>
    </AdminGuard>
  )
}
