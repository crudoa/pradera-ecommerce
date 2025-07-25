import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { AppError } from "@/lib/errors/app-error"
import { logger } from "@/lib/utils/logger"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

export type AdminRole = "user" | "admin" | "super_admin"

export interface AdminUser {
  id: string
  email: string
  full_name: string | null
  role: AdminRole // Corrected: Use 'role' as per your database schema
  created_at: string
  updated_at: string
}

export interface AdminSession {
  id: string
  user_id: string
  session_token: string
  ip_address?: string
  user_agent?: string
  expires_at: string
  is_active: boolean
  created_at: string
  last_activity: string
}

export interface AdminActivityLog {
  id: string
  user_id: string
  action: string
  resource?: string
  resource_id?: string
  details?: any
  ip_address?: string
  user_agent?: string
  created_at: string
}

// This function is designed to be used in server-side contexts (Route Handlers, Server Actions)
// where a service role client can be safely used.
export async function verifyAdmin(
  supabaseClient: SupabaseClient<Database>,
): Promise<{ isAdmin: boolean; error?: AppError }> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError) {
      logger.error("Error fetching user for admin check:", userError.message)
      return { isAdmin: false, error: new AppError("Authentication failed", 401) }
    }

    if (!user) {
      return { isAdmin: false, error: new AppError("User not authenticated", 401) }
    }

    // Check if the user has the 'admin' or 'super_admin' role in user_profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      logger.error("Error fetching user profile for admin check:", profileError.message)
      return { isAdmin: false, error: new AppError("Failed to retrieve user profile", 500) }
    }

    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      return { isAdmin: false, error: new AppError("Access denied: Not an admin", 403) }
    }

    return { isAdmin: true }
  } catch (err) {
    logger.error("Unexpected error in verifyAdmin:", err)
    return { isAdmin: false, error: new AppError("Internal server error during admin check", 500) }
  }
}

export class AdminAuthService {
  /**
   * Checks if a user has 'admin' or 'super_admin' role based on user_profiles.role.
   * @param userId The ID of the user to check.
   * @param supabaseClient An optional Supabase client instance. If not provided, a new one will be created.
   * @returns True if the user has an admin role, false otherwise.
   */
  static async checkAdminRole(userId: string, supabaseClient?: any): Promise<boolean> {
    const supabase = supabaseClient || (await createClient())

    const { data: profile, error } = await supabase.from("user_profiles").select("role").eq("id", userId).single()

    if (error) {
      console.error("Error checking admin role:", error)
      return false
    }

    return profile?.role === "admin" || profile?.role === "super_admin"
  }

  /**
   * Verifica si el usuario actual es administrador
   */
  static async isCurrentUserAdmin(): Promise<{ isAdmin: boolean; user?: AdminUser; error?: string }> {
    try {
      // Use the shared server-side client helper
      const supabase = await createClient()

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      console.log("AdminAuthService.isCurrentUserAdmin: Supabase auth.getUser() result:")
      console.log("User:", user)
      console.log("Auth Error:", authError)

      if (authError || !user) {
        return { isAdmin: false, error: authError?.message || "Usuario no autenticado" }
      }

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id, full_name, email, role, created_at, updated_at") // Explicitly select columns for AdminUser
        .eq("id", user.id)
        .single()

      console.log("AdminAuthService.isCurrentUserAdmin: User profile result:")
      console.log("Profile:", profile)
      console.log("Profile Error:", profileError)

      if (profileError || !profile) {
        return { isAdmin: false, error: profileError?.message || "Perfil de usuario no encontrado" }
      }

      const isAdmin = profile.role === "admin" || profile.role === "super_admin"

      return {
        isAdmin,
        user: isAdmin ? (profile as AdminUser) : undefined,
      }
    } catch (error: any) {
      console.error("Error checking admin status:", error)
      return { isAdmin: false, error: error.message }
    }
  }

