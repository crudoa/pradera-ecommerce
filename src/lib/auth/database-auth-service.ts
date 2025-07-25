// Refactored to use DatabaseConnection for generic operations.
import { supabase } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { DatabaseConnection } from "@/lib/database/connection" // Import DatabaseConnection

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
  requiresTwoFactor?: boolean
  requires2FA?: boolean
  usedBackupCode?: boolean
}

export interface SecurityEvent {
  userId: string
  event: string
  metadata: Record<string, any>
  ipAddress: string
  userAgent: string
}

export class DatabaseAuthService {
  private static client = supabase
  private static db = DatabaseConnection.getInstance() // Use the singleton DatabaseConnection

  /**
   * Verifica las credenciales de un usuario
   */
  static async verifyCredentials(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<AuthResult> {
    try {
      console.log("🔐 Verificando credenciales para:", email)

      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("❌ Error de autenticación:", error)

        // Log del intento fallido
        await this.logSecurityEvent(
          "unknown",
          "login_failed",
          {
            email,
            error: error.message,
          },
          ipAddress,
          userAgent,
        )

        return {
          success: false,
          error: error.message,
        }
      }

      if (data.user) {
        console.log("✅ Credenciales verificadas exitosamente")

        // Log del login exitoso
        await this.logSecurityEvent(
          data.user.id,
          "login_success",
          {
            method: "password",
          },
          ipAddress,
          userAgent,
        )

        return {
          success: true,
          user: data.user,
          requires2FA: false, // Por ahora no implementamos 2FA
        }
      }

      return {
        success: false,
        error: "Credenciales inválidas",
      }
    } catch (error: any) {
      console.error("❌ Error inesperado en verifyCredentials:", error)
      return {
        success: false,
        error: "Error interno del servidor",
      }
    }
  }

  /**
   * Verifica el código 2FA
   */
  static async verify2FA(email: string, code: string): Promise<AuthResult> {
    try {
      console.log("🔐 Verificando código 2FA para:", email)

      // Simulación de verificación 2FA
      // En una implementación real, verificarías el código contra tu sistema 2FA
      if (code === "123456") {
        return {
          success: true,
          usedBackupCode: false,
        }
      }

      // Verificar si es un código de respaldo (8 dígitos)
      if (code.length === 8 && /^\d{8}$/.test(code)) {
        return {
          success: true,
          usedBackupCode: true,
        }
      }

      return {
        success: false,
        error: "Código 2FA inválido",
      }
    } catch (error: any) {
      console.error("❌ Error en verify2FA:", error)
      return {
        success: false,
        error: "Error interno del servidor",
      }
    }
  }

  /**
   * Registra un evento de seguridad
   */
  static async logSecurityEvent(
    userId: string,
    event: string,
    metadata: Record<string, any>,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    try {
      console.log("📝 Registrando evento de seguridad:", {
        userId,
        event,
        metadata,
        ipAddress,
        userAgent,
      })

      // En una implementación real, guardarías esto en una tabla de logs de seguridad
      // Por ahora solo lo logueamos en consola ya que no tenemos tabla security_logs
      const securityEvent: SecurityEvent = {
        userId,
        event,
        metadata,
        ipAddress,
        userAgent,
      }

      console.log("🔒 Evento de seguridad registrado:", securityEvent)
    } catch (error) {
      console.error("❌ Error registrando evento de seguridad:", error)
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Obtiene el perfil de un usuario
   */
  static async getUserProfile(userId: string): Promise<{
    success: boolean
    profile?: any
    error?: string
  }> {
    const { data, error } = await this.db.findById("user_profiles", userId)

    if (error) {
      console.error("❌ Error obteniendo perfil:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      profile: data,
    }
  }

  /**
   * Actualiza el perfil de un usuario
   */
  static async updateUserProfile(
    userId: string,
    profileData: Record<string, any>,
  ): Promise<{
    success: boolean
    profile?: any
    error?: string
  }> {
    const { data, error } = await this.db.update("user_profiles", profileData, { id: userId })

    if (error) {
      console.error("❌ Error actualizando perfil:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      profile: data,
    }
  }

  /**
   * Verifica si un email ya está registrado
   */
  static async emailExists(email: string): Promise<boolean> {
    return this.db.exists("user_profiles", { email })
  }

  /**
   * Crea un perfil de usuario
   */
  static async createUserProfile(userData: {
    id: string
    email: string
    full_name: string
    phone?: string
  }): Promise<{
    success: boolean
    profile?: any
    error?: string
  }> {
    const profileData = {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      phone: userData.phone || null,
      address: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await this.db.insert("user_profiles", profileData)

    if (error) {
      console.error("❌ Error creando perfil:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      profile: data,
    }
  }
}

export default DatabaseAuthService
