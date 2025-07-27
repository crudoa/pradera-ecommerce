"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Grid, List, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ProductCard } from "@/components/ui/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import Header from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import ProductService from "@/lib/services/products"
import type { Product } from "@/types/product"
import type { SearchFilters } from "@/types/filters"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet" // Import Sheet components

// Custom Select component to avoid React 19 ref issues
const CustomSelect = ({
  value,
  onValueChange,
  children,
  placeholder,
}: {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  placeholder?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState(placeholder || "")

  useEffect(() => {
    // Update selected label when value changes
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.props.value === value) {
        setSelectedLabel(child.props.children)
      }
    })
  }, [value, children])

  const handleSelect = (selectValue: string, label: string) => {
    onValueChange(selectValue)
    setSelectedLabel(label)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-1">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.props.value) {
                return (
                  <button
                    key={child.props.value}
                    type="button"
                    onClick={() => handleSelect(child.props.value, child.props.children)}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  >
                    {child.props.children}
                  </button>
                )
              }
              return child
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const CustomSelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => {
  return <div data-value={value}>{children}</div>
}

// Simplified Filters Component (reused from search page)
const CategoryFilters = ({
  filters,
  categories,
  onFilterChange,
  onPriceRangeChange,
  onClearFilters,
  totalResults,
}: {
  filters: SearchFilters
  categories: Array<{ id: string; name: string; slug: string }>
  onFilterChange: (key: keyof SearchFilters, value: any) => void
  onPriceRangeChange: (values: number[]) => void
  onClearFilters: () => void
  totalResults: number
}) => {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800">Filtros</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-primary hover:text-primary/90 p-1 h-auto"
        >
          Limpiar
        </Button>
      </div>
      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Categoría</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="todas-categorias"
              checked={!filters.category}
              onCheckedChange={() => onFilterChange("category", "")}
              className="h-4 w-4"
            />
            <label htmlFor="todas-categorias" className="text-sm text-gray-700 cursor-pointer">
              Todas las categorías
            </label>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.category === category.name}
                onCheckedChange={(checked) => onFilterChange("category", checked ? category.name : "")}
                className="h-4 w-4"
              />
              <label htmlFor={`category-${category.id}`} className="text-sm text-gray-700 cursor-pointer">
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>
      {/* Price Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Precio</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>S/ {filters.minPrice || 0}</span>
            <span>S/ {filters.maxPrice || 1000}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <input
                type="number"
                placeholder="Desde"
                value={filters.minPrice || ""}
                onChange={(e) => onFilterChange("minPrice", Number(e.target.value))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
            <span className="text-xs text-gray-500">-</span>
            <div className="flex-1">
              <input
                type="number"
                placeholder="Hasta"
                value={filters.maxPrice || ""}
                onChange={(e) => onFilterChange("maxPrice", Number(e.target.value))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Stock Filter */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Disponibilidad</h4>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={filters.inStock}
            onCheckedChange={(checked) => onFilterChange("inStock", checked)}
            className="h-4 w-4"
          />
          <label htmlFor="inStock" className="text-sm text-gray-700 cursor-pointer">
            Solo productos en stock
          </label>
        </div>
      </div>
      {/* Results count */}
      <div className="pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          {totalResults} resultado{totalResults !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  )
}

