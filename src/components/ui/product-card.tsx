"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Heart, ShoppingCart, Eye, Star, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import ProductDetailModal from "@/components/ui/product-detail-modal"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import type { Product } from "@/types/product"
import type { CartItem } from "@/types/cart"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [showAdded, setShowAdded] = useState(false)
  const { addItem } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (isAdding || showAdded || product.stock === 0) return

    setIsAdding(true)

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url || "/placeholder.svg?height=200&width=200",
      category: product.category_name || "",
      brand: product.brand || "",
      stock: product.stock,
      quantity: 1,
    } as CartItem)

    setTimeout(() => {
      setIsAdding(false)
      setShowAdded(true)

      setTimeout(() => {
        setShowAdded(false)
      }, 2000)
    }, 600)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(product)
  }

  const handleCardClick = () => {
    setShowModal(true)
  }

  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  return (
    <>
      <Card
        className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.image_url || "/placeholder.svg?height=300&width=300"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {isOutOfStock && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Agotado
            </Badge>
          )}
          {isLowStock && (
            <Badge variant="secondary" className="absolute top-2 left-2 bg-orange-100 text-orange-800">
              Últimas unidades
            </Badge>
          )}

          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorite(product.id) ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(true)
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-sm line-clamp-2 mb-1 text-gray-900">{product.name}</h3>
            {product.brand && <p className="text-xs text-gray-500">{product.brand}</p>}
            {product.description && <p className="text-xs text-gray-600 line-clamp-2 mt-1">{product.description}</p>}
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary">S/ {product.price.toFixed(2)}</span>
              <span className="text-xs text-gray-500">Stock: {product.stock}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">5.0</span>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full transition-all duration-500 ease-in-out transform ${
              showAdded
                ? "bg-emerald-500 hover:bg-emerald-600 scale-105 shadow-lg"
                : isAdding
                  ? "bg-blue-500 hover:bg-blue-600 scale-102"
                  : "bg-primary hover:bg-primary/90 hover:scale-102"
            }`}
            size="sm"
          >
            {isOutOfStock ? (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Agotado
              </>
            ) : showAdded ? (
              <>
                <Check className="h-4 w-4 mr-2 animate-bounce" />
                ¡Agregado!
              </>
            ) : isAdding ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Agregando...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Agregar al carrito
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <ProductDetailModal product={product} isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}

export default ProductCard