  /**
   * Obtiene todos los usuarios con roles administrativos
   */
  static async getAdminUsers(): Promise<{ users: AdminUser[]; error?: string }> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .in("role", ["admin", "super_admin"])
        .order("created_at", { ascending: false })

      if (error) {
        return { users: [], error: error.message }
      }

      return { users: data as AdminUser[] }
    } catch (error: any) {
      console.error("Error fetching admin users:", error)
      return { users: [], error: error.message }
    }
  }

  /**
   * Actualiza el rol de un usuario
   */
  static async updateUserRole(userId: string, newRole: AdminRole): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient()
      // Verificar que el usuario actual es super_admin
      const { isAdmin, user } = await this.isCurrentUserAdmin()
      if (!isAdmin || user?.role !== "super_admin") {
        return { success: false, error: "Solo super administradores pueden cambiar roles" }
      }

      const { error } = await supabase
        .from("user_profiles")
        .update({
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        return { success: false, error: error.message }
      }

      // Log de la actividad
      await this.logActivity("role_updated", "user", userId, { new_role: newRole })

      return { success: true }
    } catch (error: any) {
      console.error("Error updating user role:", error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Registra actividad administrativa
   */
  static async logActivity(action: string, resource?: string, resourceId?: string, details?: any): Promise<void> {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from("admin_activity_logs").insert({
        user_id: user.id,
        action,
        resource,
        resource_id: resourceId,
        details,
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error logging admin activity:", error)
    }
  }

  /**
   * Obtiene logs de actividad administrativa
   */
  static async getActivityLogs(limit = 50): Promise<{ logs: AdminActivityLog[]; error?: string }> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("admin_activity_logs")
        .select(`*,
        user_profiles!admin_activity_logs_user_id_fkey(email, full_name)
      `)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        return { logs: [], error: error.message }
      }

      return { logs: data as AdminActivityLog[] }
    } catch (error: any) {
      console.error("Error fetching activity logs:", error)
      return { logs: [], error: error.message }
    }
  }

  /**
   * Crea una sesión administrativa segura
   */
  static async createAdminSession(): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: "Usuario no autenticado" }
      }

      const { isAdmin } = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        return { success: false, error: "Acceso denegado: se requieren permisos de administrador" }
      }

      // Generar token de sesión único
      const sessionToken = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 8) // 8 horas de duración

      const { error } = await supabase.from("admin_sessions").insert({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Log de la actividad
      await this.logActivity("admin_session_created")

      return { success: true, sessionToken }
    } catch (error: any) {
      console.error("Error creating admin session:", error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Valida una sesión administrativa
   */
  static async validateAdminSession(
    sessionToken: string,
  ): Promise<{ valid: boolean; user?: AdminUser; error?: string }> {
    try {
      const supabase = await createClient()
      const { data: session, error } = await supabase
        .from("admin_sessions")
        .select(`*,
        user_profiles!admin_sessions_user_id_fkey(*)
      `)
        .eq("session_token", sessionToken)
        .eq("is_active", true)
        .gte("expires_at", new Date().toISOString())
        .single()

      if (error || !session) {
        return { valid: false, error: "Sesión inválida o expirada" }
      }

      // Actualizar última actividad
      await supabase.from("admin_sessions").update({ last_activity: new Date().toISOString() }).eq("id", session.id)

      return {
        valid: true,
        user: session.user_profiles as AdminUser,
      }
    } catch (error: any) {
      console.error("Error validating admin session:", error)
      return { valid: false, error: error.message }
    }
  }
}

// Keeping AdminAuthService for backward compatibility if other parts of the app use it,
// but recommending `verifyAdmin` for new server-side checks.
export const AdminAuthServiceForCompatibility = {
  async isCurrentUserAdmin(): Promise<{ isAdmin: boolean; error?: AppError }> {
    const supabase = await createServiceRoleClient()
    return verifyAdmin(supabase)
  },
}
