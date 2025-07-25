"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Minus, ChevronRight } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  subcategories?: Subcategory[]
}

interface Subcategory {
  id: string
  name: string
  slug: string
}

export function ModernSidebar() {
  const [categories, setCategories] = useState<Category[]>([])
  const [openCategories, setOpenCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      // Datos estáticos con estructura de BD
      const mockCategories: Category[] = [
        {
          id: "1",
          name: "Riego",
          slug: "riego",
          subcategories: [
            { id: "1-1", name: "Aspersores", slug: "aspersores" },
            { id: "1-2", name: "Mangueras", slug: "mangueras" },
            { id: "1-3", name: "Goteo", slug: "goteo" },
            { id: "1-4", name: "Microaspersión", slug: "microaspersion" },
            { id: "1-5", name: "Válvulas", slug: "valvulas" },
            { id: "1-6", name: "Conectores", slug: "conectores" },
          ],
        },
        {
          id: "2",
          name: "Jardinería",
          slug: "jardineria",
          subcategories: [
            { id: "2-1", name: "Tijeras", slug: "tijeras" },
            { id: "2-2", name: "Podadoras", slug: "podadoras" },
            { id: "2-3", name: "Rastrillos", slug: "rastrillos" },
            { id: "2-4", name: "Palas", slug: "palas" },
            { id: "2-5", name: "Azadas", slug: "azadas" },
            { id: "2-6", name: "Regaderas", slug: "regaderas" },
          ],
        },
        {
          id: "3",
          name: "Semillas",
          slug: "semillas",
          subcategories: [
            { id: "3-1", name: "Hortalizas", slug: "hortalizas" },
            { id: "3-2", name: "Maíz", slug: "maiz" },
            { id: "3-3", name: "Frutales", slug: "frutales" },
            { id: "3-4", name: "Forrajes", slug: "forrajes" },
            { id: "3-5", name: "Arvejas", slug: "arvejas" },
            { id: "3-6", name: "Flores", slug: "flores" },
          ],
        },
        {
          id: "4",
          name: "Plaguicidas",
          slug: "plaguicidas",
          subcategories: [
            { id: "4-1", name: "Insecticidas", slug: "insecticidas" },
            { id: "4-2", name: "Fungicidas", slug: "fungicidas" },
            { id: "4-3", name: "Herbicidas", slug: "herbicidas" },
            { id: "4-4", name: "Acaricidas", slug: "acaricidas" },
            { id: "4-5", name: "Nematicidas", slug: "nematicidas" },
          ],
        },
        {
          id: "5",
          name: "Bioinsumos",
          slug: "bioinsumos",
          subcategories: [
            { id: "5-1", name: "Orgánicos", slug: "organicos" },
            { id: "5-2", name: "Bioestimulantes", slug: "bioestimulantes" },
            { id: "5-3", name: "Microorganismos", slug: "microorganismos" },
            { id: "5-4", name: "Extractos naturales", slug: "extractos-naturales" },
          ],
        },
        {
          id: "6",
          name: "Fertilizantes",
          slug: "fertilizantes",
          subcategories: [
            { id: "6-1", name: "NPK", slug: "npk" },
            { id: "6-2", name: "Foliares", slug: "foliares" },
            { id: "6-3", name: "Orgánicos", slug: "organicos" },
            { id: "6-4", name: "Especiales", slug: "especiales" },
            { id: "6-5", name: "Líquidos", slug: "liquidos" },
            { id: "6-6", name: "Granulados", slug: "granulados" },
          ],
        },
        {
          id: "7",
          name: "Bioestimulantes",
          slug: "bioestimulantes",
          subcategories: [
            { id: "7-1", name: "Enraizantes", slug: "enraizantes" },
            { id: "7-2", name: "Florales", slug: "florales" },
            { id: "7-3", name: "Frutales", slug: "frutales" },
            { id: "7-4", name: "Aminoácidos", slug: "aminoacidos" },
            { id: "7-5", name: "Hormonas", slug: "hormonas" },
          ],
        },
        {
          id: "8",
          name: "Reguladores de Crecimiento",
          slug: "reguladores-crecimiento",
          subcategories: [
            { id: "8-1", name: "Auxinas", slug: "auxinas" },
            { id: "8-2", name: "Citoquininas", slug: "citoquininas" },
            { id: "8-3", name: "Giberelinas", slug: "giberelinas" },
            { id: "8-4", name: "Inhibidores", slug: "inhibidores" },
          ],
        },
        {
          id: "9",
          name: "Coadyuvantes",
          slug: "coadyuvantes",
          subcategories: [
            { id: "9-1", name: "Adherentes", slug: "adherentes" },
            { id: "9-2", name: "Penetrantes", slug: "penetrantes" },
            { id: "9-3", name: "Antiespumantes", slug: "antiespumantes" },
            { id: "9-4", name: "Surfactantes", slug: "surfactantes" },
          ],
        },
        {
          id: "10",
          name: "Mallas Cercos Ganaderos",
          slug: "mallas-cercos",
          subcategories: [
            { id: "10-1", name: "Mallas Ganaderas", slug: "mallas-ganaderas" },
            { id: "10-2", name: "Cercos Eléctricos", slug: "cercos-electricos" },
            { id: "10-3", name: "Postes", slug: "postes" },
            { id: "10-4", name: "Accesorios", slug: "accesorios" },
          ],
        },
        {
          id: "11",
          name: "Línea de Invernaderos",
          slug: "invernaderos",
          subcategories: [
            { id: "11-1", name: "Estructuras", slug: "estructuras" },
            { id: "11-2", name: "Plásticos", slug: "plasticos" },
            { id: "11-3", name: "Ventilación", slug: "ventilacion" },
            { id: "11-4", name: "Control Climático", slug: "control-climatico" },
          ],
        },
        {
          id: "12",
          name: "Equipos e Implementos Agrícolas",
          slug: "equipos-agricolas",
          subcategories: [
            { id: "12-1", name: "Fumigadoras", slug: "fumigadoras" },
            { id: "12-2", name: "Sembradoras", slug: "sembradoras" },
            { id: "12-3", name: "Cultivadoras", slug: "cultivadoras" },
            { id: "12-4", name: "Arados", slug: "arados" },
            { id: "12-5", name: "Cosechadoras", slug: "cosechadoras" },
          ],
        },
        {
          id: "13",
          name: "Protección Personal Seguridad Industrial",
          slug: "proteccion-personal",
          subcategories: [
            { id: "13-1", name: "Mascarillas", slug: "mascarillas" },
            { id: "13-2", name: "Guantes", slug: "guantes" },
            { id: "13-3", name: "Overoles", slug: "overoles" },
            { id: "13-4", name: "Botas", slug: "botas" },
            { id: "13-5", name: "Cascos", slug: "cascos" },
            { id: "13-6", name: "Gafas", slug: "gafas" },
          ],
        },
      ]

      setCategories(mockCategories)
      setLoading(false)
    } catch (error) {
      console.error("Error loading categories:", error)
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    setOpenCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleSubcategoryClick = (categorySlug: string, subcategorySlug: string, subcategoryName: string) => {
    const searchParams = new URLSearchParams({
      q: subcategoryName,
      categoria: categorySlug,
      subcategoria: subcategorySlug,
    })
    router.push(`/buscar?${searchParams.toString()}`)
  }

  if (loading) {
    return (
      <Card className="shadow-lg w-full">
        <CardHeader className="pb-3 text-center border-b">
          <CardTitle className="text-lg font-bold text-foreground uppercase">Categorías</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-secondary rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg w-full">
      <CardHeader className="pb-3 text-center border-b border-border">
        <CardTitle className="text-lg font-bold text-foreground uppercase tracking-wide">Categorías</CardTitle>
      </CardHeader>
      <CardContent className="p-0 max-h-96 overflow-y-auto">
        {categories.map((category, index) => (
          <div key={category.id} className={`${index !== categories.length - 1 ? "border-b border-border" : ""}`}>
            {/* Category header */}
            <button
              onClick={(e) => toggleCategory(category.id, e)}
              className="w-full flex items-center justify-between hover:bg-secondary px-4 py-3 text-left transition-colors duration-200 group"
            >
              <span className="text-sm font-medium text-foreground group-hover:text-foreground">{category.name}</span>
              {openCategories.includes(category.id) ? (
                <Minus className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <Plus className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>

            {/* Subcategories */}
            {openCategories.includes(category.id) && category.subcategories && (
              <div className="bg-secondary border-t border-border">
                {category.subcategories.map((sub, subIndex) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSubcategoryClick(category.slug, sub.slug, sub.name)}
                    className={`w-full flex items-center px-6 py-2 hover:bg-muted cursor-pointer text-left transition-colors duration-200 group ${
                      subIndex !== category.subcategories!.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <ChevronRight className="h-3 w-3 text-muted-foreground mr-3 flex-shrink-0 group-hover:text-foreground transition-colors" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {sub.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>

      {/* WhatsApp Contact */}
      <div className="bg-primary text-white p-4 mt-4 rounded-b-lg">
        <div className="text-center space-y-3">
          <h3 className="font-bold text-lg">Consultas por WhatsApp</h3>
          <p className="text-sm opacity-90">¿Necesitas ayuda? Contáctanos</p>
          <Button asChild variant="secondary" className="w-full bg-white text-primary hover:bg-gray-100">
            <a
              href="https://wa.me/51973311973?text=Hola, necesito información sobre productos agrícolas"
              target="_blank"
              rel="noopener noreferrer"
            >
              📱 WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </Card>
  )
}
