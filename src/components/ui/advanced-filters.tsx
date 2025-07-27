"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { ChevronDown, Filter, X } from "lucide-react"

interface FilterOptions {
  categories: Array<{ id: string; name: string }>
  brands: Array<{ id: string; name: string }>
  priceRange: { min: number; max: number }
}

interface AdvancedFiltersProps {
  options: FilterOptions
  onFiltersChange: (filters: any) => void
  className?: string
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ options, onFiltersChange, className = "" }) => {
  const [filters, setFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    priceRange: [options.priceRange.min, options.priceRange.max],
    sortBy: "relevance",
    inStock: false,
  })

  const [isOpen, setIsOpen] = useState(false)

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      categories: [],
      brands: [],
      priceRange: [options.priceRange.min, options.priceRange.max],
      sortBy: "relevance",
      inStock: false,
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const activeFiltersCount =
    filters.categories.length +
    filters.brands.length +
    (filters.inStock ? 1 : 0) +
    (filters.sortBy !== "relevance" ? 1 : 0)

  return (
    <Card className={className}>
      <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
        {" "}
        {/* Adjusted padding */}
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {" "}
            {/* Adjusted text size */}
            <Filter className="h-5 w-5" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">{activeFiltersCount}</span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">
                {" "}
                {/* Adjusted text size */}
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="lg:hidden">
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="lg:block">
          <CardContent className="space-y-4 p-4 pt-0 sm:space-y-6 sm:p-6 sm:pt-0">
            {" "}
            {/* Adjusted padding and spacing */}
            {/* Ordenar por */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Ordenar por</Label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
                <SelectTrigger className="h-9 text-sm">
                  {" "}
                  {/* Adjusted height and text size */}
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevancia</SelectItem>
                  <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                  <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
                  <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
                  <SelectItem value="newest">Más Recientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Rango de precios */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Rango de Precios: S/ {filters.priceRange[0]} - S/ {filters.priceRange[1]}
              </Label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilters({ priceRange: value })}
                min={options.priceRange.min}
                max={options.priceRange.max}
                step={10}
                className="mt-2"
              />
            </div>
            {/* Categorías */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Categorías</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {options.categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={(checked) => {
                        const newCategories = checked
                          ? [...filters.categories, category.id]
                          : filters.categories.filter((id) => id !== category.id)
                        updateFilters({ categories: newCategories })
                      }}
                    />
                    <Label htmlFor={`category-${category.id}`} className="text-sm cursor-pointer">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            {/* Marcas */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Marcas</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {options.brands.map((brand) => (
                  <div key={brand.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={filters.brands.includes(brand.id)}
                      onCheckedChange={(checked) => {
                        const newBrands = checked
                          ? [...filters.brands, brand.id]
                          : filters.brands.filter((id) => id !== brand.id)
                        updateFilters({ brands: newBrands })
                      }}
                    />
                    <Label htmlFor={`brand-${brand.id}`} className="text-sm cursor-pointer">
                      {brand.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            {/* Disponibilidad */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={filters.inStock}
                onCheckedChange={(checked) => updateFilters({ inStock: !!checked })}
              />
              <Label htmlFor="in-stock" className="text-sm cursor-pointer">
                Solo productos en stock
              </Label>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
