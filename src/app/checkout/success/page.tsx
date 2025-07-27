"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  CreditCard,
  Smartphone,
  Building2,
  Download,
  Mail,
  ArrowRight,
  Package,
  Clock,
} from "lucide-react"

const PAYMENT_METHOD_ICONS = {
  card: CreditCard,
  yape: Smartphone,
  plin: Smartphone,
  transfer: Building2,
}

const PAYMENT_METHOD_NAMES = {
  card: "Tarjeta de Crédito/Débito",
  yape: "Yape",
  plin: "Plin",
  transfer: "Transferencia Bancaria",
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderData, setOrderData] = useState({
    orderId: "",
    method: "card" as keyof typeof PAYMENT_METHOD_ICONS,
    total: "0.00",
  })

  useEffect(() => {
    // Read orderId, method, and total directly from search parameters
    const orderIdFromUrl = searchParams.get("orderId") || ""
    const method = (searchParams.get("method") as keyof typeof PAYMENT_METHOD_ICONS) || "card"
    const total = searchParams.get("total") || "0.00"

    setOrderData({ orderId: orderIdFromUrl, method, total })
  }, [searchParams])

  const PaymentIcon = PAYMENT_METHOD_ICONS[orderData.method]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Confirmación principal */}
        <Card className="text-center mb-6">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-primary mb-2">¡Pedido Confirmado!</CardTitle>
            <p className="text-gray-600">Tu pedido ha sido procesado exitosamente</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Información del pedido */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Número de Pedido</p>
                  <p className="font-mono font-medium">{orderData.orderId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Método de Pago</p>
                  <div className="flex items-center gap-2">
                    <PaymentIcon className="h-4 w-4" />
                    <span className="font-medium">{PAYMENT_METHOD_NAMES[orderData.method]}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Total Pagado</p>
                  <p className="font-bold text-primary text-lg">S/ {orderData.total}</p>
                </div>
              </div>
            </div>

            {/* Estado del pedido */}
            <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-blue-900">Preparando tu pedido</p>
                  <p className="text-sm text-blue-700">Estimado: 24-48 horas</p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">En proceso</Badge>
            </div>

            {/* Próximos pasos */}
            <div className="text-left space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">¿Qué sigue?</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>Te enviaremos un email de confirmación</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span>Prepararemos tu pedido en nuestro almacén</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span>Te notificaremos cuando esté en camino</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={() => router.push("/")} className="flex-1 bg-primary hover:bg-primary/90">
                Seguir Comprando
              </Button>
              <Button variant="outline" onClick={() => router.push("/mi-cuenta")} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Ver Mis Pedidos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Soporte al Cliente</h4>
              <p className="text-gray-600 mb-2">¿Necesitas ayuda con tu pedido?</p>
              <p className="text-primary font-medium">WhatsApp: +51 930 104 083</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Política de Devoluciones</h4>
              <p className="text-gray-600 mb-2">30 días para devoluciones</p>
              <p className="text-primary font-medium">100% garantizado</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
