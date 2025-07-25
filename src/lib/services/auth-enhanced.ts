import { EmailService } from "./email-service"
import { DatabaseConnection } from "@/lib/database/connection" // Import DatabaseConnection
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database" // Updated import path

interface AuthResult {
  success: boolean
  error?: string | { message: string }
  message?: string
  data?: any
  user?: any // Add user property for successful sign-up/sign-in
  needsEmailConfirmation?: boolean
  profile?: any // Add profile property for successful sign-in
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface LoginData {
  email: string
  password: string
}

export class AuthEnhancedService {
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

  // Registro con email de bienvenida
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      console.log("🚀 AuthEnhanced: Iniciando registro para", data.email)

      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            full_name: `${data.firstName} ${data.lastName}`,
            phone: data.phone,
          },
        },
      })

      if (authError) {
        console.error("❌ Error en Supabase Auth:", authError)
        return { success: false, error: authError.message }
      }

      if (!authData.user) {
        return { success: false, error: "No se pudo crear el usuario" }
      }

      console.log("✅ Usuario creado en Auth:", authData.user.id)

      // 2. Crear perfil de usuario en la tabla user_profiles
      const profileData = {
        id: authData.user.id,
        email: data.email,
        full_name: `${data.firstName} ${data.lastName}`,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone || null,
        address: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: profile, error: profileError } = await DatabaseConnection.getInstance().insert(
        "user_profiles",
        profileData,
      )

      if (profileError) {
        console.error("❌ Error creando perfil:", profileError)
        // Si falla el perfil, no eliminamos el usuario de Auth
        // porque Supabase maneja esto automáticamente
      } else {
        console.log("✅ Perfil creado exitosamente:", profile)
      }

      // 3. Enviar email de bienvenida (no bloquear el registro si falla)
      try {
        await EmailService.sendWelcomeEmail(data.email, `${data.firstName} ${data.lastName}`)
        console.log("✅ Email de bienvenida enviado")
      } catch (emailError) {
        console.error("⚠️ Error enviando email de bienvenida:", emailError)
        // No fallar el registro por el email
      }

      return { success: true, user: authData.user, needsEmailConfirmation: !authData.user.email_confirmed_at }
    } catch (error: any) {
      console.error("❌ Error inesperado en register:", error)
      return { success: false, error: "Error interno del servidor" }
    }
  }

  // Login mejorado
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log("🔐 AuthEnhanced: Iniciando login para", email)

      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (authError) {
        console.error("❌ Error en login:", authError)

        // Mensajes de error más específicos
        let errorMessage = "Credenciales inválidas"

        if (authError.message.includes("Invalid login credentials")) {
          errorMessage = "Email o contraseña incorrectos"
        } else if (authError.message.includes("Email not confirmed")) {
          errorMessage = "Por favor confirma tu email antes de iniciar sesión"
        } else if (authError.message.includes("Too many requests")) {
          errorMessage = "Demasiados intentos. Intenta de nuevo en unos minutos"
        }

        return { success: false, error: errorMessage }
      }

      if (!authData.user) {
        return { success: false, error: "No se pudo autenticar el usuario" }
      }

      console.log("✅ Usuario autenticado:", authData.user.id)

      // Obtener perfil del usuario
      const { data: profile, error: profileError } = await DatabaseConnection.getInstance().findById(
        "user_profiles",
        authData.user.id,
      )

      if (profileError) {
        console.error("❌ Error obteniendo perfil:", profileError)
        // Crear perfil si no existe
        const profileData = {
          id: authData.user.id,
          email: authData.user.email!,
          full_name: authData.user.user_metadata?.full_name || authData.user.email!,
          first_name: authData.user.user_metadata?.first_name || "",
          last_name: authData.user.user_metadata?.last_name || "",
          phone: authData.user.user_metadata?.phone || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { data: newProfile } = await DatabaseConnection.getInstance().insert("user_profiles", profileData)

        return { success: true, user: authData.user, profile: newProfile }
      }

      console.log("✅ Login exitoso para:", profile.email)
      return { success: true, user: authData.user, profile }
    } catch (error: any) {
      console.error("❌ Error inesperado en login:", error)
      return { success: false, error: "Error interno del servidor" }
    }
  }

  // Recuperación de contraseña mejorada
  async requestPasswordReset(email: string): Promise<AuthResult> {
    try {
      console.log("🔄 AuthEnhanced: Solicitando reset de contraseña para", email)

      // Verificar que el usuario existe
      const { data: profile } = await DatabaseConnection.getInstance().query("user_profiles", {
        filter: { email },
        select: "email, full_name",
      })

      if (!profile || profile.length === 0) {
        // Por seguridad, no revelamos si el email existe o no
        return { success: true, message: "Si el email existe, recibirás un enlace de recuperación" }
      }

      const resetUrl = `${window.location.origin}/reset-password`

      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      })

      if (error) {
        console.error("❌ Error enviando reset:", error)

        let errorMessage = "Error al enviar el email de recuperación"

        if (error.message.includes("Email rate limit exceeded")) {
          errorMessage = "Has solicitado demasiados emails. Intenta de nuevo en unos minutos"
        }

        return { success: false, error: errorMessage }
      }

      // Enviar email personalizado (opcional, Supabase ya envía uno)
      try {
        await EmailService.sendPasswordResetEmail(email, resetUrl)
        console.log("✅ Email de recuperación personalizado enviado")
      } catch (emailError) {
        console.error("⚠️ Error enviando email personalizado:", emailError)
        // No fallar la operación por esto
      }

      console.log("✅ Email de reset enviado exitosamente")
      return { success: true, message: "Email de recuperación enviado exitosamente" }
    } catch (error: any) {
      console.error("❌ Error inesperado en requestPasswordReset:", error)
      return { success: false, error: "Error interno del servidor" }
    }
  }

  // Actualizar contraseña
  async updatePassword(newPassword: string): Promise<AuthResult> {
    try {
      console.log("🔐 AuthEnhanced: Actualizando contraseña")

      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        console.error("❌ Error actualizando contraseña:", error)

        let errorMessage = "Error al actualizar la contraseña"

        if (error.message.includes("Password should be at least")) {
          errorMessage = "La contraseña debe tener al menos 6 caracteres"
        } else if (error.message.includes("Same password")) {
          errorMessage = "La nueva contraseña debe ser diferente a la actual"
        }

        return { success: false, error: errorMessage }
      }

      console.log("✅ Contraseña actualizada exitosamente")
      return { success: true }
    } catch (error: any) {
      console.error("❌ Error inesperado en updatePassword:", error)
      return { success: false, error: "Error interno del servidor" }
    }
  }

  // Reenviar email de confirmación
  async resendConfirmationEmail(email: string): Promise<AuthResult> {
    try {
      console.log("📧 AuthEnhanced: Reenviando email de confirmación para", email)

      const { error } = await this.supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (error) {
        console.error("❌ Error reenviando confirmación:", error)
        return { success: false, error: error.message }
      }

      console.log("✅ Email de confirmación reenviado")
      return { success: true }
    } catch (error: any) {
      console.error("❌ Error inesperado en resendConfirmationEmail:", error)
      return { success: false, error: "Error interno del servidor" }
    }
  }

  async signOut(): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) {
        console.error("AuthEnhancedService: Sign-out error:", error)
        return { success: false, error: error.message }
      }
      return { success: true, message: "Signed out successfully." }
    } catch (err: any) {
      console.error("AuthEnhancedService: Unexpected sign-out error:", err)
      return { success: false, error: err.message || "An unexpected error occurred during sign-out." }
    }
  }
}
