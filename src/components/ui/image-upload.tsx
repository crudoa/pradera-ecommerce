"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useImageUpload } from "@/lib/hooks/use-image-upload"
import { Upload, X, ImageIcon, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UploadResult } from "@/lib/services/image-service"

interface ImageUploadProps {
  onUploadSuccess?: (urls: string[]) => void
  onUploadError?: (error: string) => void
  multiple?: boolean
  maxFiles?: number
  productId?: string
  categorySlug?: string
  userId?: string
  className?: string
}

interface PreviewImage {
  file: File
  preview: string
  uploaded?: boolean
  url?: string
  error?: string
}

export function ImageUpload({
  onUploadSuccess,
  onUploadError,
  multiple = false,
  maxFiles = 5,
  productId,
  categorySlug,
  userId,
  className,
}: ImageUploadProps) {
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])

  const { uploading, error, uploadProductImage, uploadCategoryImage, uploadUserAvatar, reset } = useImageUpload({
    onSuccess: (result) => {
      if (result.url) {
        const newUrls = [...uploadedUrls, result.url]
        setUploadedUrls(newUrls)
        onUploadSuccess?.(newUrls)
      }
    },
    onError: (error) => {
      onUploadError?.(error)
    },
  })

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || [])

      // Crear previews
      const newPreviews: PreviewImage[] = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))

      if (multiple) {
        setPreviewImages((prev) => [...prev, ...newPreviews].slice(0, maxFiles))
      } else {
        setPreviewImages(newPreviews.slice(0, 1))
      }
    },
    [multiple, maxFiles],
  )

  const removePreview = (index: number) => {
    setPreviewImages((prev) => {
      const newPreviews = [...prev]
      URL.revokeObjectURL(newPreviews[index].preview)
      newPreviews.splice(index, 1)
      return newPreviews
    })
  }

  const uploadImages = async () => {
    if (previewImages.length === 0) return

    reset()

    try {
      for (const preview of previewImages) {
        let result: UploadResult

        if (productId) {
          result = await uploadProductImage(preview.file, productId)
        } else if (categorySlug) {
          result = await uploadCategoryImage(preview.file, categorySlug)
        } else if (userId) {
          result = await uploadUserAvatar(preview.file, userId)
        } else {
          throw new Error("Debe especificar productId, categorySlug o userId")
        }

        if (result.success && result.url) {
          setPreviewImages((prev) =>
            prev.map((p) => (p.file === preview.file ? { ...p, uploaded: true, url: result.url } : p)),
          )
        } else {
          setPreviewImages((prev) => prev.map((p) => (p.file === preview.file ? { ...p, error: result.error } : p)))
        }
      }
    } catch (error) {
      console.error("Error uploading images:", error)
    }
  }

  const clearAll = () => {
    previewImages.forEach((preview) => {
      URL.revokeObjectURL(preview.preview)
    })
    setPreviewImages([])
    setUploadedUrls([])
    reset()
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Input de archivos */}
      <div className="border-2 border-dashed rounded-lg p-6 text-center">
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-primary font-medium">Haz clic para seleccionar imágenes</span>
              <p className="text-xs text-gray-500 mt-1">
                {multiple ? `Máximo ${maxFiles} archivos` : "Solo 1 archivo"} • JPG, PNG, WebP, GIF • Máximo 5MB
              </p>
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/*"
              multiple={multiple}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
        </div>
      </div>

      {/* Error general */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Previews */}
      {previewImages.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previewImages.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={preview.preview || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Estado de la imagen */}
                <div className="absolute top-2 right-2">
                  {preview.uploaded ? (
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  ) : preview.error ? (
                    <div className="bg-red-500 text-white rounded-full p-1">
                      <X className="h-4 w-4" />
                    </div>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePreview(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Error específico */}
                {preview.error && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-1 rounded-b-lg">
                    {preview.error}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Estado de carga */}
          {uploading && <div className="text-center text-sm text-gray-600">Subiendo imágenes...</div>}

          {/* Botones de acción */}
          <div className="flex space-x-2">
            <Button
              onClick={uploadImages}
              disabled={uploading || previewImages.every((p) => p.uploaded)}
              className="flex-1"
            >
              {uploading ? "Subiendo..." : "Subir Imágenes"}
            </Button>
            <Button variant="outline" onClick={clearAll} disabled={uploading}>
              Limpiar
            </Button>
          </div>
        </div>
      )}

      {/* URLs subidas */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Imágenes subidas:</h4>
          <div className="space-y-1">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <ImageIcon className="h-4 w-4 text-green-500" />
                <span className="text-green-600 truncate">{url}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
