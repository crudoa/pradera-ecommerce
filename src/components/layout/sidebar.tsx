"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus, ChevronRight } from "lucide-react"

const categories = [
  {
    name: "Riego",
    subcategories: ["Aspersores", "Mangueras", "Goteo", "Microaspersión", "Válvulas", "Conectores"],
  },
  {
    name: "Jardinería",
    subcategories: ["Tijeras", "Podadoras", "Rastrillos", "Palas", "Azadas", "Regaderas"],
  },
  {
    name: "Semillas",
    subcategories: ["Hortalizas", "Maíz", "Frutales", "Forrajes", "Arvejas", "Flores"],
  },
  {
    name: "Plaguicidas",
    subcategories: ["Insecticidas", "Fungicidas", "Herbicidas", "Acaricidas", "Nematicidas"],
  },
  {
    name: "Bioinsumos",
    subcategories: ["Orgánicos", "Bioestimulantes", "Microorganismos", "Extractos naturales"],
  },
  {
    name: "Fertilizantes",
    subcategories: ["NPK", "Foliares", "Orgánicos", "Especiales", "Líquidos", "Granulados"],
  },
  {
    name: "Bioestimulantes",
    subcategories: ["Enraizantes", "Florales", "Frutales", "Aminoácidos", "Hormonas"],
  },
  {
    name: "Reguladores de Crecimiento",
    subcategories: ["Auxinas", "Citoquininas", "Giberelinas", "Inhibidores"],
  },
  {
    name: "Coadyuvantes",
    subcategories: ["Adherentes", "Penetrantes", "Antiespumantes", "Surfactantes"],
  },
]

export function SidebarComponent() {
  const [openCategories, setOpenCategories] = useState<string[]>([])
  const router = useRouter()

  const toggleCategory = (categoryName: string, event: React.MouseEvent) => {
    // Prevenir cualquier navegación
    event.preventDefault()
    event.stopPropagation()

    setOpenCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((name) => name !== categoryName) : [...prev, categoryName],
    )
  }

  const handleSubcategoryClick = (categoryName: string, subcategoryName: string) => {
    // Solo las subcategorías navegan a búsqueda
    const searchParams = new URLSearchParams({
      q: subcategoryName,
      categoria: categoryName.toLowerCase().replace(/\s+/g, "-"),
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
          {categories.map((category, index) => (
            <div key={category.name} className={`${index !== categories.length - 1 ? "border-b border-gray-200" : ""}`}>
              {/* Category header - SOLO expande/contrae, NO navega */}
              <button
                onClick={(e) => toggleCategory(category.name, e)}
                className="w-full flex items-center justify-between hover:bg-green-50 px-4 py-3 text-left transition-colors"
              >
                <span className="text-sm font-medium text-gray-800">+ {category.name}</span>
                {openCategories.includes(category.name) ? (
                  <Minus className="h-4 w-4 text-gray-600" />
                ) : (
                  <Plus className="h-4 w-4 text-gray-600" />
                )}
              </button>

              {/* Subcategorías - Solo estas navegan */}
              {openCategories.includes(category.name) && category.subcategories && (
                <div className="bg-gray-50">
                  {category.subcategories.map((sub, subIndex) => (
                    <button
                      key={sub}
                      onClick={() => handleSubcategoryClick(category.name, sub)}
                      className={`w-full flex items-center px-4 py-2 hover:bg-green-100 cursor-pointer text-left transition-colors ${
                        subIndex !== category.subcategories.length - 1 ? "border-b border-gray-200" : ""
                      }`}
                    >
                      <ChevronRight className="h-3 w-3 text-gray-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700 hover:text-green-700">{sub}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* WhatsApp Contact */}
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
    </div>
  )
}
