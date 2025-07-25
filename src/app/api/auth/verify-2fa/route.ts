import { type NextRequest, NextResponse } from "next/server"
import { DatabaseAuthService } from "@/lib/auth/database-auth-service"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    if (!email || !code) {
      return NextResponse.json({ success: false, error: "Email y código son requeridos" }, { status: 400 })
    }

    // Verificar código 2FA
    const result = await DatabaseAuthService.verify2FA(email, code)

    if (!result.success) {
      return NextResponse.json(result, { status: 401 })
    }

    // Crear sesión en Supabase
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    // Obtener usuario para crear sesión
    const { data: profile } = await supabase.from("user_profiles").select("*").eq("email", email).single()

    if (!profile) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 })
    }

    // Log evento de seguridad
    await DatabaseAuthService.logSecurityEvent(
      profile.id,
      "2fa_success",
      {
        method: result.usedBackupCode ? "backup_code" : "totp",
        backup_code_used: result.usedBackupCode,
      },
      ip,
      userAgent,
    )

    return NextResponse.json({
      success: true,
      message: "2FA verificado correctamente",
    })
  } catch (error) {
    console.error("2FA verification API error:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
