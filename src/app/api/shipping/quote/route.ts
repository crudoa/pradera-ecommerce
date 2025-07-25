import { type NextRequest, NextResponse } from "next/server"

interface ShippingQuoteRequest {
  destination: "lima" | "provincias"
  weight: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
}

interface ShippingQuote {
  id: string
  company: string
  service: string
  price: number
  estimatedDays: string
  trackingAvailable: boolean
  description: string
  logo?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ShippingQuoteRequest = await request.json()
    const { destination, weight, dimensions } = body

    // Validar datos de entrada
    if (!destination || !weight) {
      return NextResponse.json({ success: false, error: "Faltan datos requeridos" }, { status: 400 })
    }

    if (weight <= 0 || weight > 50) {
      return NextResponse.json({ success: false, error: "Peso debe estar entre 0.1 y 50 kg" }, { status: 400 })
    }

    const quotes: ShippingQuote[] = []

    // Obtener cotizaciones reales
    try {
      // Intentar obtener cotizaciones de APIs reales
      const realQuotes = await getRealShippingQuotes(destination, weight, dimensions)
      quotes.push(...realQuotes)
    } catch (error) {
      console.error("Error obteniendo cotizaciones reales:", error)
      // Fallback a cotizaciones predeterminadas
      const fallbackQuotes = getFallbackQuotes(destination, weight)
      quotes.push(...fallbackQuotes)
    }

    // Filtrar y ordenar cotizaciones
    const availableQuotes = quotes.filter((quote) => quote.price >= 0).sort((a, b) => a.price - b.price)

