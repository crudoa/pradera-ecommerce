"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useFavorites } from "@/contexts/favorites-context"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/types/product"
import type { CartItem } from "@/types/cart"
import Header from "@/components/layout/header" // Import the Header component
import { Footer } from "@/components/layout/footer" // Import Footer if not already present
import Image from "next/image" // Import Image component

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
      image_url: product.image_url || "/placeholder.svg", // Use first image from image_urls
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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header hideSearchBar />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-lg shadow-sm p-12 sm:p-8">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-6 sm:h-12 sm:w-12 sm:mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:text-xl">No tienes favoritos</h1>
                <p className="text-gray-600 mb-8 sm:text-sm sm:mb-6">
                  Agrega productos a tus favoritos para encontrarlos fácilmente más tarde
                </p>
                <Button
                  onClick={() => router.push("/buscar")}
                  className="bg-green-600 hover:bg-green-700 text-sm sm:text-base"
                >
                  Explorar Productos
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header hideSearchBar />
      <main className="flex-1 py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Favoritos</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {favorites.length} producto{favorites.length !== 1 ? "s" : ""} en tus favoritos
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {favorites.map((product: Product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-0">
                    <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                      <Image
                        src={product.image_url || "/placeholder.svg"} // Use first image from image_urls
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />

                      {product.stock === 0 && (
                        <Badge className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1.5 py-0.5">
                          Sin Stock
                        </Badge>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFavorite(product.id)}
                        className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-500 hover:text-red-600 h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="p-3 sm:p-4">
                      <div className="mb-1.5 sm:mb-2">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 mb-0.5">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-600">{product.category_name}</p>
                      </div>
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-base sm:text-lg font-bold text-green-600">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5 sm:mt-1">
                          {product.stock > 0 ? (
                            <span className="text-green-600">{product.stock} disponibles</span>
                          ) : (
                            <span className="text-red-600">Sin stock</span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0 || addingToCart === product.id}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-sm h-8"
                        >
                          {addingToCart === product.id ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                              Agregando...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
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
      </main>
      <Footer />
    </div>
  )
}
