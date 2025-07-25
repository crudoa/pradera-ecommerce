export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface SearchFilters {
  query?: string
  category?: string
  categories?: string[]
  minPrice?: number
  maxPrice?: number
  brands?: string[]
  inStock?: boolean
  sortBy?: "name" | "price" | "newest" | "rating"
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
  offset?: number
}

export interface ProductsOptions {
  limit?: number
  offset?: number
  includeInactive?: boolean
}

export interface CategoryFilter {
  id: string
  name: string
  slug: string
  count?: number
}

export interface BrandFilter {
  id: string
  name: string
  count?: number
}

export interface PriceRange {
  min: number
  max: number
}

export interface PriceFilter {
  min: number
  max: number
}

export interface FilterState {
  categories: CategoryFilter[]
  priceRange: PriceRange
  brands: string[]
  inStock: boolean
  onSale: boolean
}

export interface FilterOptions {
  categories: string[]
  priceRange: {
    min: number
    max: number
  }
  brands: string[]
  inStock: boolean
  sortBy: "name" | "price" | "newest" | "rating"
  sortOrder: "asc" | "desc"
}

export interface SortOption {
  value: string
  label: string
}

export const SORT_OPTIONS: SortOption[] = [
  { value: "newest", label: "Más recientes" },
  { value: "name", label: "Nombre A-Z" },
  { value: "price-low", label: "Precio: menor a mayor" },
  { value: "price-high", label: "Precio: mayor a menor" },
]
