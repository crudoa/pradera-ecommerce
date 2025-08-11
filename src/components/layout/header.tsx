"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { ShoppingCart, Heart, User, Phone, Mail, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useAuth } from "@/contexts/auth-context"
import { SearchBar } from "@/components/ui/search-bar" // Changed to named import

interface HeaderProps {
  hideSearchBar?: boolean
  hideFavorites?: boolean
  hideCart?: boolean
  hideUserAccount?: boolean
}

export default function Header({
  hideSearchBar = false,
  hideFavorites = false,
  hideCart = false,
  hideUserAccount = false,
}: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { items } = useCart()
  const { favorites } = useFavorites()
  const { user, signOut, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [showCategoriesSheet, setShowCategoriesSheet] = useState(false)

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
      {/* Top Contact Bar - Desktop (sm and up) */}
      <div className="bg-secondary border-b border-border hidden sm:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>+51 930 104 083</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>pradera.sg@gmail.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-muted-foreground">Bienvenido, {user?.email}</span>
                  <button onClick={handleLogout} className="text-primary hover:text-primary/90 font-medium text-sm">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">Bienvenido,</span>
                  <Link href="/login" className="text-primary hover:text-primary/90 font-medium text-sm">
                    Iniciar sesión
                  </Link>
                  <span className="text-muted-foreground">o</span>
                  <Link href="/register" className="text-primary hover:text-primary/90 font-medium text-sm">
                    Crear cuenta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Contact Bar - Mobile (below sm) - More compact auth section */}
      <div className="bg-secondary border-b border-border sm:hidden">
        <div className="container mx-auto px-4 py-2">
          {/* Contact info in single line */}
          <div className="flex items-center justify-center space-x-4 text-muted-foreground text-xs mb-2">
            <div className="flex items-center space-x-1">
              <Phone className="h-3 w-3" />
              <span>+51 930 104 083</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="h-3 w-3" />
              <span>pradera.sg@gmail.com</span>
            </div>
          </div>

          {/* Auth buttons - more compact */}
          <div className="flex justify-center gap-2 px-4">
            {isAuthenticated ? (
              <>
                <span className="text-muted-foreground text-xs text-center flex-1">Bienvenido, {user?.email}</span>
                <Button onClick={handleLogout} variant="outline" className="text-xs py-1 h-auto bg-transparent px-2">
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <div className="flex gap-2 w-full justify-center">
                <Link href="/login" className="flex-1">
                  <Button variant="default" className="w-full text-xs py-1 h-auto">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button variant="outline" className="w-full text-xs py-1 h-auto bg-transparent">
                    Registrarme
                  </Button>
                </Link>
              </div>
            )}
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
              width={200}
              height={60}
              priority
            />
          </Link>

          {/* Search Bar - Desktop */}
          {!hideSearchBar && (
            <div className="flex-1 max-w-md mx-8">
              <SearchBar placeholder="Buscar productos..." />
            </div>
          )}

          {/* Desktop Actions */}
          <div className="flex items-center space-x-4">
            {/* Favorites */}
            {!hideFavorites && (
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
            )}

            {/* Cart */}
            {!hideCart && (
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
            )}

            {/* User Account - Only show if authenticated and not hidden */}
            {isAuthenticated && !hideUserAccount && (
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
        <div
          className={`flex items-center justify-between py-4 gap-2 transition-all duration-300 ${isSearchExpanded ? "py-2" : "py-4"}`}
        >
          {/* Logo (hidden when search is expanded) */}
          <Link
            href="/"
            className={`flex items-center flex-shrink-0 transition-all duration-300 ${
              isSearchExpanded ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
            }`}
          >
            <Image
              src="/images/pradera-logo.png"
              alt="Pradera Servicios Generales E.I.R.L. Logo"
              width={120}
              height={36}
              priority
            />
          </Link>

          {/* Mobile Search Bar & Icons */}
          <div className="flex flex-1 items-center justify-end space-x-2">
            {isSearchExpanded && !hideSearchBar ? (
              <div className="flex items-center w-full transition-all duration-300">
                <SearchBar placeholder="Buscar productos..." className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => setIsSearchExpanded(false)} className="ml-2">
                  <X className="h-5 w-5" />
                  <span className="sr-only">Cerrar búsqueda</span>
                </Button>
              </div>
            ) : (
              <>
                {!hideSearchBar && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchExpanded(true)}
                    className="bg-primary/10 hover:bg-primary/20"
                  >
                    <Search className="h-5 w-5 text-primary" />
                    <span className="sr-only">Abrir búsqueda</span>
                  </Button>
                )}
                {!hideFavorites && (
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
                )}
                {!hideCart && (
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
                )}
                {isAuthenticated && !hideUserAccount && (
                  <Link href="/mi-cuenta">
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                      <span className="sr-only">Mi Cuenta</span>
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Expanded search overlay for mobile */}
        {isSearchExpanded && !hideSearchBar && (
          <div className="pb-4">
            <div className="text-center text-sm text-muted-foreground mb-2">Busca entre miles de productos</div>
          </div>
        )}
      </div>

      {/* Bottom Gradient Bar */}
      <div className="h-1 bg-gradient-to-r from-primary to-accent"></div>
    </header>
  )
}
