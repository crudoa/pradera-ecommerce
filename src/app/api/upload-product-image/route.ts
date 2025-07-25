import { type NextRequest, NextResponse } from "next/server"
import { imageService } from "@/lib/services/image-service"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File
    const productId = formData.get("productId") as string

    if (!image) {
      return NextResponse.json({ error: "No se proporcionó imagen" }, { status: 400 })
    }

    if (!productId) {
      return NextResponse.json({ error: "No se proporcionó ID del producto" }, { status: 400 })
    }

    // Subir imagen a Supabase Storage
    const result = await imageService.uploadProductImage(image, productId, (progress) => {
      console.log(`Upload progress: ${progress.percentage}%`)
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Error al subir imagen" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path,
    })
  } catch (error) {
    console.error("Error uploading product image:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
