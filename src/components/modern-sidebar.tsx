"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Search,
  ShoppingCart,
  Heart,
  User,
  Package,
  Leaf,
  Wrench,
  Bug,
  Beaker,
  ChevronDown,
  ChevronRight,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useAuth } from "@/contexts/auth-context"

const mainNavItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/carrito", label: "Carrito", icon: ShoppingCart },
  { href: "/favoritos", label: "Favoritos", icon: Heart },
]

const categoryItems = [
  { href: "/categoria/semillas", label: "Semillas", icon: Leaf },
  { href: "/categoria/fertilizantes", label: "Fertilizantes", icon: Beaker },
  { href: "/categoria/herramientas", label: "Herramientas", icon: Wrench },
  { href: "/categoria/pesticidas", label: "Pesticidas", icon: Bug },
]

export function ModernSidebar() {
  const pathname = usePathname()
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const { items } = useCart()
  const { favorites } = useFavorites()
  const { user } = useAuth()

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r shadow-sm overflow-y-auto">
      {/* Header del sidebar - más compacto */}
      <div className="p-3 sm:p-4 border-b">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Menú</h2>
      </div>

      {/* Navigation - más compacto en móvil */}
      <nav className="p-2 sm:p-3 space-y-1 sm:space-y-2">
        {/* Main navigation */}
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const count = item.href === "/carrito" ? totalItems : item.href === "/favoritos" ? favorites.length : 0

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-2 sm:gap-3 h-9 sm:h-10 text-sm ${
                  isActive ? "bg-primary text-white" : "hover:bg-gray-100"
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="truncate">{item.label}</span>
                {count > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-auto h-4 w-4 sm:h-5 sm:w-5 text-xs p-0 flex items-center justify-center"
                  >
                    {count}
                  </Badge>
                )}
              </Button>
            </Link>
          )
        })}

        {/* Categories - oculto en móvil muy pequeño */}
        <div className="hidden xs:block">
          <Collapsible open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 sm:gap-3 h-9 sm:h-10 text-sm hover:bg-gray-100"
              >
                <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="truncate">Categorías</span>
                {isCategoriesOpen ? (
                  <ChevronDown className="ml-auto h-4 w-4 sm:h-5 sm:w-5 text-gray-800" />
                ) : (
                  <ChevronRight className="ml-auto h-4 w-4 sm:h-5 sm:w-5 text-gray-800" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {categoryItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start gap-2 sm:gap-3 h-8 sm:h-9 text-xs sm:text-sm ml-4 ${
                        isActive ? "bg-primary text-white" : "hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span className="truncate">{item.label}</span>
                    </Button>
                  </Link>
                )
              })}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* User section - más compacto */}
        <div className="pt-2 sm:pt-4 border-t">
          {user ? (
            <Link href="/mi-cuenta">
              <Button
                variant={pathname === "/mi-cuenta" ? "default" : "ghost"}
                className="w-full justify-start gap-2 sm:gap-3 h-9 sm:h-10 text-sm"
              >
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="truncate">Mi Cuenta</span>
              </Button>
            </Link>
          ) : (
            <div className="space-y-1">
              <Link href="/login">
                <Button variant="outline" className="w-full h-8 sm:h-9 text-xs sm:text-sm bg-transparent">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="default" className="w-full h-8 sm:h-9 text-xs sm:text-sm">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* WhatsApp button - más pequeño en móvil */}
      <div className="absolute bottom-4 left-2 right-2 sm:left-4 sm:right-4">
        <Button asChild className="w-full bg-green-500 hover:bg-green-600 text-white h-9 sm:h-10 text-xs sm:text-sm">
          <a
            href="https://wa.me/51930104083"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>WhatsApp</span>
          </a>
        </Button>
      </div>
    </aside>
  )
}

export default ModernSidebar
