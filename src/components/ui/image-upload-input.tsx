"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, XCircle } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/lib/hooks/use-toast"

interface ImageUploadInputProps {
  value: string | null
  onChange: (url: string | null) => void
  uploadUrl: string // API endpoint for image upload
  identifier: string // Unique identifier for the image (e.g., product SKU or ID)
  disabled?: boolean
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  value,
  onChange,
  uploadUrl,
  identifier,
  disabled,
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return
    }

    const file = event.target.files[0]
    const formData = new FormData()
    formData.append("image", file) // Changed from "file" to "image"
    formData.append("productId", identifier) // Added productId

    setIsUploading(true)
    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al subir la imagen")
      }

      const data = await response.json()
      onChange(data.url) // Changed from data.imageUrl to data.url
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido exitosamente.",
      })
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error al subir imagen",
        description: error.message || "Hubo un error al subir la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      })
      onChange(null) // Clear the image URL on error
    } finally {
      setIsUploading(false)
      // Clear the file input value to allow re-uploading the same file if needed
      event.target.value = ""
    }
  }

  const handleRemoveImage = useCallback(() => {
    onChange(null)
    toast({
      title: "Imagen eliminada",
      description: "La imagen ha sido eliminada del formulario.",
    })
  }, [onChange, toast])

  return (
    <div className="flex flex-col gap-2">
      {value && (
        <div className="relative w-32 h-32 rounded-md overflow-hidden border border-gray-200">
          <Image src={value || "/placeholder.svg"} alt="Product Image" layout="fill" objectFit="cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 rounded-full"
            onClick={handleRemoveImage}
            disabled={disabled || isUploading}
          >
            <XCircle className="h-4 w-4" />
            <span className="sr-only">Remove image</span>
          </Button>
        </div>
      )}
      <Label htmlFor="image-upload-input" className="sr-only">
        Subir Imagen
      </Label>
      <Input
        id="image-upload-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading || !identifier} // Disable if no identifier is provided
        className="file:text-sm file:font-semibold file:bg-green-500 file:text-white file:border-0 file:rounded-md file:py-2 file:px-4 file:mr-4 hover:file:bg-green-600"
      />
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Subiendo imagen...
        </div>
      )}
      {!identifier && <p className="text-sm text-red-500">Por favor, introduce el SKU antes de subir una imagen.</p>}
    </div>
  )
}
