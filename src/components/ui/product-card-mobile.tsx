"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Heart, ShoppingCart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import type { Product } from "@/types/product"

interface ProductCardMobileProps {
  product: Product
  onQuickView?: (product: Product) => void
}

export function ProductCardMobile({ product, onQuickView }: ProductCardMobileProps) {
  const { addItem } = useCart()
  const { favorites, addFavorite, removeFavorite } = useFavorites()
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isFavorite = favorites.some((fav) => fav.id === product.id)
  const isOutOfStock = product.stock <= 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock) return

    setIsLoading(true)
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || "/placeholder.svg?height=200&width=200",
        quantity: 1,
        stock: product.stock,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isFavorite) {
      removeFavorite(product.id)
    } else {
      addFavorite(product)
    }
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(product)
  }

  return (
    <Card className="group relative overflow-hidden hover:shadow-md transition-all duration-300 h-full">
      <CardContent className="p-2">
        {/* Image Container - smaller for mobile */}
        <div className="relative aspect-square mb-2 overflow-hidden rounded-lg bg-secondary">
          <Image
            src={
              imageError
                ? "/placeholder.svg?height=150&width=150"
                : product.image_url || "/placeholder.svg?height=150&width=150"
            }
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 150px, (max-width: 768px) 200px, 250px"
          />

          {/* Stock badge */}
          {isOutOfStock && <Badge className="absolute top-1 left-1 bg-destructive text-white text-xs">Agotado</Badge>}

          {/* Action buttons - smaller for mobile */}
          <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-6 w-6 rounded-full shadow-md"
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-3 w-3 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            {onQuickView && (
              <Button
                size="icon"
                variant="secondary"
                className="h-6 w-6 rounded-full shadow-md"
                onClick={handleQuickView}
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Product Info - more compact */}
        <div className="space-y-1">
          <h3 className="font-medium text-xs leading-tight line-clamp-2 min-h-[2rem]">{product.name}</h3>

          {product.category_name && <p className="text-xs text-muted-foreground">{product.category_name}</p>}

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-primary">S/ {product.price.toFixed(2)}</span>
              {product.stock > 0 && <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>}
            </div>

            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLoading}
              className="h-7 px-2 text-xs"
            >
              {isLoading ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <ShoppingCart className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
