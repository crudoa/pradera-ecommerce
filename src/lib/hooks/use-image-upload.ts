"use client"

import { useState, useCallback } from "react"
import { imageService, type UploadResult, type UploadProgress } from "@/lib/services/image-service"

interface UseImageUploadOptions {
  onSuccess?: (result: UploadResult) => void
  onError?: (error: string) => void
  onProgress?: (progress: UploadProgress) => void
}

interface UseImageUploadReturn {
  uploading: boolean
  progress: number
  error: string | null
  uploadProductImage: (file: File, productId: string) => Promise<UploadResult>
  uploadProductImages: (files: File[], productId: string) => Promise<UploadResult[]>
  uploadCategoryImage: (file: File, categorySlug: string) => Promise<UploadResult>
  uploadUserAvatar: (file: File, userId: string) => Promise<UploadResult>
  reset: () => void
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setUploading(false)
    setProgress(0)
    setError(null)
  }, [])

  const handleProgress = useCallback(
    (progressData: UploadProgress) => {
      setProgress(progressData.percentage)
      options.onProgress?.(progressData)
    },
    [options],
  )

  const uploadProductImage = useCallback(
    async (file: File, productId: string): Promise<UploadResult> => {
      try {
        setUploading(true)
        setError(null)
        setProgress(0)

        const result = await imageService.uploadProductImage(file, productId, handleProgress)

        if (result.success) {
          options.onSuccess?.(result)
        } else {
          setError(result.error || "Error al subir imagen")
          options.onError?.(result.error || "Error al subir imagen")
        }

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
        setError(errorMessage)
        options.onError?.(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setUploading(false)
      }
    },
    [handleProgress, options],
  )

  const uploadProductImages = useCallback(
    async (files: File[], productId: string): Promise<UploadResult[]> => {
      try {
        setUploading(true)
        setError(null)
        setProgress(0)

        const results = await imageService.uploadProductImages(files, productId, handleProgress)

        const failedUploads = results.filter((r: UploadResult) => !r.success)
        if (failedUploads.length > 0) {
          const errorMessage = `${failedUploads.length} imágenes fallaron al subir`
          setError(errorMessage)
          options.onError?.(errorMessage)
        }

        const successfulUploads = results.filter((r: UploadResult) => r.success)
        successfulUploads.forEach((result) => {
          options.onSuccess?.(result)
        })

        return results
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
        setError(errorMessage)
        options.onError?.(errorMessage)
        return []
      } finally {
        setUploading(false)
      }
    },
    [handleProgress, options],
  )

  const uploadCategoryImage = useCallback(
    async (file: File, categorySlug: string): Promise<UploadResult> => {
      try {
        setUploading(true)
        setError(null)

        const result = await imageService.uploadCategoryImage(file, categorySlug)

        if (result.success) {
          options.onSuccess?.(result)
        } else {
          setError(result.error || "Error al subir imagen")
          options.onError?.(result.error || "Error al subir imagen")
        }

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
        setError(errorMessage)
        options.onError?.(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setUploading(false)
      }
    },
    [options],
  )

  const uploadUserAvatar = useCallback(
    async (file: File, userId: string): Promise<UploadResult> => {
      try {
        setUploading(true)
        setError(null)

        const result = await imageService.uploadUserAvatar(file, userId)

        if (result.success) {
          options.onSuccess?.(result)
        } else {
          setError(result.error || "Error al subir avatar")
          options.onError?.(result.error || "Error al subir avatar")
        }

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
        setError(errorMessage)
        options.onError?.(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setUploading(false)
      }
    },
    [options],
  )

  return {
    uploading,
    progress,
    error,
    uploadProductImage,
    uploadProductImages,
    uploadCategoryImage,
    uploadUserAvatar,
    reset,
  }
}