    return NextResponse.json({
      success: true,
      quotes: availableQuotes,
      destination,
      weight,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en API de cotizaciones:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

// Obtener cotizaciones reales de APIs de empresas de envío
async function getRealShippingQuotes(destination: string, weight: number, dimensions?: any): Promise<ShippingQuote[]> {
  const quotes: ShippingQuote[] = []

  // Olva Courier API
  try {
    const olvaQuote = await getOlvaQuote(destination, weight)
    if (olvaQuote) quotes.push(olvaQuote)
  } catch (error) {
    console.error("Error Olva API:", error)
  }

  // Shalom API
  try {
    const shalomQuote = await getShalomQuote(destination, weight)
    if (shalomQuote) quotes.push(shalomQuote)
  } catch (error) {
    console.error("Error Shalom API:", error)
  }

  // Cruz del Sur (solo provincias)
  if (destination === "provincias") {
    try {
      const cruzQuote = await getCruzDelSurQuote(weight)
      if (cruzQuote) quotes.push(cruzQuote)
    } catch (error) {
      console.error("Error Cruz del Sur API:", error)
    }
  }

  return quotes
}

// API de Olva Courier
async function getOlvaQuote(destination: string, weight: number): Promise<ShippingQuote | null> {
  const olvaApiKey = process.env.OLVA_API_KEY

  if (!olvaApiKey) {
    console.warn("OLVA_API_KEY no configurada")
    return null
  }

  try {
    const response = await fetch("https://api.olvacourier.com/v1/quote", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${olvaApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        origin: "Lima",
        destination: destination === "lima" ? "Lima" : "Provincias",
        weight: weight,
        service_type: "standard",
      }),
    })

    if (!response.ok) {
      throw new Error(`Olva API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      id: "olva_standard",
      company: "Olva Courier",
      service: "Servicio Estándar",
      price: data.price || (destination === "lima" ? 15 : 25),
      estimatedDays: data.estimated_days || (destination === "lima" ? "1-3 días" : "3-7 días"),
      trackingAvailable: true,
      description: "Entrega confiable con seguimiento",
      logo: "/images/shipping/olva.png",
    }
  } catch (error) {
    console.error("Error en Olva API:", error)
    return null
  }
}

// API de Shalom
async function getShalomQuote(destination: string, weight: number): Promise<ShippingQuote | null> {
  const shalomApiKey = process.env.SHALOM_API_KEY

  if (!shalomApiKey) {
    console.warn("SHALOM_API_KEY no configurada")
    return null
  }

  try {
    const response = await fetch("https://api.shalom.com.pe/v1/cotizar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${shalomApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        origen: "Lima",
        destino: destination === "lima" ? "Lima" : "Nacional",
        peso: weight,
        tipo_servicio: "economico",
      }),
    })

    if (!response.ok) {
      throw new Error(`Shalom API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      id: "shalom_economico",
      company: "Shalom",
      service: "Servicio Económico",
      price: data.precio || (destination === "lima" ? 12 : 20),
      estimatedDays: data.tiempo_entrega || (destination === "lima" ? "2-4 días" : "4-8 días"),
      trackingAvailable: true,
      description: "Opción económica y confiable",
      logo: "/images/shipping/shalom.png",
    }
  } catch (error) {
    console.error("Error en Shalom API:", error)
    return null
  }
}

// API de Cruz del Sur
async function getCruzDelSurQuote(weight: number): Promise<ShippingQuote | null> {
  try {
    // Cruz del Sur no tiene API pública, usar precios estándar
    const basePrice = 30
    const weightSurcharge = weight > 5 ? (weight - 5) * 3 : 0

    return {
      id: "cruz_del_sur",
      company: "Cruz del Sur",
      service: "Cargo Terrestre",
      price: basePrice + weightSurcharge,
      estimatedDays: "2-5 días",
      trackingAvailable: true,
      description: "Transporte terrestre confiable",
      logo: "/images/shipping/cruz-del-sur.png",
    }
  } catch (error) {
    console.error("Error en Cruz del Sur:", error)
    return null
  }
}

// Cotizaciones de fallback cuando las APIs fallan
function getFallbackQuotes(destination: string, weight: number): ShippingQuote[] {
  const quotes: ShippingQuote[] = []

  // Precios base
  const olvaPrice = destination === "lima" ? 15 : 25
  const shalomPrice = destination === "lima" ? 12 : 20

  // Recargo por peso adicional
  const weightSurcharge = weight > 5 ? Math.ceil((weight - 5) * 2) : 0

  quotes.push({
    id: "olva_fallback",
    company: "Olva Courier",
    service: "Servicio Estándar",
    price: olvaPrice + weightSurcharge,
    estimatedDays: destination === "lima" ? "1-3 días" : "3-7 días",
    trackingAvailable: true,
    description: "Entrega confiable con seguimiento",
    logo: "/images/shipping/olva.png",
  })

  quotes.push({
    id: "shalom_fallback",
    company: "Shalom",
    service: "Servicio Económico",
    price: shalomPrice + weightSurcharge,
    estimatedDays: destination === "lima" ? "2-4 días" : "4-8 días",
    trackingAvailable: true,
    description: "Opción económica y confiable",
    logo: "/images/shipping/shalom.png",
  })

  // Opciones adicionales según destino
  if (destination === "lima") {
    // Delivery gratuito para Lima en pedidos grandes
    if (weight <= 10) {
      quotes.push({
        id: "delivery_gratis",
        company: "AgroBesser",
        service: "Delivery Gratuito",
        price: 0,
        estimatedDays: "1-2 días",
        trackingAvailable: true,
        description: "Entrega gratuita en Lima Metropolitana",
        logo: "/placeholder.svg?height=40&width=80",
      })
    }
  } else {
    // Opciones adicionales para provincias
    quotes.push({
      id: "cruz_del_sur_fallback",
      company: "Cruz del Sur",
      service: "Cargo Terrestre",
      price: 30 + weightSurcharge,
      estimatedDays: "2-5 días",
      trackingAvailable: true,
      description: "Transporte terrestre confiable",
      logo: "/images/shipping/cruz-del-sur.png",
    })

    quotes.push({
      id: "marvisur_fallback",
      company: "Marvisur",
      service: "Envío Nacional",
      price: 22 + weightSurcharge,
      estimatedDays: "3-6 días",
      trackingAvailable: true,
      description: "Especialistas en envíos interprovinciales",
      logo: "/images/shipping/marvisur.png",
    })
  }

  return quotes
}

export async function GET() {
  return NextResponse.json({
    message: "API de cotizaciones de envío",
    endpoints: {
      POST: "/api/shipping/quote - Obtener cotizaciones",
    },
    version: "1.0.0",
  })
}
