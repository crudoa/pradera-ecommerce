"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import type { Product } from "@/types/product"
import type { Json } from "@/types/database" // Import Json from database.ts

interface ProductComparisonProps {
  products: Product[]
  onRemoveProduct: (productId: string) => void
  onAddToCart: (product: Product) => void
  className?: string
}

export const ProductComparison: React.FC<ProductComparisonProps> = ({
  products,
  onRemoveProduct,
  onAddToCart,
  className = "",
}) => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  if (products.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <Plus className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos para comparar</h3>
          <p className="text-gray-600">Agrega productos para compararlos lado a lado</p>
        </CardContent>
      </Card>
    )
  }

  // Extraer todas las características únicas
  const allFeatures = Array.from(
    new Set(
      products.flatMap((product) =>
        Object.keys(
          product.specifications && typeof product.specifications === "object" && !Array.isArray(product.specifications)
            ? (product.specifications as Record<string, Json>)
            : {},
        ),
      ),
    ),
  )

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Comparar Productos</h2>
        <p className="text-sm text-gray-600">{products.length} de 4 productos máximo</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10 h-8 w-8 p-0"
                  onClick={() => onRemoveProduct(product.id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <CardHeader className="pb-2">
                  <div className="aspect-square relative mb-2">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <CardTitle className="text-sm line-clamp-2">{product.name}</CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">S/ {product.price.toFixed(2)}</span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-sm text-gray-500 line-through">S/ {product.original_price.toFixed(2)}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Información básica */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Categoría:</span>
                      <span className="font-medium">{product.category_name}</span> {/* Changed to category_name */}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marca:</span>
                      <span className="font-medium">{product.brand || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock:</span>
                      <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                        {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
                      </Badge>
                    </div>
                  </div>

                  {/* Especificaciones */}
                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Especificaciones:</h4>
                      <div className="space-y-1 text-xs">
                        {Object.entries(product.specifications as Record<string, Json>).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botón de agregar al carrito */}
                  <Button
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full"
                    size="sm"
                  >
                    {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de comparación detallada */}
      {allFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparación Detallada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Característica</th>
                    {products.map((product) => (
                      <th key={product.id} className="text-left py-2 px-4 min-w-[150px]">
                        {product.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature) => (
                    <tr key={feature} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-medium">{feature}</td>
                      {products.map((product) => (
                        <td key={product.id} className="py-2 px-4">
                          {product.specifications &&
                          typeof product.specifications === "object" &&
                          !Array.isArray(product.specifications)
                            ? String((product.specifications as Record<string, Json>)[feature])
                            : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
