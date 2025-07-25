"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image" // Import Image component
import { useRouter, usePathname } from "next/navigation"
import { ShoppingCart, Heart, User, Phone, Mail, Menu, X } from "lucide-react"
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

  // State to hold client-side calculated counts to prevent hydration mismatch
  const [clientCartItemsCount, setClientCartItemsCount] = useState(0)
  const [clientCartTotal, setClientCartTotal] = useState(0)
  const [clientFavoritesCount, setClientFavoritesCount] = useState(0)

  // Use a mounted state to ensure client-side specific logic runs only after hydration
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
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+51 930 104 083</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>pradera.sg@gmail.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-muted-foreground">Bienvenido, {user?.email}</span>
                  <button onClick={handleLogout} className="text-primary hover:text-primary/90 font-medium">
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <span className="text-muted-foreground">Bienvenido,</span>
                  <Link href="/login" className="text-primary hover:text-primary/90 font-medium">
                    Iniciar sesión
                  </Link>
                  <span className="text-muted-foreground">o</span>
                  <Link href="/register" className="text-primary hover:text-primary/90 font-medium">
                    Crear cuenta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/images/pradera-logo.png"
              alt="Pradera Servicios Generales E.I.R.L. Logo"
              width={200}
              height={60}
              priority // Preload the logo as it's above the fold [^1]
            />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar placeholder="Buscar productos..." />
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Favorites */}
              <Link href="/favoritos">
                <Button variant="ghost" size="sm" className="relative flex-shrink-0">
                  <Heart className="h-5 w-5" />
                  <span className="ml-2 hidden sm:inline">Favoritos</span>
                  {mounted &&
                    clientFavoritesCount > 0 && ( // Only show badge if mounted and count > 0
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
                  <span className="ml-2 hidden sm:inline whitespace-nowrap">
                    <span className="inline-block min-w-[3rem] text-left">
                      Carrito: {mounted ? clientCartItemsCount : 0}
                    </span>{" "}
                    {/* Render 0 on server, then update on client */}
                    <span className="inline-block min-w-[4rem] text-left">
                      - S/ {mounted ? clientCartTotal.toFixed(2) : "0.00"}
                    </span>{" "}
                    {/* Render 0.00 on server, then update on client */}
                  </span>
                  {mounted &&
                    clientCartItemsCount > 0 && ( // Only show badge if mounted and count > 0
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
                    <span className="ml-2 hidden sm:inline">Mi Cuenta</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border py-4">
            {/* Mobile Search Bar */}
            <div className="md:hidden pb-4">
              <SearchBar placeholder="Buscar productos..." />
            </div>
            <div className="flex flex-col space-y-4">
              <Link href="/favoritos" className="flex items-center space-x-2 text-muted-foreground hover:text-primary">
                <Heart className="h-5 w-5" />
                <span>Favoritos ({mounted ? clientFavoritesCount : 0})</span>
              </Link>
              <Link href="/carrito" className="flex items-center space-x-2 text-muted-foreground hover:text-primary">
                <ShoppingCart className="h-5 w-5" />
                <span>
                  Carrito ({mounted ? clientCartItemsCount : 0}) - S/ {mounted ? clientCartTotal.toFixed(2) : "0.00"}
                </span>
              </Link>
              {isAuthenticated && (
                <Link
                  href="/mi-cuenta"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
                >
                  <User className="h-5 w-5" />
                  <span>Mi Cuenta</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Gradient Bar */}
      <div className="h-1 bg-gradient-to-r from-primary to-accent"></div>
    </header>
  )
}
