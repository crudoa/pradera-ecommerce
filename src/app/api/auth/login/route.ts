import { type NextRequest, NextResponse } from "next/server"
import  DatabaseAuthService  from "@/lib/auth/database-auth-service"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Obtener IP y User-Agent
    const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Validar entrada
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Verificar credenciales
    const result = await DatabaseAuthService.verifyCredentials(email, password, ip, userAgent)

    if (!result.success) {
      return NextResponse.json(result, { status: 401 })
    }

    // Si requiere 2FA, no crear sesión aún
    if (result.requires2FA) {
      return NextResponse.json({
        success: true,
        requires2FA: true,
        message: "Código 2FA requerido",
      })
    }

    // Crear sesión en Supabase
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ success: false, error: "Error creando sesión" }, { status: 500 })
    }

    // Log evento de seguridad
    if (result.user) {
      await DatabaseAuthService.logSecurityEvent(result.user.id, "login_success", { method: "password" }, ip, userAgent)
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
    })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
