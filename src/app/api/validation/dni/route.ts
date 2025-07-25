import { type NextRequest, NextResponse } from "next/server"
import { RealValidationService } from "@/lib/services/real-validation-service"

export async function POST(request: NextRequest) {
  try {
    const { dni } = await request.json()

    if (!dni) {
      return NextResponse.json(
        {
          success: false,
          error: "DNI es requerido",
        },
        { status: 400 },
      )
    }

    console.log("🔍 Validating DNI:", dni)

    const validationService = new RealValidationService()
    const result = await validationService.validateDNI(dni)

    console.log("📋 DNI validation result:", { dni, valid: result.valid })

    return NextResponse.json({
      success: result.valid,
      valid: result.valid,
      message: result.message,
      data: result.data,
    })
  } catch (error) {
    console.error("❌ DNI validation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error validando DNI",
      },
      { status: 500 },
    )
  }
}
