import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database"

const supabase = createClientComponentClient<Database>()

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export class ImageService {
  private supabase = supabase

  /**
   * Sube una imagen de producto a Supabase Storage
   */
  async uploadProductImage(
    file: File,
    productId: string,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<UploadResult> {
    try {
      // Validar archivo
      const validation = this.validateFile(file)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Generar nombre único
      const fileExtension = file.name.split(".").pop()
      const timestamp = Date.now()
      const fileName = `${productId}-${timestamp}.${fileExtension}`
      const filePath = `products/${fileName}`

      // Subir archivo
      const { data, error } = await this.supabase.storage.from("products").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        console.error("Error uploading image:", error)
        return { success: false, error: error.message }
      }

      // Obtener URL pública
      const { data: urlData } = this.supabase.storage.from("products").getPublicUrl(filePath)

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath,
      }
    } catch (error) {
      console.error("Error in uploadProductImage:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  /**
   * Sube múltiples imágenes de producto
   */
  async uploadProductImages(
    files: File[],
    productId: string,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const result = await this.uploadProductImage(file, productId)
      results.push(result)

      if (onProgress) {
        onProgress({
          loaded: i + 1,
          total: files.length,
          percentage: Math.round(((i + 1) / files.length) * 100),
        })
      }
    }

    return results
  }

  /**
   * Sube imagen de categoría
   */
  async uploadCategoryImage(file: File, categorySlug: string): Promise<UploadResult> {
    try {
      const validation = this.validateFile(file)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      const fileExtension = file.name.split(".").pop()
      const fileName = `${categorySlug}.${fileExtension}`
      const filePath = `categories/${fileName}`

      const { data, error } = await this.supabase.storage.from("categories").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Permitir sobrescribir
      })

      if (error) {
        return { success: false, error: error.message }
      }

      const { data: urlData } = this.supabase.storage.from("categories").getPublicUrl(filePath)

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  /**
   * Sube avatar de usuario
   */
  async uploadUserAvatar(file: File, userId: string): Promise<UploadResult> {
    try {
      const validation = this.validateFile(file, 2 * 1024 * 1024) // 2MB para avatares
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      const fileExtension = file.name.split(".").pop()
      const fileName = `avatar.${fileExtension}`
      const filePath = `avatars/${userId}/${fileName}`

      const { data, error } = await this.supabase.storage.from("avatars").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      const { data: urlData } = this.supabase.storage.from("avatars").getPublicUrl(filePath)

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  /**
   * Elimina una imagen
   */
  async deleteImage(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage.from(bucket).remove([path])

      if (error) {
        console.error("Error deleting image:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in deleteImage:", error)
      return false
    }
  }

  /**
   * Obtiene URL pública de una imagen
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path)

    return data.publicUrl
  }

  /**
   * Valida un archivo antes de subirlo
   */
  private validateFile(file: File, maxSize: number = 5 * 1024 * 1024): { valid: boolean; error?: string } {
    // Validar tamaño
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return {
        valid: false,
        error: `El archivo es muy grande. Máximo ${maxSizeMB}MB permitido.`,
      }
    }

    // Validar tipo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Tipo de archivo no permitido. Solo JPG, PNG, WebP y GIF.",
      }
    }

    return { valid: true }
  }

  /**
   * Elimina una imagen de producto por URL
   */
  async deleteProductImage(imageUrl: string): Promise<void> {
    if (!imageUrl) {
      return // Nothing to delete
    }

    // Extract the file path from the public URL
    // This assumes your public URL structure is consistent, e.g.,
    // https://[project_ref].supabase.co/storage/v1/object/public/[bucket_name]/[path_to_file]
    const urlParts = imageUrl.split("/")
    const bucketNameIndex = urlParts.indexOf("public") + 1
    const bucketName = urlParts[bucketNameIndex]
    const filePath = urlParts.slice(bucketNameIndex + 1).join("/")

    if (!filePath || !bucketName) {
      console.warn("Could not extract file path or bucket name from image URL:", imageUrl)
      return
    }

    try {
      const { error } = await this.supabase.storage.from(bucketName).remove([filePath])

      if (error) {
        console.error("Supabase image deletion error:", error)
        throw new Error(`Failed to delete image: ${error.message}`)
      }
      console.log(`Image ${filePath} deleted successfully from bucket ${bucketName}.`)
    } catch (error: any) {
      console.error("Unexpected error during image deletion:", error)
      throw new Error(`Error deleting image: ${error.message}`)
    }
  }
}

// Instancia singleton
export const imageService = new ImageService()

// Funciones de conveniencia
export const uploadProductImage = (file: File, productId: string, onProgress?: (progress: UploadProgress) => void) =>
  imageService.uploadProductImage(file, productId, onProgress)

export const uploadProductImages = (
  files: File[],
  productId: string,
  onProgress?: (progress: UploadProgress) => void,
) => imageService.uploadProductImages(files, productId, onProgress)

export const uploadCategoryImage = (file: File, categorySlug: string) =>
  imageService.uploadCategoryImage(file, categorySlug)

export const uploadUserAvatar = (file: File, userId: string) => imageService.uploadUserAvatar(file, userId)

export const deleteImage = (bucket: string, path: string) => imageService.deleteImage(bucket, path)

export const getPublicImageUrl = (bucket: string, path: string) => imageService.getPublicUrl(bucket, path)

export const deleteProductImage = (imageUrl: string) => imageService.deleteProductImage(imageUrl)
