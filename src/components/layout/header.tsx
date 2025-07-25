"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { ShoppingCart, Heart, User, Phone, Mail } from "lucide-react" // Keep Menu and X for the general mobile menu
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useAuth } from "@/contexts/auth-context"
import SearchBar from "@/components/ui/search-bar"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { items } = useCart()
  const { favorites } = useFavorites()
  const { user, signOut, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const [clientCartItemsCount, setClientCartItemsCount] = useState(0)
  const [clientCartTotal, setClientCartTotal] = useState(0)
  const [clientFavoritesCount, setClientFavoritesCount] = useState(0)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setClientCartItemsCount(items.reduce((total, item) => total + item.quantity, 0))
      setClientCartTotal(items.reduce((total, item) => total + item.price * item.quantity, 0))
      setClientFavoritesCount(favorites.length)
    }
  }, [items, favorites, mounted])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      {/* Top Contact Bar */}
      <div className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between py-2 text-sm">
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-6 mb-2 sm:mb-0">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+51 930 104 083</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>pradera.sg@gmail.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 text-center sm:text-left">
              {isAuthenticated ? (
                <div className="flex flex-wrap justify-center sm:justify-start items-center space-x-2 sm:space-x-4">
                  <span className="text-muted-foreground whitespace-nowrap">Bienvenido, {user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="text-primary hover:text-primary/90 font-medium whitespace-nowrap"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center sm:justify-start items-center space-x-2 sm:space-x-4">
                  <span className="text-muted-foreground whitespace-nowrap">Bienvenido,</span>
                  <Link href="/login" className="text-primary hover:text-primary/90 font-medium whitespace-nowrap">
                    Iniciar sesión
                  </Link>
                  <span className="text-muted-foreground hidden sm:inline">o</span>
                  <Link href="/register" className="text-primary hover:text-primary/90 font-medium whitespace-nowrap">
                    Crear cuenta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Desktop (lg and up) */}
      <div className="container mx-auto px-4 hidden lg:block">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/images/pradera-logo.png"
              alt="Pradera Servicios Generales E.I.R.L. Logo"
              width={200} // Original desktop width
              height={60} // Original desktop height
              priority
            />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="flex-1 max-w-md mx-8">
            <SearchBar placeholder="Buscar productos..." />
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center space-x-4">
            {/* Favorites */}
            <Link href="/favoritos">
              <Button variant="ghost" size="sm" className="relative flex-shrink-0">
                <Heart className="h-5 w-5" />
                <span className="ml-2">Favoritos</span>
                {mounted && clientFavoritesCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-destructive text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                    {clientFavoritesCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/carrito">
              <Button variant="ghost" size="sm" className="relative flex-shrink-0">
                <ShoppingCart className="h-5 w-5" />
                <span className="ml-2 whitespace-nowrap">
                  <span className="inline-block min-w-[3rem] text-left">
                    Carrito: {mounted ? clientCartItemsCount : 0}
                  </span>{" "}
                  <span className="inline-block min-w-[4rem] text-left">
                    - S/ {mounted ? clientCartTotal.toFixed(2) : "0.00"}
                  </span>{" "}
                </span>
                {mounted && clientCartItemsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-primary text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                    {clientCartItemsCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Account - Only show if authenticated */}
            {isAuthenticated && (
              <Link href="/mi-cuenta">
                <Button variant="ghost" size="sm" className="flex-shrink-0">
                  <User className="h-5 w-5" />
                  <span className="ml-2">Mi Cuenta</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header - Mobile (below lg) */}
      <div className="container mx-auto px-4 lg:hidden">
        <div className="flex items-center justify-between py-4 gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/images/pradera-logo.png"
              alt="Pradera Servicios Generales E.I.R.L. Logo"
              width={120} // Smaller width for mobile
              height={36} // Smaller height for mobile
              priority
            />
          </Link>

          {/* Mobile Search Bar & Icons */}
          <div className="flex flex-1 items-center justify-end space-x-2">
            <div className="flex-1 max-w-[180px] sm:max-w-[250px]">
              <SearchBar placeholder="Buscar..." />
            </div>
            <Link href="/favoritos">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Favoritos</span>
                {mounted && clientFavoritesCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-destructive text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                    {clientFavoritesCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/carrito">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Carrito</span>
                {mounted && clientCartItemsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-primary text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                    {clientCartItemsCount}
                  </Badge>
                )}
              </Button>
            </Link>
            {isAuthenticated && (
              <Link href="/mi-cuenta">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Mi Cuenta</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Gradient Bar */}
      <div className="h-1 bg-gradient-to-r from-primary to-accent"></div>
    </header>
  )
}
