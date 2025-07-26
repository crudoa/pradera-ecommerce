"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Filter, Grid, List, ChevronDown, X } from "lucide-react" // Added X for close button
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { ProductCard } from "@/components/ui/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet" // Import Sheet components
import ProductService from "@/lib/services/products"
import type { Product } from "@/types/product"

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params.slug as string

  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isSheetOpen, setIsSheetOpen] = useState(false) // State for Sheet

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [availableBrands, setAvailableBrands] = useState<string[]>([])

  // Category info
  const [categoryName, setCategoryName] = useState("")

  useEffect(() => {
    loadCategoryProducts()
  }, [categorySlug])

  useEffect(() => {
    applyFilters()
  }, [products, priceRange, inStockOnly, sortBy, sortOrder])

  const loadCategoryProducts = async () => {
    setLoading(true)
    try {
      // Convert slug to category name (capitalize first letter)
      const categoryNameFromSlug = categorySlug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

      setCategoryName(categoryNameFromSlug)

      const categoryProducts = await ProductService.getProductsByCategory(categoryNameFromSlug)
      setProducts(categoryProducts)
      setFilteredProducts(categoryProducts)

      // Set price range based on products
      if (categoryProducts.length > 0) {
        const prices = categoryProducts.map((p: Product) => p.price)
        const minPrice = Math.floor(Math.min(...prices))
        const maxPrice = Math.ceil(Math.max(...prices))
        setPriceRange([minPrice, maxPrice])

        // Extract unique brands and filter out null/undefined values
        const brands = [
          ...new Set(categoryProducts.map((p) => p.brand).filter((brand): brand is string => Boolean(brand))),
        ]
        setAvailableBrands(brands)
      }
    } catch (error) {
      console.error("Error loading category products:", error)
      setProducts([])
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...products]

    // Price filter
    filtered = filtered.filter((product) => {
      const price = product.price
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Stock filter
    if (inStockOnly) {
      filtered = filtered.filter((product) => product.stock > 0)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Product]
      let bValue: any = b[sortBy as keyof Product]

      if (sortBy === "price") {
        aValue = a.price
        bValue = b.price
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredProducts(filtered)
  }

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values)
  }

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-") as [string, "asc" | "desc"]
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  const clearFilters = () => {
    if (products.length > 0) {
      const prices = products.map((p) => p.price)
      const minPrice = Math.floor(Math.min(...prices))
      const maxPrice = Math.ceil(Math.max(...prices))
      setPriceRange([minPrice, maxPrice])
    }
    setInStockOnly(false)
    setSortBy("name")
    setSortOrder("asc")
  }

  const handleInStockChange = (checked: boolean | "indeterminate") => {
    setInStockOnly(checked === true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{categoryName}</h1>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Filter Button (Sheet Trigger) */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Filter className="h-4 w-4" />
                    Filtros
                    <ChevronDown className={`h-4 w-4 transition-transform ${isSheetOpen ? "rotate-180" : ""}`} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-xs bg-white p-4 overflow-y-auto">
                  <SheetHeader className="flex flex-row items-center justify-between mb-6">
                    <SheetTitle className="text-lg font-semibold">Filtros</SheetTitle>
                    <Button variant="ghost" size="sm" onClick={() => setIsSheetOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetHeader>
                  <div className="space-y-6">
                    {/* Price Range */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">
                        Rango de Precio: S/ {priceRange[0]} - S/ {priceRange[1]}
                      </label>
                      <Slider
                        value={priceRange}
                        onValueChange={handlePriceRangeChange}
                        max={1000}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                    </div>

                    {/* Stock Filter */}
                    <div className="flex items-center space-x-2">
                      <Checkbox id="inStock" checked={inStockOnly} onCheckedChange={handleInStockChange} />
                      <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                        Solo productos en stock
                      </label>
                    </div>
                    <Button onClick={clearFilters} className="w-full mt-4">
                      Limpiar Filtros
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} encontrado
                {filteredProducts.length !== 1 ? "s" : ""}
              </span>

              <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-48">
                  {" "}
                  {/* Made full width on mobile */}
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Nombre A-Z</SelectItem>
                  <SelectItem value="name-desc">Nombre Z-A</SelectItem>
                  <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                  <SelectItem value="created_at-desc">Más Recientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div
                className={`grid gap-4 sm:gap-6 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4" : "grid-cols-1"}`}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-4">
                    <Skeleton className="aspect-square w-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div
                className={`grid gap-4 sm:gap-6 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4" : "grid-cols-1"}`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron productos</h3>
                <p className="text-gray-600 mb-4">Intenta ajustar tus filtros</p>
                <Button onClick={clearFilters}>Limpiar filtros</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
