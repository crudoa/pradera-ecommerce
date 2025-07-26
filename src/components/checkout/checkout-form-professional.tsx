"use client"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useCart } from "@/contexts/cart-context"
import OrderCheckoutService, { type CheckoutData } from "@/lib/services/order-checkout-service"
import { useSafeAsync } from "@/lib/hooks/use-async"
import { useToast } from "@/lib/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AppError } from "@/lib/errors/app-error"
import { useAuth } from "@/contexts/auth-context"
import { departments, provincesByDepartment, districtsByProvince } from "@/lib/data/peru-locations"
import { getWhatsAppOrderMessage } from "@/lib/utils"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { CartItem } from "@/types/cart"
import { TermsModal } from "@/components/legal/terms-modal" // Import TermsModal
import { PrivacyModal } from "@/components/legal/privacy-modal" // Import PrivacyModal
import { cn } from "@/lib/utils" // Import cn for conditional class names

interface CheckoutFormProfessionalProps {
  initialShippingCost?: number
}

type DocumentType = "dni" | "ruc" | "passport"

export function CheckoutFormProfessional({ initialShippingCost = 0 }: CheckoutFormProfessionalProps) {
  const { items, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [customerName, setCustomerName] = useState(user?.user_metadata?.full_name || "")
  const [customerEmail, setCustomerEmail] = useState(user?.email || "")
  const [customerPhone, setCustomerPhone] = useState(user?.user_metadata?.phone || "")
  const [customerDocumentType, setCustomerDocumentType] = useState<DocumentType>("dni")
  const [customerDocumentNumber, setCustomerDocumentNumber] = useState("")

  const [shippingDepartment, setShippingDepartment] = useState("")
  const [shippingProvince, setShippingProvince] = useState("")
  const [shippingDistrict, setShippingDistrict] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [shippingReference, setShippingReference] = useState("")
  const [shippingPostalCode, setShippingPostalCode] = useState("")
  const [shippingCost, setShippingCost] = useState(initialShippingCost)

  const [paymentMethod, setPaymentMethod] = useState("whatsapp")
  const [notes, setNotes] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)

  const [isMounted, setIsMounted] = useState(false) // New state for hydration
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({}) // State for form validation errors

  useEffect(() => {
    setIsMounted(true) // Set to true after component mounts on client
  }, [])

  const { execute: executeOrderProcessing, loading: isProcessingOrder } = useSafeAsync<string>()

  const { execute: executeShippingCalculation, loading: isCalculatingShipping } = useSafeAsync<number>()

  // Client-side validation function for all required fields
  const validateFormFields = (): boolean => {
    const newErrors: Record<string, string | null> = {}
    let isValid = true

    if (!customerName.trim()) {
      newErrors.customerName = "El nombre completo es obligatorio."
      isValid = false
    }
    if (!customerEmail.trim()) {
      newErrors.customerEmail = "El email es obligatorio."
      isValid = false
    }
    if (!customerPhone.trim()) {
      newErrors.customerPhone = "El teléfono es obligatorio."
      isValid = false
    }
    if (!customerDocumentType) {
      newErrors.customerDocumentType = "El tipo de documento es obligatorio."
      isValid = false
    }

    const docValidation = OrderCheckoutService.validateDocument(customerDocumentType, customerDocumentNumber)
    if (!docValidation.isValid) {
      newErrors.customerDocumentNumber = docValidation.message
      isValid = false
    }

    // Removed shippingDepartment, shippingProvince, shippingDistrict validation - they are now optional
    // if (!shippingDepartment) {
    //   newErrors.shippingDepartment = "El departamento de envío es obligatorio."
    //   isValid = false
    // }
    // if (!shippingProvince) {
    //   newErrors.shippingProvince = "La provincia de envío es obligatoria."
    //   isValid = false
    // }
    // if (!shippingDistrict) {
    //   newErrors.shippingDistrict = "El distrito de envío es obligatorio."
    //   isValid = false
    // }
    // Removed shippingAddress validation - it's now optional
    // if (!shippingAddress.trim()) {
    //   newErrors.shippingAddress = "La dirección de envío es obligatoria."
    //   isValid = false
    // }
    if (!acceptTerms) {
      newErrors.acceptTerms = "Debe aceptar los términos y condiciones."
      isValid = false
    }
    if (!acceptPrivacy) {
      newErrors.acceptPrivacy = "Debe aceptar la política de privacidad."
      isValid = false
    }

    setFormErrors(newErrors)
    return isValid
  }

  const handleConfirmOrder = async () => {
    if (!validateFormFields()) {
      toast({
        title: "Campos obligatorios",
        description: "Por favor, complete todos los campos obligatorios y corrija los errores.",
        variant: "destructive",
      })
      return // Stop processing if client-side validation fails
    }

    const orderId = await executeOrderProcessing(async () => {
      if (items.length === 0) {
        throw new AppError("El carrito está vacío.")
      }

      const subtotal = getTotalPrice()
      const tax = 0 // IGV removed
      const total = subtotal + tax + shippingCost

      const orderData: CheckoutData = {
        customerName,
        customerEmail,
        customerPhone,
        customerDocumentType,
        customerDocumentNumber,
        shippingAddress: {
          address: shippingAddress, // This can now be an empty string
          district: shippingDistrict, // Now optional
          province: shippingProvince, // Now optional
          department: shippingDepartment, // Now optional
          postalCode: shippingPostalCode,
          reference: shippingReference,
        },
        shippingCost,
        items: items.map((item: CartItem) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category || null,
        })),
        subtotal,
        tax,
        discount: 0,
        total,
        paymentMethod,
        paymentProvider: "manual",
        notes,
      }

      const response = await OrderCheckoutService.processCheckout(orderData)
      if (!response.success) {
        throw new AppError(response.error || "Error al procesar el pedido.")
      }
      return response.orderId as string
    }, "Order processing")

    if (orderId) {
      toast({
        title: "Pedido realizado con éxito!",
        description: "Serás redirigido a la página de confirmación.",
      })
      clearCart()
      router.push(`/checkout/success?orderId=${orderId}`)
    }
  }

  const handleWhatsAppOrder = async () => {
    if (!validateFormFields()) {
      toast({
        title: "Campos obligatorios",
        description: "Por favor, complete todos los campos obligatorios y corrija los errores.",
        variant: "destructive",
      })
      return // Stop processing if client-side validation fails
    }

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    if (!whatsappNumber) {
      toast({
        title: "Error de configuración",
        description: "Número de WhatsApp no configurado. Por favor, contacte al soporte.",
        variant: "destructive",
      })
      return
    }

    const orderId = await executeOrderProcessing(async () => {
      if (items.length === 0) {
        throw new AppError("El carrito está vacío.")
      }

      const subtotal = getTotalPrice()
      const tax = 0 // IGV removed
      const total = subtotal + tax + shippingCost

      const checkoutDataForMessage: CheckoutData = {
        customerName,
        customerEmail,
        customerPhone,
        customerDocumentType,
        customerDocumentNumber,
        shippingAddress: {
          address: shippingAddress, // This can now be an empty string
          district: shippingDistrict, // Now optional
          province: shippingProvince, // Now optional
          department: shippingDepartment, // Now optional
          postalCode: shippingPostalCode,
          reference: shippingReference,
        },
        shippingCost,
        items: items.map((item: CartItem) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category || null,
        })),
        subtotal,
        tax,
        discount: 0,
        total,
        paymentMethod,
        paymentProvider: "manual",
        notes,
      }

      const response = await OrderCheckoutService.processCheckout(checkoutDataForMessage)
      if (!response.success) {
        throw new AppError(response.error || "Error al procesar el pedido.")
      }
      return response.orderId as string
    }, "WhatsApp order processing")

    if (orderId) {
      const subtotal = getTotalPrice()
      const tax = 0 // IGV removed
      const total = subtotal + tax + shippingCost

      const checkoutDataForMessage: CheckoutData = {
        customerName,
        customerEmail,
        customerPhone,
        customerDocumentType,
        customerDocumentNumber,
        shippingAddress: {
          address: shippingAddress, // This can now be an empty string
          district: shippingDistrict, // Now optional
          province: shippingProvince, // Now optional
          department: shippingDepartment, // Now optional
          postalCode: shippingPostalCode,
          reference: shippingReference,
        },
        shippingCost,
        items: items.map((item: CartItem) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category || null,
        })),
        subtotal,
        tax,
        discount: 0,
        total,
        paymentMethod,
        paymentProvider: "manual",
        notes,
      }

      const message = getWhatsAppOrderMessage(checkoutDataForMessage, orderId)
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

      // Log the generated URL for debugging
      console.log("Generated WhatsApp URL:", whatsappUrl)

      // Attempt to open WhatsApp
      try {
        window.open(whatsappUrl, "_blank")
      } catch (e) {
        console.error("Error opening WhatsApp URL:", e)
        toast({
          title: "Error al abrir WhatsApp",
          description: "Asegúrate de tener WhatsApp instalado y de que tu navegador permita pop-ups.",
          variant: "destructive",
        })
      }

      // Redirect to success page and clear cart AFTER attempting WhatsApp redirection
      clearCart()
      router.push(`/checkout/success?orderId=${orderId}&method=${paymentMethod}&total=${total.toFixed(2)}`)
    }
  }

  const calculateTotals = useMemo(() => {
    const subtotal = getTotalPrice()
    const tax = 0 // IGV removed
    const total = subtotal + tax + shippingCost
    return { subtotal, tax, total }
  }, [getTotalPrice, shippingCost])

  useEffect(() => {
    const updateShipping = async () => {
      // Only calculate shipping if all location fields are provided
      if (shippingDepartment && shippingProvince && shippingDistrict) {
        const cost = await executeShippingCalculation(async () => {
          return OrderCheckoutService.calculateShipping({
            address: shippingAddress,
            department: shippingDepartment,
            province: shippingProvince,
            district: shippingDistrict,
            postalCode: shippingPostalCode,
            reference: shippingReference,
          })
        }, "Shipping calculation")

        if (cost !== undefined) {
          setShippingCost(cost)
        } else {
          setShippingCost(15) // Fallback to a standard cost if calculation fails
          toast({
            title: "Error al calcular envío",
            description: "Se aplicará un costo de envío estándar.",
            variant: "destructive",
          })
        }
      } else {
        // If any location field is missing, reset shipping cost to initial or a default
        setShippingCost(initialShippingCost)
      }
    }
    const handler = setTimeout(updateShipping, 500)
    return () => clearTimeout(handler)
  }, [
    shippingDepartment,
    shippingProvince,
    shippingDistrict,
    shippingAddress,
    shippingPostalCode,
    shippingReference,
    initialShippingCost,
    toast,
    executeShippingCalculation,
  ])

  const availableProvinces = useMemo(() => {
    return provincesByDepartment[shippingDepartment] || []
  }, [shippingDepartment])

  const availableDistricts = useMemo(() => {
    return districtsByProvince[shippingProvince] || []
  }, [shippingProvince])

  return (
    <div className="grid gap-6 lg:grid-cols-3 items-start">
      {/* Contenedor para las tarjetas de la izquierda (2 columnas) */}
      <div className="lg:col-span-2 grid gap-6">
        {/* Información del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
            <CardDescription>Completa tus datos para el pedido.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="customerName">Nombre Completo</Label>
                <Input
                  id="customerName"
                  placeholder="Nombre"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value)
                    setFormErrors((prev) => ({ ...prev, customerName: null }))
                  }}
                  required
                  className={cn({ "border-red-500": formErrors.customerName })}
                />
                {formErrors.customerName && <p className="text-red-500 text-sm">{formErrors.customerName}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="Email"
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value)
                    setFormErrors((prev) => ({ ...prev, customerEmail: null }))
                  }}
                  required
                  className={cn({ "border-red-500": formErrors.customerEmail })}
                />
                {formErrors.customerEmail && <p className="text-red-500 text-sm">{formErrors.customerEmail}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="customerPhone">Teléfono</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="987654321"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value)
                    setFormErrors((prev) => ({ ...prev, customerPhone: null }))
                  }}
                  required
                  className={cn({ "border-red-500": formErrors.customerPhone })}
                />
                {formErrors.customerPhone && <p className="text-red-500 text-sm">{formErrors.customerPhone}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="documentType">Tipo de Documento</Label>
                  <Select
                    value={customerDocumentType}
                    onValueChange={(value: DocumentType) => {
                      setCustomerDocumentType(value)
                      setFormErrors((prev) => ({ ...prev, customerDocumentType: null, customerDocumentNumber: null }))
                    }}
                  >
                    <SelectTrigger
                      id="documentType"
                      className={cn({ "border-red-500": formErrors.customerDocumentType })}
                    >
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dni">DNI</SelectItem>
                      <SelectItem value="ruc">RUC</SelectItem>
                      <SelectItem value="passport">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.customerDocumentType && (
                    <p className="text-red-500 text-sm">{formErrors.customerDocumentType}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="documentNumber">Número de Documento</Label>
                  <Input
                    id="documentNumber"
                    placeholder="Ej: 12345678"
                    value={customerDocumentNumber}
                    onChange={(e) => {
                      setCustomerDocumentNumber(e.target.value)
                      setFormErrors((prev) => ({ ...prev, customerDocumentNumber: null }))
                    }}
                    required
                    className={cn({ "border-red-500": formErrors.customerDocumentNumber })}
                  />
                  {formErrors.customerDocumentNumber && (
                    <p className="text-red-500 text-sm">{formErrors.customerDocumentNumber}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dirección de Envío */}
        <Card>
          <CardHeader>
            <CardTitle>Dirección de Envío</CardTitle>
            <CardDescription>¿A dónde enviamos tu pedido?</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="department">Departamento (opcional)</Label>
                <Select
                  value={shippingDepartment}
                  onValueChange={(value) => {
                    setShippingDepartment(value)
                    setFormErrors((prev) => ({ ...prev, shippingDepartment: null }))
                  }}
                >
                  <SelectTrigger id="department" className={cn({ "border-red-500": formErrors.shippingDepartment })}>
                    <SelectValue placeholder="Selecciona un departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept: string) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.shippingDepartment && (
                  <p className="text-red-500 text-sm">{formErrors.shippingDepartment}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="province">Provincia (opcional)</Label>
                <Select
                  value={shippingProvince}
                  onValueChange={(value) => {
                    setShippingProvince(value)
                    setFormErrors((prev) => ({ ...prev, shippingProvince: null }))
                  }}
                  disabled={!shippingDepartment}
                >
                  <SelectTrigger id="province" className={cn({ "border-red-500": formErrors.shippingProvince })}>
                    <SelectValue placeholder="Selecciona una provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProvinces.map((prov: string) => (
                      <SelectItem key={prov} value={prov}>
                        {prov}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.shippingProvince && <p className="text-red-500 text-sm">{formErrors.shippingProvince}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="district">Distrito (opcional)</Label>
                <Select
                  value={shippingDistrict}
                  onValueChange={(value) => {
                    setShippingDistrict(value)
                    setFormErrors((prev) => ({ ...prev, shippingDistrict: null }))
                  }}
                  disabled={!shippingProvince}
                >
                  <SelectTrigger id="district" className={cn({ "border-red-500": formErrors.shippingDistrict })}>
                    <SelectValue placeholder="Selecciona un distrito" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((dist: string) => (
                      <SelectItem key={dist} value={dist}>
                        {dist}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.shippingDistrict && <p className="text-red-500 text-sm">{formErrors.shippingDistrict}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Dirección (opcional)</Label>
              <Input
                id="address"
                placeholder="Av. Principal"
                value={shippingAddress}
                onChange={(e) => {
                  setShippingAddress(e.target.value)
                  setFormErrors((prev) => ({ ...prev, shippingAddress: null }))
                }}
                // Removed 'required' attribute
                className={cn({ "border-red-500": formErrors.shippingAddress })}
              />
              {formErrors.shippingAddress && <p className="text-red-500 text-sm">{formErrors.shippingAddress}</p>}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="reference">Referencia (opcional)</Label>
                <Input
                  id="reference"
                  placeholder="Ej: Frente a la farmacia"
                  value={shippingReference}
                  onChange={(e) => setShippingReference(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="postalCode">Código Postal (opcional)</Label>
                <Input
                  id="postalCode"
                  placeholder="Ej: 15001"
                  value={shippingPostalCode}
                  onChange={(e) => setShippingPostalCode(e.target.value)}
                />
              </div>
            </div>
            {isCalculatingShipping && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Calculando costo de envío...
              </div>
            )}
            {/* Show shipping cost only if location data is provided, otherwise show a default or N/A */}
            {!isCalculatingShipping && (shippingDepartment || shippingProvince || shippingDistrict) ? (
              <div className="text-sm text-green-600">Costo de Envío Estimado: S/.{shippingCost.toFixed(2)}</div>
            ) : (
              <div className="text-sm text-muted-foreground">Costo de Envío: No aplicable (dirección no completa)</div>
            )}
          </CardContent>
        </Card>

        {/* Notas Adicionales */}
        <Card>
          <CardHeader>
            <CardTitle>Notas Adicionales</CardTitle>
            <CardDescription>¿Alguna instrucción especial para tu pedido?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ej: Entregar después de las 5 PM"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Resumen del Pedido - Ocupa 1 columna a la derecha */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Resumen del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            {isMounted &&
              items.map(
                (
                  item: CartItem, // Conditionally render after mount
                ) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>
                      {item.name} (x{item.quantity})
                    </span>
                    <span>S/.{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ),
              )}
            {!isMounted &&
              items.length === 0 && ( // Placeholder for server render if cart is empty
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Cargando carrito...</span>
                  <span>S/.0.00</span>
                </div>
              )}
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span>S/.{calculateTotals.subtotal.toFixed(2)}</span>
            </div>
            {/* Impuestos (IGV) ahora siempre 0 */}
            <div className="flex items-center justify-between text-sm">
              <span>Impuestos (IGV 0%)</span>
              <span>S/.{calculateTotals.tax.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Costo de Envío</span>
              <span>S/.{shippingCost.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between font-bold">
              <span>Total</span>
              <span>S/.{calculateTotals.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="paymentMethod">Método de Pago</Label>
            <RadioGroup
              id="paymentMethod"
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="grid grid-cols-1 gap-4"
            >
              <Label
                htmlFor="whatsapp"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem id="whatsapp" value="whatsapp" className="sr-only" />
                <span className="mb-2 text-lg font-semibold">WhatsApp</span>
                <p className="text-sm text-muted-foreground">Coordina el pago y envío por WhatsApp.</p>
              </Label>
              {/* Add other payment methods here if needed, e.g., bank transfer, cash on delivery */}
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => {
                setAcceptTerms(checked === true)
                setFormErrors((prev) => ({ ...prev, acceptTerms: null }))
              }}
            />
            <label
              htmlFor="terms"
              className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                { "text-red-500": formErrors.acceptTerms },
              )}
            >
              Acepto los{" "}
              <TermsModal>
                <span className="underline cursor-pointer text-primary">términos y condiciones</span>
              </TermsModal>
            </label>
          </div>
          {formErrors.acceptTerms && <p className="text-red-500 text-sm">{formErrors.acceptTerms}</p>}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="privacy"
              checked={acceptPrivacy}
              onCheckedChange={(checked) => {
                setAcceptPrivacy(checked === true)
                setFormErrors((prev) => ({ ...prev, acceptPrivacy: null }))
              }}
            />
            <label
              htmlFor="privacy"
              className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                { "text-red-500": formErrors.acceptPrivacy },
              )}
            >
              Acepto la{" "}
              <PrivacyModal>
                <span className="underline cursor-pointer text-primary">política de privacidad</span>
              </PrivacyModal>
            </label>
          </div>
          {formErrors.acceptPrivacy && <p className="text-red-500 text-sm">{formErrors.acceptPrivacy}</p>}

          <Button
            onClick={paymentMethod === "whatsapp" ? handleWhatsAppOrder : handleConfirmOrder}
            disabled={isProcessingOrder || items.length === 0} // Removed acceptTerms/Privacy from here as validation handles it
            className="w-full"
          >
            {isProcessingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {paymentMethod === "whatsapp" ? "Confirmar Pedido por WhatsApp" : "Confirmar Pedido"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
