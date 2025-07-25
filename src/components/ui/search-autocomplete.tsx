"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Clock, TrendingUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

// Productos de ejemplo para autocompletado
const searchableProducts = [
  { id: "1", name: "BEGONIA 500 SEMILLAS TUBERHYBRIDA", category: "Semillas", price: 101.0, popular: true },
  { id: "2", name: "ABONO ORGÁNICO COMPOST NATURAL", category: "Fertilizantes", price: 45.0, popular: false },
  { id: "3", name: "ASPERSORES ROTATIVOS PACK X6", category: "Riego", price: 85.0, popular: false },
  { id: "4", name: "ALICATE PODADOR PROFESIONAL", category: "Herramientas", price: 120.0, popular: true },
  { id: "5", name: "SEMILLAS DE LECHUGA HIDROPONICA", category: "Semillas", price: 65.0, popular: false },
  { id: "6", name: "SISTEMA DE GOTEO AUTOMÁTICO", category: "Riego", price: 250.0, popular: true },
  { id: "7", name: "SUSTRATO UNIVERSAL PREMIUM", category: "Sustratos", price: 35.0, popular: false },
  { id: "8", name: "MANGUERA EXTENSIBLE JARDÍN", category: "Riego", price: 75.0, popular: true },
  { id: "9", name: "SEMILLAS TOMATE CHERRY", category: "Semillas", price: 25.0, popular: true },
  { id: "10", name: "TIJERAS PODAR ACERO INOX", category: "Herramientas", price: 95.0, popular: false },
  { id: "11", name: "FERTILIZANTE LÍQUIDO UNIVERSAL", category: "Fertilizantes", price: 55.0, popular: false },
  { id: "12", name: "MACETAS BIODEGRADABLES PACK", category: "Macetas", price: 40.0, popular: false },
  { id: "13", name: "INSECTICIDA ORGÁNICO NATURAL", category: "Tratamientos", price: 80.0, popular: false },
  { id: "14", name: "REGADERA AUTOMÁTICA SMART", category: "Riego", price: 180.0, popular: true },
  { id: "15", name: "BULBOS TULIPÁN HOLANDÉS", category: "Bulbos", price: 30.0, popular: false },
]

// Búsquedas populares y recientes simuladas
const popularSearches = ["semillas", "riego", "fertilizante", "herramientas", "macetas"]
const recentSearches = ["begonia", "sistema goteo", "abono"]

interface SearchAutocompleteProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
}

export function SearchAutocomplete({
  placeholder = "Búsqueda en catálogo",
  onSearch,
  className = "",
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<typeof searchableProducts>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Debounce para búsqueda en tiempo real
  const debounceTimer = useRef<NodeJS.Timeout>()

  const performSearch = useCallback(
    (searchQuery: string) => {
      if (searchQuery.trim()) {
        setShowSuggestions(false)
        setQuery(searchQuery)

        // Agregar a búsquedas recientes (simulado)
        if (!recentSearches.includes(searchQuery.toLowerCase())) {
          recentSearches.unshift(searchQuery.toLowerCase())
          if (recentSearches.length > 5) recentSearches.pop()
        }

        setTimeout(() => {
          router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`)
        }, 100)

        onSearch?.(searchQuery)
      }
    },
    [router, onSearch],
  )

  // Búsqueda de sugerencias con debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (query.length === 0) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)

    debounceTimer.current = setTimeout(() => {
      const filtered = searchableProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()),
      )

      // Ordenar por relevancia: primero los que empiezan con la búsqueda, luego populares
      const sorted = filtered.sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(query.toLowerCase())
        const bStartsWith = b.name.toLowerCase().startsWith(query.toLowerCase())

        if (aStartsWith && !bStartsWith) return -1
        if (!aStartsWith && bStartsWith) return 1
        if (a.popular && !b.popular) return -1
        if (!a.popular && b.popular) return 1

        return 0
      })

      setSuggestions(sorted.slice(0, 8)) // Máximo 8 sugerencias
      setShowSuggestions(sorted.length > 0)
      setSelectedIndex(-1)
      setIsLoading(false)
    }, 300) // 300ms de debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query])

  // Manejo de teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === "Enter") {
        performSearch(query)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          performSearch(suggestions[selectedIndex].name)
        } else {
          performSearch(query)
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Resaltar texto coincidente
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text

    const regex = new RegExp(`(${query})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-900 font-semibold">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const clearSearch = () => {
    setQuery("")
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  return (
    <div className={`relative ${className}`} ref={suggestionsRef}>
      {/* Input de búsqueda */}
      <div className="relative group">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true)
          }}
          className="w-full pr-20 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg transition-all duration-300 group-hover:shadow-md bg-white text-gray-800 placeholder:text-gray-500"
          autoComplete="off"
        />

        {/* Botón limpiar */}
        {query && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearSearch}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        <Button
          size="sm"
          onClick={() => performSearch(query)}
          className="absolute right-1 top-1 bg-green-600 hover:bg-green-700 text-white px-4 rounded-md transition-all duration-300 transform hover:scale-105"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Indicador de carga */}
        {isLoading && (
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
          </div>
        )}
      </div>

      {/* Panel de sugerencias */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl border border-gray-200 rounded-lg overflow-hidden">
          <CardContent className="p-0">
            {/* Sugerencias de productos */}
            {suggestions.length > 0 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Productos sugeridos
                </div>
                {suggestions.map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => performSearch(product.name)}
                    className={`w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                      selectedIndex === index ? "bg-green-100" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 text-sm">{highlightMatch(product.name, query)}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                          <div className="flex items-center">
                            <span>{product.category}</span>
                            {product.popular && (
                              <>
                                <span className="mx-2">•</span>
                                <TrendingUp className="h-3 w-3 mr-1" />
                                <span>Popular</span>
                              </>
                            )}
                          </div>
                          <span className="text-green-600 font-semibold">S/ {product.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <Search className="h-4 w-4 text-gray-400 ml-2" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Búsquedas recientes y populares cuando no hay query */}
            {query.length === 0 && (
              <div>
                {recentSearches.length > 0 && (
                  <div className="border-b border-gray-100">
                    <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center">
                      <Clock className="h-3 w-3 mr-2" />
                      Búsquedas recientes
                    </div>
                    {recentSearches.slice(0, 3).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => performSearch(search)}
                        className="w-full text-left px-4 py-2 hover:bg-green-50 transition-colors text-sm text-gray-700 border-b border-gray-50 last:border-b-0"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center">
                    <TrendingUp className="h-3 w-3 mr-2" />
                    Búsquedas populares
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((search, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-green-100 transition-colors bg-gray-100 text-gray-700 hover:text-green-700"
                          onClick={() => performSearch(search)}
                        >
                          {search}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje cuando no hay resultados */}
            {query.length > 0 && suggestions.length === 0 && !isLoading && (
              <div className="p-6 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No se encontraron sugerencias</p>
                <p className="text-xs text-gray-400 mt-1">Presiona Enter para buscar &quot;{query}&quot;</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
