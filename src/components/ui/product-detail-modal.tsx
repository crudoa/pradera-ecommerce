"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Plus, Minus, Heart, Star, Check, Package, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import type { Product } from "@/types/product"
import type { CartItem } from "@/types/cart"

interface ProductDetailModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [imageError, setImageError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [showAdded, setShowAdded] = useState(false)

  const { addItem } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1)
      setShowAdded(false)
      setIsAdding(false)
      setImageError(false)
    }
  }, [isOpen, product])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!product || !isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleAddToCart = async () => {
    if (isAdding || showAdded || product.stock === 0) return

    setIsAdding(true)

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url || "/placeholder.svg?height=100&width=100",
      category: product.category_name || "Productos",
      brand: product.brand || "",
      stock: product.stock,
      quantity: quantity, // Use the selected quantity
    } as CartItem)

    setTimeout(() => {
      setIsAdding(false)
      setShowAdded(true)

      setTimeout(() => {
        setQuantity(1)
      }, 100)

      setTimeout(() => {
        setShowAdded(false)
        onClose()
      }, 1500)
    }, 800)
  }

  const handleFavoriteToggle = () => {
    toggleFavorite(product)
  }

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const formatPrice = (price: number) => {
    return `S/ ${price.toFixed(2)}`
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
  }

  const getStockStatus = () => {
    const stock = product.stock
    if (!stock || stock === 0) {
      return { text: "Sin stock", color: "text-red-600", bgColor: "bg-red-50" }
    }
    if (stock <= 10) {
      return { text: `Solo ${stock} disponibles`, color: "text-orange-600", bgColor: "bg-orange-50" }
    }
    return { text: `${stock} unidades`, color: "text-green-600", bgColor: "bg-green-50" }
  }

  const specifications = [
    {
      label: "Categoría",
      value: product.category_name,
    },
    {
      label: "Marca",
      value: product.brand,
    },
    {
      label: "SKU",
      value: product.sku,
    },
    {
      label: "Stock disponible",
      value: `${product.stock} unidades`,
    },
    {
      label: "Estado",
      value: product.is_active ? "Activo" : "Inactivo",
    },
  ].filter((spec) => spec.value && spec.value !== "null" && spec.value !== null)

  const stockStatus = getStockStatus()
  const inStock = product.stock > 0

  const imageUrl = imageError
    ? "/placeholder.svg?height=400&width=400"
    : product.image_url || "/placeholder.svg?height=400&width=400"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleBackdropClick}>
      <div
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 pr-8">{product.name}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="space-y-4">
            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />

              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {!inStock && <Badge className="bg-red-500 text-white hover:bg-red-600">Sin Stock</Badge>}
                {product.stock <= 10 && product.stock > 0 && (
                  <Badge className="bg-orange-500 text-white hover:bg-orange-600">Últimas unidades</Badge>
                )}
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleFavoriteToggle}
                className={`absolute top-4 right-4 bg-white/80 hover:bg-white hover:scale-110 transition-all duration-200 ${
                  isFavorite(product.id) ? "text-red-500" : "text-gray-600"
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite(product.id) ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center">{renderStars()}</div>
              <span className="text-sm text-gray-600">(5.0) • Excelente calidad</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-green-600">{formatPrice(product.price)}</span>
              </div>
              <span className="text-sm text-gray-500">Impuestos incluidos</span>
            </div>

            {product.category_name && (
              <Badge variant="secondary" className="w-fit">
                {product.category_name}
              </Badge>
            )}

            <Separator />

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {product.description || `${product.name} - Producto de excelente calidad para uso agrícola.`}
              </p>
            </div>

            {specifications.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Especificaciones</h3>
                <div className="space-y-2">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm text-gray-600">{spec.label}:</span>
                      <span className="text-sm font-medium text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bgColor} ${stockStatus.color}`}
            >
              <Package className="h-4 w-4" />
              <span>{stockStatus.text}</span>
            </div>

            <Separator />

            <div className="space-y-4">
              {inStock && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Cantidad:</span>
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="h-10 w-10 p-0 hover:bg-gray-100 hover:scale-105 transition-all duration-200"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 min-w-[60px] text-center font-medium transition-all duration-200 hover:scale-105">
                      {quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                      className="h-10 w-10 p-0 hover:bg-gray-100 hover:scale-105 transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleAddToCart}
                disabled={!inStock || isAdding}
                className={`w-full h-12 font-medium transition-all duration-500 ease-in-out transform ${
                  !inStock
                    ? "bg-gray-400 cursor-not-allowed"
                    : showAdded
                      ? "bg-emerald-500 hover:bg-emerald-600 scale-105 shadow-lg"
                      : isAdding
                        ? "bg-blue-500 hover:bg-blue-600 scale-102"
                        : "bg-green-600 hover:bg-green-700 hover:scale-102"
                } text-white`}
              >
                {!inStock ? (
                  <>
                    <Package className="h-5 w-5 mr-2" />
                    Sin Stock
                  </>
                ) : showAdded ? (
                  <>
                    <Check className="h-5 w-5 mr-2 animate-bounce" />
                    ¡Agregado al Carrito!
                  </>
                ) : isAdding ? (
                  <>
                    <div className="h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Agregando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Agregar al carrito
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
