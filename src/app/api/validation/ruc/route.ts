import { type NextRequest, NextResponse } from "next/server"
import { RealValidationService } from "@/lib/services/real-validation-service"

export async function POST(request: NextRequest) {
  try {
    const { ruc } = await request.json()

    if (!ruc) {
      return NextResponse.json(
        {
          success: false,
          error: "RUC es requerido",
        },
        { status: 400 },
      )
    }

    console.log("🔍 Validating RUC:", ruc)

    const validationService = new RealValidationService()
    const result = await validationService.validateRUC(ruc)

    console.log("🏢 RUC validation result:", { ruc, valid: result.valid })

    return NextResponse.json({
      success: result.valid,
      valid: result.valid,
      message: result.message,
      data: result.data,
    })
  } catch (error) {
    console.error("❌ RUC validation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error validando RUC",
      },
      { status: 500 },
    )
  }
}
