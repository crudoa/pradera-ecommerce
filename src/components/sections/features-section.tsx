"use client"

import { Leaf, Award, Headphones, CreditCard, Truck, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Leaf,
    title: "Productos Orgánicos",
    description: "Certificados y libres de químicos dañinos",
    color: "text-primary", // Changed from text-green-600
  },
  {
    icon: Award,
    title: "Calidad Premium",
    description: "Solo trabajamos con las mejores marcas",
    color: "text-accent", // Changed from text-yellow-600
  },
  {
    icon: Headphones,
    title: "Soporte 24/7",
    description: "Atención personalizada cuando la necesites",
    color: "text-primary", // Changed from text-blue-600
  },
  {
    icon: CreditCard,
    title: "Pago Seguro",
    description: "Múltiples métodos de pago protegidos",
    color: "text-primary", // Changed from text-purple-600
  },
  {
    icon: Truck,
    title: "Envío Rápido",
    description: "Entrega en 24-48 horas en Lima",
    color: "text-accent", // Changed from text-orange-600
  },
  {
    icon: Shield,
    title: "Garantía Total",
    description: "30 días de garantía en todos los productos",
    color: "text-destructive", // Kept as is for error/danger
  },
]

export function FeaturesSection() {
  return (
    <section className="py-12 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegir AgroBesser?</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Somos tu socio confiable en el mundo agrícola, comprometidos con la calidad y tu éxito
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card key={index} className="card-hover border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <Icon className={`h-12 w-12 mx-auto ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
