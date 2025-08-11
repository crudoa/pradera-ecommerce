"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "@/types/product"

export interface FavoritesContextType {
  favorites: Product[]
  toggleFavorite: (product: Product) => void
  isFavorite: (productId: string) => boolean
  clearFavorites: () => void
  removeFavorite: (productId: string) => void
  addFavorite: (product: Product) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([])

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites")
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (error) {
        console.error("Error loading favorites:", error)
      }
    }
  }, [])

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (product: Product) => {
    setFavorites((prev) => {
      const exists = prev.find((fav) => fav.id === product.id)
      if (exists) {
        return prev.filter((fav) => fav.id !== product.id)
      } else {
        return [...prev, product]
      }
    })
  }

  const removeFavorite = (productId: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== productId))
  }

  const isFavorite = (productId: string) => {
    return favorites.some((fav) => fav.id === productId)
  }

  const clearFavorites = () => {
    setFavorites([])
  }

  const value: FavoritesContextType = {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    removeFavorite,
    addFavorite: function (product: Product): void {
      throw new Error("Function not implemented.")
    }
  }

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
