"use client"

import { useEffect } from "react"
import { useCart } from "@/contexts/cart-context"

export function useCartPersistence() {
  const { items, clearCart } = useCart()

  useEffect(() => {
    // Guardar carrito en localStorage
    if (items.length > 0) {
      localStorage.setItem("agroperu_cart", JSON.stringify(items))
      localStorage.setItem("agroperu_cart_timestamp", Date.now().toString())
    }
  }, [items])

  useEffect(() => {
    // Limpiar carrito después de 7 días
    const timestamp = localStorage.getItem("agroperu_cart_timestamp")
    if (timestamp) {
      const daysSince = (Date.now() - Number.parseInt(timestamp)) / (1000 * 60 * 60 * 24)
      if (daysSince > 7) {
        clearCart()
        localStorage.removeItem("agroperu_cart")
        localStorage.removeItem("agroperu_cart_timestamp")
      }
    }
  }, [clearCart])

  // Función para recuperar carrito abandonado
  const recoverAbandonedCart = () => {
    const savedCart = localStorage.getItem("agroperu_cart")
    if (savedCart) {
      try {
        return JSON.parse(savedCart)
      } catch (error) {
        console.error("Error recuperando carrito:", error)
        return []
      }
    }
    return []
  }

  return { recoverAbandonedCart }
}

// This file is no longer needed as its logic has been moved into src/contexts/cart-context.tsx
// You can safely delete this file.
