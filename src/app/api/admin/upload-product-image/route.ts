import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const formData = await request.formData()

    const image = formData.get("image") as File
    const productId = formData.get("productId") as string

    console.log("Upload request:", {
      hasImage: !!image,
      productId,
      imageType: image?.type,
      imageSize: image?.size,
    })

    if (!image) {
      return NextResponse.json({ error: "No se proporcionó imagen" }, { status: 400 })
    }

    if (!productId) {
      return NextResponse.json({ error: "No se proporcionó productId" }, { status: 400 })
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        {
          error: "Tipo de archivo no permitido. Solo se permiten: " + allowedTypes.join(", "),
        },
        { status: 400 },
      )
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (image.size > maxSize) {
      return NextResponse.json(
        {
          error: "El archivo es demasiado grande. Máximo 5MB permitido.",
        },
        { status: 400 },
      )
    }

    // Generar nombre único para el archivo
    const fileExtension = image.name.split(".").pop() || "jpg"
    const fileName = `${productId}-${Date.now()}.${fileExtension}`
    const filePath = `products/${fileName}`

    console.log("Uploading to path:", filePath)

    // Subir archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, image, {
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json(
        {
          error: "Error al subir imagen: " + uploadError.message,
        },
        { status: 500 },
      )
    }

    console.log("Upload successful:", uploadData)

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath)

    console.log("Public URL:", publicUrl)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
      message: "Imagen subida exitosamente",
    })
  } catch (error) {
    console.error("Error in upload API:", error)
    return NextResponse.json(
      {
        error: `Error interno del servidor: ${error instanceof Error ? error.message : "Error desconocido"}`,
      },
      { status: 500 },
    )
  }
}
