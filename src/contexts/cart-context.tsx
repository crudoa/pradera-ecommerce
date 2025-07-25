"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { useToast } from "@/lib/hooks/use-toast"
import type { CartItem } from "@/types/cart"

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateItemQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getItemQuantity: (id: string) => number
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()

  // Function to load cart from localStorage
  const loadCartFromLocalStorage = useCallback((): CartItem[] => {
    if (typeof window === "undefined") return []
    try {
      const savedCart = localStorage.getItem("pradera_cart")
      const timestamp = localStorage.getItem("pradera_cart_timestamp")

      if (savedCart && timestamp) {
        const daysSince = (Date.now() - Number.parseInt(timestamp)) / (1000 * 60 * 60 * 24)
        if (daysSince > 7) {
          // Cart is older than 7 days, clear it
          localStorage.removeItem("pradera_cart")
          localStorage.removeItem("pradera_cart_timestamp")
          return []
        }
        return JSON.parse(savedCart) as CartItem[]
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error)
      // Clear corrupted data
      localStorage.removeItem("pradera_cart")
      localStorage.removeItem("pradera_cart_timestamp")
    }
    return []
  }, [])

  const [items, setItems] = useState<CartItem[]>(() => loadCartFromLocalStorage())

  // Effect to save cart to localStorage whenever items change
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (items.length > 0) {
        localStorage.setItem("pradera_cart", JSON.stringify(items))
        localStorage.setItem("pradera_cart_timestamp", Date.now().toString())
      } else {
        // If cart is empty, remove items from localStorage
        localStorage.removeItem("pradera_cart")
        localStorage.removeItem("pradera_cart_timestamp")
      }
    }
  }, [items])

  const addItem = useCallback(
    (item: CartItem) => {
      setItems((prevItems) => {
        const existingItem = prevItems.find((i) => i.id === item.id)
        if (existingItem) {
          const newQuantity = existingItem.quantity + item.quantity
          if (newQuantity > existingItem.stock) {
            toast({
              title: "Stock insuficiente",
              description: `No hay suficiente stock para añadir ${item.name}. Solo quedan ${existingItem.stock} unidades.`,
              variant: "destructive",
            })
            return prevItems
          }
          toast({
            title: "Producto actualizado",
            description: `Cantidad de "${item.name}" actualizada en el carrito.`,
          })
          return prevItems.map((i) =>
            i.id === item.id ? { ...i, quantity: existingItem.quantity + item.quantity } : i,
          )
        } else {
          if (item.quantity > item.stock) {
            toast({
              title: "Stock insuficiente",
              description: `No hay suficiente stock para añadir ${item.name}. Solo quedan ${item.stock} unidades.`,
              variant: "destructive",
            })
            return prevItems
          }
          toast({
            title: "Producto añadido",
            description: `"${item.name}" ha sido añadido al carrito.`,
          })
          return [...prevItems, { ...item, quantity: item.quantity || 1 }]
        }
      })
    },
    [toast],
  )

  const removeItem = useCallback(
    (id: string) => {
      setItems((prevItems) => {
        const itemToRemove = prevItems.find((i) => i.id === id)
        if (itemToRemove) {
          toast({
            title: "Producto eliminado",
            description: `"${itemToRemove.name}" ha sido eliminado del carrito.`,
            variant: "destructive",
          })
        }
        return prevItems.filter((item) => item.id !== id)
      })
    },
    [toast],
  )

  const updateItemQuantity = useCallback(
    (id: string, quantity: number) => {
      setItems((prevItems) => {
        const itemToUpdate = prevItems.find((i) => i.id === id)
        if (!itemToUpdate) return prevItems

        if (quantity <= 0) {
          removeItem(id)
          return prevItems.filter((item) => item.id !== id)
        }

        if (quantity > itemToUpdate.stock) {
          toast({
            title: "Stock insuficiente",
            description: `No puedes añadir más de ${itemToUpdate.stock} unidades de "${itemToUpdate.name}".`,
            variant: "destructive",
          })
          return prevItems
        }

        toast({
          title: "Cantidad actualizada",
          description: `Cantidad de "${itemToUpdate.name}" actualizada a ${quantity}.`,
        })
        return prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      })
    },
    [toast, removeItem],
  )

  const clearCart = useCallback(() => {
    setItems([])
    toast({
      title: "Carrito vaciado",
      description: "Todos los productos han sido eliminados del carrito.",
    })
  }, [toast])

  const getItemQuantity = useCallback(
    (id: string) => {
      return items.find((item) => item.id === id)?.quantity || 0
    },
    [items],
  )

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }, [items])

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [items])

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateItemQuantity,
      clearCart,
      getItemQuantity,
      getTotalItems,
      getTotalPrice,
    }),
    [items, addItem, removeItem, updateItemQuantity, clearCart, getItemQuantity, getTotalItems, getTotalPrice],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
