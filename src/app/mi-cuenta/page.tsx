"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Edit, Save, X, ShoppingBag, User, Package, MapPin, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"

// Validaciones profesionales (mismas que en register)
const validateName = (name: string): string | null => {
  if (!name.trim()) return "El nombre es requerido"
  if (name.trim().length < 2) return "El nombre debe tener al menos 2 caracteres"
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) return "El nombre solo puede contener letras y espacios"
  if (name.trim().length > 50) return "El nombre no puede exceder 50 caracteres"

  const simpleName = name.trim().toLowerCase()
  if (simpleName.length < 3 && !simpleName.includes(" ")) return "Por favor ingresa tu nombre completo"

  return null
}

const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) return "El teléfono es requerido"
  if (!/^\d{9}$/.test(phone)) return "El teléfono debe tener exactamente 9 dígitos"
  if (!phone.startsWith("9")) return "El teléfono debe comenzar con 9"

  if (/^(\d)\1{8}$/.test(phone)) return "Por favor ingresa un número de teléfono válido"
  if (/^(\d)\1{6,}/.test(phone)) return "El número no puede tener tantos dígitos repetidos"

  return null
}

const validateAddress = (address: string): string | null => {
  if (!address.trim()) return "La dirección es requerida"
  if (address.trim().length < 5) return "La dirección debe tener al menos 5 caracteres"
  if (address.trim().length > 100) return "La dirección no puede exceder 100 caracteres"
  if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#-]+$/.test(address)) return "La dirección contiene caracteres no válidos"

  const simpleAddress = address.trim().toLowerCase()
  if (simpleAddress.length < 8) return "Por favor ingresa una dirección más específica"

  return null
}

export default function MiCuentaPage() {
  const router = useRouter()
  const { user, profile, updateProfile, isLoading, isAuthenticated } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login")
      return
    }

    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
      })
    }
  }, [profile, isAuthenticated, isLoading, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    if (success) setSuccess("")
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    const nameError = validateName(formData.full_name)
    if (nameError) newErrors.full_name = nameError

    const phoneError = validatePhone(formData.phone)
    if (phoneError) newErrors.phone = phoneError

    const addressError = validateAddress(formData.address)
    if (addressError) newErrors.address = addressError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      await updateProfile({
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      })

      setIsEditing(false)
      setSuccess("Información actualizada correctamente")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error: any) {
      setErrors({ submit: error.message || "Error al actualizar la información" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
      })
    }
    setIsEditing(false)
    setErrors({})
    setSuccess("")
  }

  const getUserInitials = () => {
    if (formData.full_name) {
      return formData.full_name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-full sm:max-w-4xl">
        {" "}
        {/* Adjusted max-w for mobile */}
        {/* Header */}
        <div className="mb-7">
          <Button variant="outline" asChild className="mb-4 bg-transparent">
            <Link href="/" className="inline-flex items-center text-primary hover:text-primary/90">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Volver a Comprar
            </Link>
          </Button>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0">
              {" "}
              {/* Adjusted for mobile stacking */}
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary/70 text-xl font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                {" "}
                {/* Centered text for mobile */}
                <h1 className="text-2xl font-bold text-gray-900">{formData.full_name || "Usuario"}</h1>
                <p className="text-gray-600">{user?.email}</p>
                <Badge variant="secondary" className="mt-1">
                  Cliente
                </Badge>
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            {" "}
            {/* Adjusted grid for mobile */}
            <TabsTrigger value="perfil" className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 py-3">
              {" "}
              {/* Adjusted for mobile stacking */}
              <User className="h-4 w-4 mb-1 sm:mb-0" />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 py-3">
              <Package className="h-4 w-4 mb-1 sm:mb-0" />
              <span>Pedidos</span>
            </TabsTrigger>
            <TabsTrigger
              value="direcciones"
              className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 py-3"
            >
              <MapPin className="h-4 w-4 mb-1 sm:mb-0" />
              <span>Direcciones</span>
            </TabsTrigger>
            <TabsTrigger
              value="favoritos"
              className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 py-3"
            >
              <Heart className="h-4 w-4 mb-1 sm:mb-0" />
              <span>Favoritos</span>
            </TabsTrigger>
          </TabsList>

          {/* Perfil Tab */}
          <TabsContent value="perfil">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {" "}
                  {/* Adjusted for mobile stacking */}
                  <div>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Actualiza tu información de contacto</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                      {" "}
                      {/* Full width on mobile */}
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Success Message */}
                {success && (
                  <Alert className="border-primary/20 bg-primary/50">
                    <AlertDescription className="text-primary/80">{success}</AlertDescription>
                  </Alert>
                )}

                {/* Error Message */}
                {errors.submit && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{errors.submit}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre Completo */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nombre Completo</Label>
                    {isEditing ? (
                      <div>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => handleInputChange("full_name", e.target.value)}
                          className={errors.full_name ? "border-red-500" : ""}
                          placeholder="Ingresa tu nombre completo"
                        />
                        {errors.full_name && <p className="text-sm text-red-600 mt-1">{errors.full_name}</p>}
                        <p className="text-xs text-gray-500 mt-1">Solo letras y espacios, mínimo 3 caracteres</p>
                      </div>
                    ) : (
                      <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                        {formData.full_name || "Ingresa tu nombre completo"}
                      </p>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    {isEditing ? (
                      <div>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ""))}
                          className={errors.phone ? "border-red-500" : ""}
                          placeholder="987654321"
                          maxLength={9}
                        />
                        {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                        <p className="text-xs text-gray-500 mt-1">9 dígitos, debe empezar con 9</p>
                      </div>
                    ) : (
                      <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                        {formData.phone || "Ingresa tu teléfono"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email (no editable) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <p className="text-gray-900 py-2 px-3 bg-gray-100 rounded-md">{user?.email}</p>
                  <p className="text-sm text-gray-500">El email no se puede modificar</p>
                </div>

                {/* Dirección */}
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  {isEditing ? (
                    <div>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className={errors.address ? "border-red-500" : ""}
                        placeholder="Av. Los Olivos 123, San Isidro"
                      />
                      {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
                      <p className="text-xs text-gray-500 mt-1">Dirección completa, mínimo 8 caracteres</p>
                    </div>
                  ) : (
                    <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                      {formData.address || "Ingresa tu dirección"}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                    {" "}
                    {/* Adjusted for mobile stacking */}
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="w-full sm:w-auto bg-transparent"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Otros tabs (placeholder) */}
          <TabsContent value="pedidos">
            <Card>
              <CardHeader>
                <CardTitle>Mis Pedidos</CardTitle>
                <CardDescription>Historial de tus compras</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">No tienes pedidos aún</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="direcciones">
            <Card>
              <CardHeader>
                <CardTitle>Mis Direcciones</CardTitle>
                <CardDescription>Gestiona tus direcciones de envío</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">No tienes direcciones guardadas</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favoritos">
            <Card>
              <CardHeader>
                <CardTitle>Mis Favoritos</CardTitle>
                <CardDescription>Productos que te gustan</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">No tienes productos favoritos</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
