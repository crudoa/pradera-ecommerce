"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus, ChevronRight } from "lucide-react"
import { useIsMobile } from "@/lib/hooks/use-mobile"
import type { Category } from "@/types/category" // Import Category type

// Define the structure for hardcoded subcategories
interface HardcodedCategoryMap {
  [key: string]: string[]
}

// Hardcoded subcategories map for existing categories
const hardcodedSubcategoriesMap: HardcodedCategoryMap = {
  Riego: ["Aspersores", "Mangueras", "Goteo", "Microaspersión", "Válvulas", "Conectores"],
  Jardinería: ["Tijeras", "Podadoras", "Rastrillos", "Palas", "Azadas", "Regaderas"],
  Semillas: ["Hortalizas", "Maíz", "Frutales", "Forrajes", "Arvejas", "Flores"],
  Plaguicidas: ["Insecticidas", "Fungicidas", "Herbicidas", "Acaricidas", "Nematicidas"],
  Bioinsumos: ["Orgánicos", "Bioestimulantes", "Microorganismos", "Extractos naturales"],
  Fertilizantes: ["NPK", "Foliares", "Orgánicos", "Especiales", "Líquidos", "Granulados"],
  Bioestimulantes: ["Enraizantes", "Florales", "Frutales", "Aminoácidos", "Hormonas"],
  "Reguladores de Crecimiento": ["Auxinas", "Citoquininas", "Giberelinas", "Inhibidores"],
  Coadyuvantes: ["Adherentes", "Penetrantes", "Antiespumantes", "Surfactantes"],
}

interface SidebarComponentProps {
  initialCategories: Category[] // Categories fetched from Supabase
}

export function SidebarComponent({ initialCategories }: SidebarComponentProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([])
  const router = useRouter()
  const isMobile = useIsMobile()

  const toggleCategory = (categoryName: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setOpenCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((name) => name !== categoryName) : [...prev, categoryName],
    )
  }

  const handleSubcategoryClick = (categorySlug: string, subcategoryName: string) => {
    const searchParams = new URLSearchParams({
      q: subcategoryName,
      categoria: categorySlug, // Use the slug from the fetched category
    })
    router.push(`/buscar?${searchParams.toString()}`)
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      <Card>
        <CardHeader className="pb-3 text-center border-b">
          <CardTitle className="text-lg font-bold text-gray-800 uppercase">Categorías</CardTitle>
        </CardHeader>
        <CardContent className="p-0 max-h-96 overflow-y-auto">
          {initialCategories.map((category) => {
            const hardcodedSubcategories = hardcodedSubcategoriesMap[category.name] || []
            const isOpen = openCategories.includes(category.name)

            return (
              <div key={category.id} className="border-b border-gray-200 last:border-b-0">
                {/* Category header - SOLO expande/contrae, NO navega */}
                <button
                  onClick={(e) => toggleCategory(category.name, e)}
                  className="w-full flex items-center justify-between hover:bg-green-50 px-4 py-3 text-left transition-colors"
                >
                  <span className="text-sm font-medium text-gray-800">+ {category.name}</span>
                  {isOpen ? <Minus className="h-4 w-4 text-gray-600" /> : <Plus className="h-4 w-4 text-gray-600" />}
                </button>

                {/* Subcategorías - Solo estas navegan */}
                {isOpen && hardcodedSubcategories.length > 0 && (
                  <div className="bg-gray-50">
                    {hardcodedSubcategories.map((sub, subIndex) => (
                      <button
                        key={sub}
                        onClick={() => handleSubcategoryClick(category.slug, sub)}
                        className={`w-full flex items-center px-4 py-2 hover:bg-green-100 cursor-pointer text-left transition-colors ${
                          subIndex !== hardcodedSubcategories.length - 1 ? "border-b border-gray-200" : ""
                        }`}
                      >
                        <ChevronRight className="h-3 w-3 text-gray-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700 hover:text-green-700">{sub}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* WhatsApp Contact - Conditionally rendered based on isMobile */}
      {isMobile && (
        <Card className="bg-green-600 text-white">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <h3 className="font-bold text-lg">Consultas por WhatsApp</h3>
              <p className="text-sm opacity-90">¿Necesitas ayuda? Contáctanos</p>
              <Button asChild variant="secondary" className="w-full bg-white text-green-600 hover:bg-gray-100">
                <a
                  href="https://wa.me/51930104083?text=Hola, necesito información sobre productos agrícolas"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📱 WhatsApp
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
