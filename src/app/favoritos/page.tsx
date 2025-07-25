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
            <div className="bg-white rounded-lg shadow-sm p-12 sm:p-8">
              {" "}
              {/* Adjusted padding for mobile */}
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-6 sm:h-12 sm:w-12 sm:mb-4" />{" "}
              {/* Smaller icon for mobile */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:text-xl">No tienes favoritos</h1>{" "}
              {/* Smaller text for mobile */}
              <p className="text-gray-600 mb-8 sm:text-sm sm:mb-6">
                {" "}
                {/* Smaller text for mobile */}
                Agrega productos a tus favoritos para encontrarlos fácilmente más tarde
              </p>
              <Button
                onClick={() => router.push("/buscar")}
                className="bg-green-600 hover:bg-green-700 text-sm sm:text-base"
              >
                {" "}
                {/* Adjusted button size for mobile */}
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
      <div className="bg-white shadow-sm py-3 border-b border-gray-200 sm:py-4">
        {" "}
        {/* Reduced vertical padding for mobile */}
        <div className="flex justify-start pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8">
          <Link href="/" passHref>
            <Button
              variant="outline"
              className="flex items-center space-x-2 py-1.5 h-auto rounded-lg shadow-md transition-colors duration-200 hover:bg-gray-50 bg-transparent text-sm" // Smaller button for mobile
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al inicio</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {" "}
        {/* Reduced vertical padding for mobile */}
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 sm:mb-8">
            {" "}
            {/* Reduced margin-bottom for mobile */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Favoritos</h1>{" "}
            {/* Adjusted text size for mobile */}
            <p className="text-gray-600 text-sm sm:text-base">
              {" "}
              {/* Adjusted text size for mobile */}
              {favorites.length} producto{favorites.length !== 1 ? "s" : ""} en tus favoritos
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {" "}
            {/* Changed to grid-cols-2 for mobile */}
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
                      <Badge className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1.5 py-0.5">
                        Sin Stock
                      </Badge> // Smaller badge for mobile
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFavorite(product.id)}
                      className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-500 hover:text-red-600 h-7 w-7 p-0" // Smaller button for mobile
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {/* Smaller icon for mobile */}
                    </Button>
                  </div>

                  <div className="p-3 sm:p-4">
                    {" "}
                    {/* Reduced padding for mobile */}
                    <div className="mb-1.5 sm:mb-2">
                      {" "}
                      {/* Reduced margin-bottom for mobile */}
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 mb-0.5">
                        {product.name}
                      </h3>{" "}
                      {/* Adjusted text size for mobile */}
                      <p className="text-xs text-gray-600">{product.category_name}</p>{" "}
                      {/* Adjusted text size for mobile */}
                    </div>
                    <div className="mb-3 sm:mb-4">
                      {" "}
                      {/* Reduced margin-bottom for mobile */}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {" "}
                        {/* Reduced gap for mobile */}
                        <span className="text-base sm:text-lg font-bold text-green-600">
                          {formatPrice(product.price)}
                        </span>{" "}
                        {/* Adjusted text size for mobile */}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5 sm:mt-1">
                        {" "}
                        {/* Adjusted text size and margin for mobile */}
                        {product.stock > 0 ? (
                          <span className="text-green-600">{product.stock} disponibles</span>
                        ) : (
                          <span className="text-red-600">Sin stock</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      {" "}
                      {/* Reduced space-y for mobile */}
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0 || addingToCart === product.id}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-sm h-8" // Adjusted button size for mobile
                      >
                        {addingToCart === product.id ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />{" "}
                            {/* Smaller spinner for mobile */}
                            Agregando...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> {/* Smaller icon for mobile */}
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
