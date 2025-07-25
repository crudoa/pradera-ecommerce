"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Truck, Clock, MapPin, Package } from "lucide-react"
import Image from "next/image"

interface ShippingMethod {
  id: string
  name: string
  company: string
  price: number
  estimatedDays: string
  description: string
  logo: string
  available: boolean
  features: string[]
}

interface ShippingMethodsProfessionalProps {
  selectedMethod: string | null // Can be null initially
  onMethodChange: (methodId: string, cost: number) => void
  destination: "lima" | "provincias" | null // Can be null if not yet determined
  weight: number
}

export function ShippingMethodsProfessional({
  selectedMethod,
  onMethodChange,
  destination,
  weight,
}: ShippingMethodsProfessionalProps) {
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Obtener cotizaciones reales de envío
  useEffect(() => {
    const fetchShippingQuotes = async () => {
      if (!destination || weight <= 0) {
        setMethods([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError("")

      try {
        const response = await fetch("/api/shipping/quote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            destination,
            weight,
            dimensions: {
              length: 30,
              width: 20,
              height: 15,
            },
          }),
        })

        const result = await response.json()

        if (result.success) {
          const fetchedQuotes: ShippingMethod[] = result.quotes.map((quote: any) => ({
            id: quote.id,
            name: quote.service,
            company: quote.company,
            price: quote.price,
            estimatedDays: quote.estimatedDays,
            description: quote.description,
            logo: quote.logo,
            available: true, // Assume available if returned by API
            features: ["Seguimiento en línea"], // Default feature, can be enhanced by API
          }))
          setMethods(fetchedQuotes)
          // Automatically select the cheapest method if none is selected
          if (!selectedMethod && fetchedQuotes.length > 0) {
            const cheapest = fetchedQuotes.sort((a, b) => a.price - b.price)[0]
            onMethodChange(cheapest.id, cheapest.price)
          }
        } else {
          // Fallback a métodos predeterminados si la API falla
          const defaultMethods = getDefaultMethods(destination, weight)
          setMethods(defaultMethods)
          if (!selectedMethod && defaultMethods.length > 0) {
            const cheapest = defaultMethods.sort((a, b) => a.price - b.price)[0]
            onMethodChange(cheapest.id, cheapest.price)
          }
        }
      } catch (error) {
        console.error("Error obteniendo cotizaciones:", error)
        // Fallback a métodos predeterminados
        const defaultMethods = getDefaultMethods(destination, weight)
        setMethods(defaultMethods)
        if (!selectedMethod && defaultMethods.length > 0) {
          const cheapest = defaultMethods.sort((a, b) => a.price - b.price)[0]
          onMethodChange(cheapest.id, cheapest.price)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchShippingQuotes()
  }, [destination, weight, onMethodChange, selectedMethod]) // Add onMethodChange and selectedMethod to dependencies

  // Métodos de envío predeterminados como fallback
  const getDefaultMethods = (dest: "lima" | "provincias", currentWeight: number): ShippingMethod[] => {
    const baseMethods: ShippingMethod[] = [
      {
        id: "olva_express",
        name: "Olva Express",
        company: "Olva Courier",
        price: dest === "lima" ? 15 : 25,
        estimatedDays: dest === "lima" ? "1-2 días" : "3-5 días",
        description: "Entrega rápida y segura",
        logo: "/images/shipping/olva.png",
        available: true,
        features: ["Seguimiento en línea", "Seguro incluido", "Entrega a domicilio"],
      },
      {
        id: "shalom_economico",
        name: "Shalom Económico",
        company: "Shalom",
        price: dest === "lima" ? 12 : 20,
        estimatedDays: dest === "lima" ? "2-3 días" : "4-6 días",
        description: "Opción económica confiable",
        logo: "/images/shipping/shalom.png",
        available: true,
        features: ["Precio económico", "Red nacional", "Atención personalizada"],
      },
    ]

    if (dest === "provincias") {
      baseMethods.push(
        {
          id: "cruz_del_sur",
          name: "Cruz del Sur Cargo",
          company: "Cruz del Sur",
          price: 30,
          estimatedDays: "2-4 días",
          description: "Transporte terrestre premium",
          logo: "/images/shipping/cruz-del-sur.png",
          available: true,
          features: ["Red nacional", "Horarios frecuentes", "Oficinas en destino"],
        },
        {
          id: "marvisur",
          name: "Marvisur",
          company: "Marvisur",
          price: 22,
          estimatedDays: "3-5 días",
          description: "Especialistas en envíos interprovinciales",
          logo: "/images/shipping/marvisur.png",
          available: true,
          features: ["Cobertura nacional", "Precios competitivos", "Seguimiento SMS"],
        },
      )
    } else {
      // Métodos adicionales para Lima
      baseMethods.push({
        id: "delivery_express",
        name: "Delivery Express",
        company: "AgroBesser",
        price: 0, // Gratis
        estimatedDays: "Mismo día",
        description: "Entrega gratuita en Lima Metropolitana",
        logo: "/placeholder.svg?height=40&width=80",
        available: currentWeight <= 10, // Solo para pedidos ligeros
        features: ["Gratis", "Mismo día", "Lima Metropolitana"],
      })
    }

    // Ajustar precios por peso
    return baseMethods.map((method) => ({
      ...method,
      price: method.price + (currentWeight > 5 ? Math.ceil((currentWeight - 5) * 2) : 0),
      available: method.available && currentWeight <= 50, // Límite de peso
    }))
  }

  const handleMethodSelect = (method: ShippingMethod) => {
    onMethodChange(method.id, method.price)
  }

  if (!destination || weight <= 0) {
    return null // Don't render if destination or weight is not set
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Obteniendo cotizaciones de envío...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="text-green-600 border-green-600 hover:bg-green-50"
        >
          Reintentar
        </Button>
      </div>
    )
  }

  const availableMethods = methods.filter((method) => method.available)

  if (availableMethods.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">No hay métodos de envío disponibles</p>
        <p className="text-sm text-gray-500">
          Para pedidos de {weight.toFixed(1)}kg a {destination === "lima" ? "Lima" : "provincias"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Información del envío */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-blue-800 text-sm font-medium mb-2">
          <MapPin className="h-4 w-4" />
          Información del Envío
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <span className="font-medium">Destino:</span> {destination === "lima" ? "Lima Metropolitana" : "Provincias"}
          </div>
          <div>
            <span className="font-medium">Peso estimado:</span> {weight.toFixed(1)} kg
          </div>
        </div>
      </div>

      {/* Métodos de envío */}
      <div className="space-y-3">
        {availableMethods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedMethod === method.id ? "ring-2 ring-green-500 bg-green-50" : "hover:bg-gray-50"
            }`}
            onClick={() => handleMethodSelect(method)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Logo de la empresa */}
                  <div className="w-16 h-10 relative bg-white rounded border flex items-center justify-center">
                    <Image
                      src={method.logo || "/placeholder.svg"}
                      alt={method.company}
                      width={60}
                      height={30}
                      className="object-contain"
                      onError={(e) => {
                        // Fallback si la imagen no carga
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=30&width=60"
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{method.name}</h3>
                      {method.price === 0 && <Badge className="bg-green-100 text-green-800 text-xs">GRATIS</Badge>}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{method.description}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {method.estimatedDays}
                      </div>
                      <div className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        {method.company}
                      </div>
                    </div>

                    {/* Características */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {method.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Precio */}
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {method.price === 0 ? "GRATIS" : `S/ ${method.price.toFixed(2)}`}
                  </div>
                  {method.price > 0 && weight > 5 && (
                    <div className="text-xs text-gray-500">Incluye {weight.toFixed(1)}kg</div>
                  )}
                </div>
              </div>

              {/* Radio button visual */}
              <div className="flex justify-end mt-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === method.id ? "border-green-500 bg-green-500" : "border-gray-300"
                  }`}
                >
                  {selectedMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Información importante:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Los tiempos de entrega son estimados y pueden variar</li>
          <li>• Todos los envíos incluyen seguro básico</li>
          <li>• Recibirás un código de seguimiento por email y SMS</li>
          <li>• Para envíos a provincias, se requiere DNI del destinatario</li>
          {destination === "lima" && <li>• Entregas en Lima de lunes a sábado de 9:00 AM a 6:00 PM</li>}
        </ul>
      </div>

      {selectedMethod && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-800 font-medium">
            <Truck className="h-4 w-4" />
            Método de envío seleccionado
          </div>
          <div className="mt-2 text-sm text-green-700">
            {availableMethods.find((m) => m.id === selectedMethod)?.name} -
            {availableMethods.find((m) => m.id === selectedMethod)?.estimatedDays}
          </div>
        </div>
      )}
    </div>
  )
}
