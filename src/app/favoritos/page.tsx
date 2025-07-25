"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useFavorites } from "@/contexts/favorites-context"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/types/product"
import type { CartItem } from "@/types/cart"
import Link from "next/link"

export default function FavoritesPage() {
  const router = useRouter()
  const { favorites, removeFavorite } = useFavorites()
  const { addItem } = useCart()
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  const handleAddToCart = async (product: Product) => {
    setAddingToCart(product.id)

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url || "/placeholder.svg", // Use image_url
      category: product.category_name || "",
      brand: product.brand || "",
      stock: product.stock,
      quantity: 1, // Default quantity for adding from favorites
    } as CartItem)

    setTimeout(() => {
      setAddingToCart(null)
    }, 1000)
  }

  const formatPrice = (price: number) => {
    return `S/ ${price.toFixed(2)}`
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">No tienes favoritos</h1>
              <p className="text-gray-600 mb-8">
                Agrega productos a tus favoritos para encontrarlos fácilmente más tarde
              </p>
              <Button onClick={() => router.push("/buscar")} className="bg-green-600 hover:bg-green-700">
                Explorar Productos
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced "Volver" button section */}
      <div className="bg-white shadow-sm py-4 border-b border-gray-200">
        {/* Removed container mx-auto max-w-6xl from here */}
        <div className="flex justify-start pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8">
          <Link href="/" passHref>
            <Button
              variant="outline"
              className="flex items-center space-x-2 py-2 rounded-lg shadow-md transition-colors duration-200 hover:bg-gray-50 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al inicio</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
            <p className="text-gray-600">
              {favorites.length} producto{favorites.length !== 1 ? "s" : ""} en tus favoritos
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product: Product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />

                    {product.stock === 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white">Sin Stock</Badge>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFavorite(product.id)}
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.category_name}</p>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">{formatPrice(product.price)}</span>
                      </div>

                      <div className="text-xs text-gray-600 mt-1">
                        {product.stock > 0 ? (
                          <span className="text-green-600">{product.stock} disponibles</span>
                        ) : (
                          <span className="text-red-600">Sin stock</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0 || addingToCart === product.id}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                      >
                        {addingToCart === product.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Agregando...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {product.stock > 0 ? "Agregar al Carrito" : "Sin Stock"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
