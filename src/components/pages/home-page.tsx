"use client"

import { Button } from "@/components/ui/button"

import { CardContent } from "@/components/ui/card"

import { Card } from "@/components/ui/card"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, AlertCircle, Menu } from "lucide-react" // Added Menu icon
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/contexts/auth-context"
import type { Product } from "@/types/product"
import { HeroBanner } from "@/components/sections/hero-banner"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { ProductCard } from "@/components/ui/product-card"
import ErrorBoundary, { ProductErrorBoundary } from "@/components/error-boundary"
import { useSafeAsync } from "@/lib/hooks/use-async"
import Header from "@/components/layout/header"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // Import Sheet components

// Componente de sidebar (now rendered inside a Sheet on mobile)
const CategorySidebar = ({ categories, loading, error }: any) => {
  const router = useRouter()

  const handleCategoryClick = (categoryName: string) => {
    console.log("🔍 Navegando a categoría:", categoryName)
    router.push(`/buscar?categoria=${encodeURIComponent(categoryName)}`)
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-800 text-center">CATEGORÍAS</h2>
        </div>
        <div className="p-4 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-800 text-center">CATEGORÍAS</h2>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-800 text-center">CATEGORÍAS</h2>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {categories.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No hay categorías disponibles</div>
          ) : (
            categories.map((category: any) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between group transition-colors"
              >
                <span className="text-gray-700 group-hover:text-green-600 transition-colors">{category.name}</span>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* WhatsApp Contact - Moved from SidebarComponent to be part of the sheet content */}
      
    </div>
  )
}

interface HomePageProps {
  initialFeaturedProducts: Product[]
  initialNewProducts: Product[]
  initialCategories: Array<{ id: string; name: string; slug: string }>
  initialError: string | null
}

export function HomePage({
  initialFeaturedProducts,
  initialNewProducts,
  initialCategories,
  initialError,
}: HomePageProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(initialFeaturedProducts)
  const [newProducts, setNewProducts] = useState<Product[]>(initialNewProducts)
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>(initialCategories)
  const [pageError, setPageError] = useState<string | null>(initialError)

  const { loading: reFetching, error: reFetchError, execute: reFetchExecute } = useSafeAsync()
  const { isAuthenticated, user, profile, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (initialError) {
      setPageError(initialError)
    }
  }, [initialError])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <ErrorBoundary context="Categories Sidebar">
              <CategorySidebar
                categories={categories}
                loading={reFetching}
                error={pageError || reFetchError?.message}
              />
            </ErrorBoundary>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Hero Section */}
            <HeroBanner />

            {/* Mobile Categories Button */}
            <div className="lg:hidden mb-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Menu className="h-4 w-4 mr-2" /> Ver Categorías
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-xs p-0">
                  <div className="p-4">
                    <CategorySidebar
                      categories={categories}
                      loading={reFetching}
                      error={pageError || reFetchError?.message}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Global Error State */}
            {(pageError || reFetchError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700">{pageError || reFetchError?.message}</p>
                </div>
              </div>
            )}

            {/* Featured Products Grid */}
            <section className="py-12">
              <div className="container mx-auto px-4">
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Productos Destacados</h2>
                </div>

                <ProductErrorBoundary>
                  {reFetching ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
                      ))}
                    </div>
                  ) : featuredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                      {featuredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1M7 7h10"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos destacados</h3>
                      <p className="text-gray-600">Los productos aparecerán aquí cuando estén disponibles</p>
                    </div>
                  )}
                </ProductErrorBoundary>
              </div>
            </section>

            {/* New Products Grid */}
            <section className="py-12">
              <div className="container mx-auto px-4">
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Novedades</h2>
                </div>

                <ProductErrorBoundary>
                  {reFetching ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
                      ))}
                    </div>
                  ) : newProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {newProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1M7 7h10"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos nuevos</h3>
                      <p className="text-gray-600">Los productos aparecerán aquí cuando estén disponibles</p>
                    </div>
                  )}
                </ProductErrorBoundary>
              </div>
            </section>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {" "}
              {/* Adjusted grid for mobile */}
              <Link href="/buscar?filtro=novedades" className="group">
                <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow">
                  {" "}
                  {/* Adjusted padding */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600">Novedades</h3>
                  <p className="text-gray-600 text-sm">Descubre los productos más recientes</p> {/* Smaller text */}
                </div>
              </Link>
              <Link href="/buscar?filtro=ofertas" className="group">
                <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600">Ofertas</h3>
                  <p className="text-gray-600 text-sm">Los mejores precios del mercado</p>
                </div>
              </Link>
              <Link href="/buscar?filtro=populares" className="group">
                <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600">Más Vendidos</h3>
                  <p className="text-gray-600 text-sm">Los productos favoritos de nuestros clientes</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* WhatsApp Button */}
      <WhatsAppButton />

      <Footer />
    </div>
  )
}
