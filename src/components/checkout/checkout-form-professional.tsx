"use client"
import { useState, useEffect, useMemo } from "react"
import type { CartItem } from "@/types/cart" // Corrected import path for CartItem

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useCart } from "@/contexts/cart-context"
import OrderCheckoutService, { type CheckoutData } from "@/lib/services/order-checkout-service"
import { useSafeAsync } from "@/lib/hooks/use-async"
import { useToast } from "@/lib/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2, Copy, Check } from "lucide-react"
import { AppError } from "@/lib/errors/app-error"
import { useAuth } from "@/contexts/auth-context"
import { departments, provincesByDepartment, districtsByProvince } from "@/lib/data/peru-locations"
import { getWhatsAppOrderMessage } from "@/lib/utils"
import { TermsModal } from "@/components/legal/terms-modal"
import { PrivacyModal } from "@/components/legal/privacy-modal"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

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

  const [isMounted, setIsMounted] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({})

  // New states for WhatsApp order summary dialog
  const [showOrderSummaryDialog, setShowOrderSummaryDialog] = useState(false)
  const [whatsappMessageContent, setWhatsappMessageContent] = useState("")
  const [copiedWhatsAppMessage, setCopiedWhatsAppMessage] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [currentCheckoutData, setCurrentCheckoutData] = useState<CheckoutData | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { execute: executeOrderProcessing, loading: isProcessingOrder } = useSafeAsync<string>()
  const { execute: executeShippingCalculation, loading: isCalculatingShipping } = useSafeAsync<number>()

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
      return
    }

    const orderId = await executeOrderProcessing(async () => {
      if (items.length === 0) {
        throw new AppError("El carrito está vacío.")
      }

      const subtotal = getTotalPrice()
      const tax = 0
      const total = subtotal + tax + shippingCost

      const orderData: CheckoutData = {
        customerName,
        customerEmail,
        customerPhone,
        customerDocumentType,
        customerDocumentNumber,
        shippingAddress: {
          address: shippingAddress,
          district: shippingDistrict,
          province: shippingProvince,
          department: shippingDepartment,
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
      return
    }

    const subtotal = getTotalPrice()
    const tax = 0
    const total = subtotal + tax + shippingCost

    const checkoutDataForMessage: CheckoutData = {
      customerName,
      customerEmail,
      customerPhone,
      customerDocumentType,
      customerDocumentNumber,
      shippingAddress: {
        address: shippingAddress,
        district: shippingDistrict,
        province: shippingProvince,
        department: shippingDepartment,
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

    console.log("DEBUG: Data for WhatsApp message:", checkoutDataForMessage)

    const orderId = await executeOrderProcessing(async () => {
      if (items.length === 0) {
        throw new AppError("El carrito está vacío.")
      }
      const response = await OrderCheckoutService.processCheckout(checkoutDataForMessage)
      if (!response.success) {
        throw new AppError(response.error || "Error al procesar el pedido.")
      }
      return response.orderId as string
    }, "WhatsApp order processing")

    if (orderId) {
      const message = getWhatsAppOrderMessage(checkoutDataForMessage, orderId)
      setWhatsappMessageContent(message) // Store message for modal
      setCurrentOrderId(orderId)
      setCurrentCheckoutData(checkoutDataForMessage)
      setShowOrderSummaryDialog(true) // Show the new summary dialog
      // Do NOT clear cart or redirect here. This happens after user interacts with the dialog.
    }
  }

  const handleCopyWhatsAppMessage = () => {
    navigator.clipboard.writeText(whatsappMessageContent)
    setCopiedWhatsAppMessage(true)
    toast({
      title: "Mensaje copiado",
      description: "El mensaje del pedido ha sido copiado al portapapeles.",
    })
    setTimeout(() => setCopiedWhatsAppMessage(false), 2000)
  }

  const handleOpenWhatsAppAndRedirect = () => {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    if (!whatsappNumber) {
      toast({
        title: "Error de configuración",
        description: "Número de WhatsApp no configurado. Por favor, contacte al soporte.",
        variant: "destructive",
      })
      return
    }

    // Open WhatsApp without pre-filled text, relying on user to paste
    const whatsappUrl = `https://wa.me/${whatsappNumber}`
    window.open(whatsappUrl, "_blank")

    // Now clear cart and redirect to home page
    clearCart()
    router.push(`/`) // Redirect to home page
    setShowOrderSummaryDialog(false) // Close the dialog
  }

  const calculateTotals = useMemo(() => {
    const subtotal = getTotalPrice()
    const tax = 0
    const total = subtotal + tax + shippingCost
    return { subtotal, tax, total }
  }, [getTotalPrice, shippingCost])

  useEffect(() => {
    const updateShipping = async () => {
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
          setShippingCost(15)
          toast({
            title: "Error al calcular envío",
            description: "Se aplicará un costo de envío estándar.",
            variant: "destructive",
          })
        }
      } else {
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
      <div className="lg:col-span-2 grid gap-6">
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
            {!isCalculatingShipping && (shippingDepartment || shippingProvince || shippingDistrict) ? (
              <div className="text-sm text-green-600">Costo de Envío Estimado: S/.{shippingCost.toFixed(2)}</div>
            ) : (
              <div className="text-sm text-muted-foreground">Costo de Envío: No aplicable (dirección no completa)</div>
            )}
          </CardContent>
        </Card>

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

      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Resumen del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            {isMounted &&
              items.map((item: CartItem) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} (x{item.quantity})
                  </span>
                  <span>S/.{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            {!isMounted && items.length === 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Cargando carrito...</span>
                <span>S/.0.00</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>S/.{calculateTotals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Impuestos (IGV 0%)</span>
              <span>S/.{calculateTotals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Costo de Envío</span>
              <span>S/.{shippingCost.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
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
            disabled={isProcessingOrder || items.length === 0}
            className="w-full"
          >
            {isProcessingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {paymentMethod === "whatsapp" ? "Confirmar Pedido por WhatsApp" : "Confirmar Pedido"}
          </Button>
        </CardContent>
      </Card>

      {/* WhatsApp Order Summary Dialog */}
      <Dialog open={showOrderSummaryDialog} onOpenChange={setShowOrderSummaryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pedido Confirmado - Detalles para WhatsApp</DialogTitle>
            <DialogDescription>
              Tu pedido ha sido confirmado. Por favor, copia el mensaje y envíalo por WhatsApp para finalizar la
              coordinación.
            </DialogDescription>
          </DialogHeader>

          {currentCheckoutData && currentOrderId && (
            <div className="grid gap-4 text-sm">
              <h3 className="font-semibold text-base">Resumen del Pedido #{currentOrderId}</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="font-medium">Información del Cliente:</p>
                  <p>{currentCheckoutData.customerName}</p>
                  <p>{currentCheckoutData.customerEmail}</p>
                  <p>{currentCheckoutData.customerPhone}</p>
                  <p>
                    {currentCheckoutData.customerDocumentType.toUpperCase()}:{" "}
                    {currentCheckoutData.customerDocumentNumber}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Dirección de Envío:</p>
                  <p>{currentCheckoutData.shippingAddress.address || "No especificada"}</p>
                  <p>
                    {currentCheckoutData.shippingAddress.district || "No especificado"},{" "}
                    {currentCheckoutData.shippingAddress.province || "No especificada"}
                  </p>
                  <p>{currentCheckoutData.shippingAddress.department || "No especificado"}</p>
                  {currentCheckoutData.shippingAddress.reference && (
                    <p>Ref: {currentCheckoutData.shippingAddress.reference}</p>
                  )}
                  {currentCheckoutData.shippingAddress.postalCode && (
                    <p>CP: {currentCheckoutData.shippingAddress.postalCode}</p>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <p className="font-medium">Productos:</p>
                <ul className="list-disc pl-5">
                  {currentCheckoutData.items.map((item) => (
                    <li key={item.id}>
                      {item.name} (x{item.quantity})
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 font-medium">
                <span>Subtotal:</span>
                <span>S/.{currentCheckoutData.subtotal.toFixed(2)}</span>
                <span>Costo de Envío:</span>
                <span>S/.{currentCheckoutData.shippingCost.toFixed(2)}</span>
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-lg">S/.{currentCheckoutData.total.toFixed(2)}</span>
              </div>
              <Separator />
              <div>
                <p className="font-medium">Método de Pago:</p>
                <p>
                  {currentCheckoutData.paymentMethod === "whatsapp"
                    ? "Coordinar por WhatsApp"
                    : currentCheckoutData.paymentMethod}
                </p>
              </div>
              {currentCheckoutData.notes && (
                <div>
                  <p className="font-medium">Notas:</p>
                  <p>{currentCheckoutData.notes}</p>
                </div>
              )}
            </div>
          )}

          <h3 className="font-semibold text-base mt-4">Mensaje para WhatsApp:</h3>
          <div className="bg-gray-100 p-3 rounded text-sm text-gray-800 break-words whitespace-pre-wrap max-h-60 overflow-y-auto">
            {whatsappMessageContent}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button onClick={handleCopyWhatsAppMessage} variant="secondary" className="flex-1 flex items-center gap-2">
              {copiedWhatsAppMessage ? <Check size={16} /> : <Copy size={16} />}
              {copiedWhatsAppMessage ? "Mensaje copiado" : "Copiar mensaje"}
            </Button>
            <Button onClick={handleOpenWhatsAppAndRedirect} className="flex-1 flex items-center gap-2">
              Abrir WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
