import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        {
          valid: false,
          message: "Email es requerido",
        },
        { status: 400 },
      )
    }

    console.log("📧 Validating email:", email)

    // Validación básica de formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        valid: false,
        message: "Formato de email inválido",
      })
    }

    // Si tienes Hunter.io API key, usar validación avanzada
    const hunterApiKey = process.env.HUNTER_API_KEY
    if (hunterApiKey) {
      try {
        const response = await fetch(
          `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${hunterApiKey}`,
        )

        const result = await response.json()

        if (response.ok) {
          const isValid = result.data.status === "valid"
          return NextResponse.json({
            valid: isValid,
            message: isValid ? "Email válido ✓" : "Email no válido o no existe",
          })
        }
      } catch (error) {
        console.error("Error validando email con Hunter:", error)
        // Continuar con validación básica si falla Hunter
      }
    }

    // Fallback a validación básica si no hay Hunter API o falla
    return NextResponse.json({
      valid: true,
      message: "Email válido ✓",
    })
  } catch (error) {
    console.error("❌ Email validation error:", error)
    return NextResponse.json(
      {
        valid: false,
        message: "Error validando email",
      },
      { status: 500 },
    )
  }
}
