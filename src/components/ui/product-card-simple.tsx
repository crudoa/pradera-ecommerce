"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  product: any
}

export function ProductCardSimple({ product }: ProductCardProps) {
  if (!product) {
    return (
      <Card className="p-4">
        <div className="text-red-500">Producto inválido</div>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="relative overflow-hidden">
        <img
          src="/placeholder.svg?height=200&width=200"
          alt={product.name || "Producto"}
          className="w-full h-48 object-cover"
        />
      </div>

      <CardContent className="p-4">
        <h3 className="font-medium text-gray-900 mb-2">{product.name || "Sin nombre"}</h3>
        <div className="text-lg font-bold text-primary mb-3">S/ {(product.price || 0).toFixed(2)}</div>
        <Button className="w-full bg-primary hover:bg-primary/90">Agregar al Carrito</Button>
      </CardContent>
    </Card>
  )
}

export default ProductCardSimple
