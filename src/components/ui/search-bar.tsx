"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ProductService from "@/lib/services/products"
import type { Product } from "@/types/product"

interface SearchBarProps {
  className?: string
  placeholder?: string
}

export default function SearchBar({ className = "", placeholder = "Buscar productos..." }: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 1) {
        searchSuggestions()
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const searchSuggestions = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      console.log("🔍 Searching suggestions for:", query.trim())

      const result = await ProductService.searchProducts({
        query: query.trim(),
        limit: 8,
        offset: 0,
        category: "",
        minPrice: 0,
        maxPrice: 1000,
        inStock: false,
        sortBy: "name",
        sortOrder: "asc",
      })

      console.log("✅ Raw search results:", result.data)

      // Filter results to prioritize products that start with the query
      const filteredResults = result.data
        .filter(
          (product: Product) =>
            product.name.toLowerCase().startsWith(query.toLowerCase()) ||
            product.name.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a: Product, b: Product) => {
          // Prioritize products that start with the query
          const aStarts = a.name.toLowerCase().startsWith(query.toLowerCase())
          const bStarts = b.name.toLowerCase().startsWith(query.toLowerCase())

          if (aStarts && !bStarts) return -1
          if (!aStarts && bStarts) return 1
          return a.name.localeCompare(b.name)
        })

      console.log("✅ Filtered suggestions:", filteredResults)

      setSuggestions(filteredResults.slice(0, 5))
      setShowSuggestions(filteredResults.length > 0)
    } catch (error) {
      console.error("❌ Error searching suggestions:", error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchQuery?: string) => {
    const searchTerm = searchQuery || query
    if (!searchTerm.trim()) {
      // If empty search, go to search page to show all products
      router.push("/buscar")
      return
    }

    setShowSuggestions(false)

    // Navigate to search page with query
    router.push(`/buscar?q=${encodeURIComponent(searchTerm.trim())}`)
  }

  const handleSuggestionClick = (product: Product) => {
    setQuery(product.name)
    setShowSuggestions(false)
    handleSearch(product.name)
  }

  const clearSearch = () => {
    setQuery("")
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch()
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch()
        }}
        className="relative"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
            className="pl-10 pr-20 h-12 w-full border-2 border-border focus:border-primary focus:ring-primary rounded-full text-base"
          />
          {query &&
            (loading ? (
              <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-muted-foreground"></div>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-16 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-secondary rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            ))}
          <Button
            type="submit"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-primary hover:bg-primary/90 rounded-full"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Advanced Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-border rounded-xl shadow-xl max-h-96 overflow-y-auto">
          <div className="py-2">
            {suggestions.map((product) => (
              <button
                key={product.id}
                onClick={() => handleSuggestionClick(product)}
                className="w-full px-4 py-3 text-left hover:bg-secondary flex items-center space-x-4 border-b border-border last:border-b-0 transition-colors"
              >
                {/* Product Image */}
                <div className="flex-shrink-0 w-12 h-12 bg-secondary rounded-lg overflow-hidden">
                  <img
                    src={product.image_url || "/placeholder.svg?height=48&width=48"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=48&width=48"
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{product.category_name}</p>
                </div>

                {/* Price */}
                <div className="flex-shrink-0">
                  <span className="text-sm font-bold text-primary">S/ {product.price}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Show all results link */}
          <div className="border-t border-border p-3 bg-secondary">
            <button
              onClick={() => handleSearch()}
              className="w-full px-4 py-2 text-sm text-primary hover:text-primary/90 hover:bg-primary/10 rounded-lg text-center font-medium transition-colors"
            >
              Ver todos los resultados para "{query}"
            </button>
          </div>
        </div>
      )}

      {/* No results message */}
      {showSuggestions && suggestions.length === 0 && !loading && query.length >= 1 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-border rounded-xl shadow-xl">
          <div className="p-6 text-center text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm mb-2">No se encontraron productos para "{query}"</p>
            <button onClick={() => handleSearch()} className="text-sm text-primary hover:text-primary/90 font-medium">
              Buscar de todas formas
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Export as named export for compatibility
export { SearchBar }