function CategoryPageContent({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFiltersSheet, setShowFiltersSheet] = useState(false) // State for Sheet visibility
  const [totalResults, setTotalResults] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Filter states
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: decodeURIComponent(params.slug), // Set initial category from slug
    minPrice: 0,
    maxPrice: 1000,
    inStock: false,
    sortBy: "name",
    sortOrder: "asc",
    limit: 50,
    offset: 0,
  })

  // Categories for filter
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([])

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadCategories()
    }
  }, [mounted])

  useEffect(() => {
    if (mounted) {
      // Update filters when URL params change (e.g., if user navigates to another category)
      setFilters((prev) => ({
        ...prev,
        category: decodeURIComponent(params.slug),
      }))
    }
  }, [params.slug, mounted])

  useEffect(() => {
    if (mounted) {
      searchProducts()
    }
  }, [filters, mounted])

  const loadCategories = async () => {
    try {
      const categoriesData = await ProductService.getCategories()
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      console.log("📂 Categories loaded:", categoriesData)
    } catch (error) {
      console.error("Error loading categories:", error)
      setCategories([])
    }
  }

  const searchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("🔍 Searching with filters:", filters)

      // Always use searchProducts method
      const result = await ProductService.searchProducts(filters)

      if (result && result.data && Array.isArray(result.data)) {
        setProducts(result.data)
        setTotalResults(result.data.length)
        console.log("✅ Search results:", result.data.length, "products found")
      } else {
        console.warn("⚠️ Invalid search result:", result)
        setProducts([])
        setTotalResults(0)
      }
    } catch (error) {
      console.error("Error searching products:", error)
      setError("Error al cargar los productos")
      setProducts([])
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    console.log("🔧 Filter change:", key, value)
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handlePriceRangeChange = (values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
    }))
  }

  const clearFilters = () => {
    console.log("🧹 Clearing all filters and showing all products")
    // Reset all filters to show all products, but keep the category from the URL slug
    setFilters({
      query: "",
      category: decodeURIComponent(params.slug),
      minPrice: 0,
      maxPrice: 1000,
      inStock: false,
      sortBy: "name" as const,
      sortOrder: "asc" as const,
      limit: 50,
      offset: 0,
    })
    // No need to update URL here as category is part of the path
  }

  // Show loading until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse" />
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="flex">
                  <div className="flex-1 h-10 bg-gray-200 rounded-l-md animate-pulse" />
                  <div className="w-20 h-10 bg-gray-300 rounded-r-md animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <div suppressHydrationWarning>
          <Header />
        </div>
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl p-12 shadow-sm border max-w-md mx-auto">
                <div className="text-red-500 mb-6">
                  <Search className="h-20 w-20 mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Error al cargar</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/90">
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" suppressHydrationWarning>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Category Header */}
          {!loading && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Categoría: {decodeURIComponent(params.slug)}</h1>
              <p className="text-gray-600">
                {totalResults} producto{totalResults !== 1 ? "s" : ""} encontrado{totalResults !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Controls Bar */}
          <div className="mb-8">
            {/* Mobile Filter Toggle - Now uses Sheet */}
            <div className="lg:hidden mb-6 flex justify-center">
              <Sheet open={showFiltersSheet} onOpenChange={setShowFiltersSheet}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 w-full sm:w-auto bg-white border border-gray-300 shadow-sm rounded-lg py-2 px-4 justify-center"
                  >
                    <Filter className="h-4 w-4" />
                    Filtros
                    <ChevronDown
                      className={`h-8 w-8 text-gray-800 transition-transform ${showFiltersSheet ? "rotate-180" : ""}`}
                    />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-xs p-4 overflow-y-auto">
                  <SheetHeader className="mb-4">
                    <SheetTitle className="text-lg font-bold text-gray-800">Filtros de Categoría</SheetTitle>
                  </SheetHeader>
                  <CategoryFilters
                    filters={filters}
                    categories={categories}
                    onFilterChange={handleFilterChange}
                    onPriceRangeChange={handlePriceRangeChange}
                    onClearFilters={() => {
                      clearFilters()
                      setShowFiltersSheet(false) // Close sheet after clearing
                    }}
                    totalResults={totalResults}
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-9"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-9"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <div className="hidden lg:block w-px h-6 bg-gray-300"></div>
                <span className="text-sm text-gray-600 font-medium">
                  {totalResults} resultado{totalResults !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-48">
                {" "}
                {/* Made full width on mobile, fixed width on sm+ */}
                <CustomSelect
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onValueChange={(value) => {
                    const [sortBy, sortOrder] = value.split("-") as [string, "asc" | "desc"]
                    handleFilterChange("sortBy", sortBy)
                    handleFilterChange("sortOrder", sortOrder)
                  }}
                  placeholder="Ordenar por"
                >
                  <CustomSelectItem value="name-asc">Nombre A-Z</CustomSelectItem>
                  <CustomSelectItem value="name-desc">Nombre Z-A</CustomSelectItem>
                  <CustomSelectItem value="price-asc">Precio: Menor a Mayor</CustomSelectItem>
                  <CustomSelectItem value="price-desc">Precio: Mayor a Menor</CustomSelectItem>
                  <CustomSelectItem value="created_at-desc">Más Recientes</CustomSelectItem>
                </CustomSelect>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Category Filters Sidebar - Hidden on mobile, shown on desktop */}
            <div className="w-full lg:w-80 flex-shrink-0 mb-8 lg:mb-0 hidden lg:block">
              <div className="sticky top-24">
                <CategoryFilters
                  filters={filters}
                  categories={categories}
                  onFilterChange={handleFilterChange}
                  onPriceRangeChange={handlePriceRangeChange}
                  onClearFilters={clearFilters}
                  totalResults={totalResults}
                />
              </div>
            </div>
            {/* Products Grid */}
            <div className="flex-1">
              {loading ? (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4" : "grid-cols-1"
                  }`}
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                      <Skeleton className="aspect-square w-full mb-4 rounded-lg" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-6 w-1/3" />
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4" : "grid-cols-1"
                  }`}
                >
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-white rounded-2xl p-12 shadow-sm border max-w-md mx-auto">
                    <div className="text-gray-400 mb-6">
                      <Search className="h-20 w-20 mx-auto" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">No se encontraron productos</h3>
                    <p className="text-gray-600 mb-6">
                      {filters.query
                        ? `No se encontraron productos para "${filters.query}"`
                        : filters.category
                          ? `No hay productos disponibles en la categoría "${filters.category}"`
                          : "Intenta ajustar tus filtros o términos de búsqueda"}
                    </p>
                    <Button onClick={clearFilters} className="bg-primary hover:bg-primary/90">
                      <X className="h-4 w-4 mr-2" />
                      Limpiar filtros
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando categoría...</p>
          </div>
        </div>
      }
    >
      <CategoryPageContent params={params} />
    </Suspense>
  )
}
