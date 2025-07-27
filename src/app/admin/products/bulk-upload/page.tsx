"use client"

import { Badge } from "@/components/ui/badge"
import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/lib/hooks/use-toast"
import {
  Loader2,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Image from "next/image"
import { productDataSchema, productUpdateSchema } from "@/lib/validations/product-schemas"
import { z } from "zod"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ImageUploadInput } from "@/components/ui/image-upload-input"
import { categorySchema } from "@/lib/validations/category-schemas" // Import the new category schema

import type { Database, Json } from "@/types/database"
import type { ProductData, ProductUploadStatus, Category, Product } from "@/types/product"

export default function BulkUploadPage() {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  const { toast } = useToast()

  // State for Bulk Upload
  const [file, setFile] = useState<File | null>(null)
  const [productsToUpload, setProductsToUpload] = useState<ProductUploadStatus[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // State for Single Product Add/Edit/Delete
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false) // State for collapsible
  const [newProductForm, setNewProductForm] = useState<ProductData>({
    name: "",
    description: "", // Changed to empty string for required field
    price: 0,
    sku: "",
    stock_quantity: 0,
    category_id: "",
    image_url: "", // Changed to empty string for required field
    is_active: true,
    short_description: null,
    dimensions: null,
    original_price: null,
    specifications: null,
    weight: null,
    is_featured: false,
    is_new: true,
    track_inventory: true,
    allow_backorder: false,
    view_count: 0,
    sales_count: 0,
    rating: 0,
    meta_title: null,
    meta_description: null,
    tags: null,
    brand_id: null,
    slug: null, // Changed to null for optional field
    brand: "", // Changed to empty string for required field
  })
  const [isEditingProduct, setIsEditingProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDeletingProduct, setIsDeletingProduct] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [newProductErrors, setNewProductErrors] = useState<z.ZodIssue[] | null>(null)
  const [editProductErrors, setEditProductErrors] = useState<z.ZodIssue[] | null>(null)

  // State for Product Details Modal
  const [isViewingProduct, setIsViewingProduct] = useState(false)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)

  // Categories state (used by both forms)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // State for New Category
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryErrors, setNewCategoryErrors] = useState<z.ZodIssue[] | null>(null)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

  // State for Deleting Category
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true)
    try {
      // Select all fields to match the Category interface, including is_active
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, description, image_url, is_active, created_at, updated_at")
        .order("name")
      if (error) throw error
      // Ensure data matches Category type, especially for 'is_active'
      setCategories(data.map((c) => ({ ...c, is_active: c.is_active ?? true })) || [])
    } catch (error: any) {
      toast({
        title: "Error al cargar categorías",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoadingCategories(false)
    }
  }, [supabase, toast])

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true)
    try {
      type RawProductFromSupabase = Database["public"]["Tables"]["products"]["Row"] & {
        categories: { name: string | null } | null
        short_description?: string | null
        dimensions?: Json | null
        original_price?: number | null
        specifications?: Json | null
        weight?: number | null
        slug?: string | null
        stock_quantity?: number | null
        is_featured?: boolean | null
        is_new?: boolean | null
        track_inventory?: boolean | null
        allow_backorder?: boolean | null
        view_count?: number | null
        sales_count?: number | null
        rating?: number | null
        meta_title?: string | null
        meta_description?: string | null
        tags?: string[] | null
        brand_id?: string | null
      }

      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false })

      if (error) throw error

      const mappedProducts: Product[] = (data || []).map(
        (p: RawProductFromSupabase) =>
          ({
            id: p.id,
            name: p.name,
            description: p.description ?? null,
            price: p.price,
            sku: p.sku,
            slug: p.slug || null, // Changed to null for optional field
            brand: p.brand || null, // Changed to null for optional field
            stock: p.stock_quantity || 0,
            is_active: p.is_active ?? false,
            created_at: p.created_at,
            updated_at: p.updated_at,
            category_id: p.category_id,
            image_url: p.image_url ?? null,
            category_name: p.categories?.name || null,
            category: p.categories?.name || null,
            short_description: p.short_description ?? null,
            dimensions: p.dimensions ?? null,
            original_price: p.original_price ?? null,
            specifications: p.specifications ?? null,
            weight: p.weight ?? null,
            is_featured: p.is_featured ?? false,
            is_new: p.is_new ?? false,
            track_inventory: p.track_inventory ?? false,
            allow_backorder: p.allow_backorder ?? false,
            view_count: p.view_count ?? 0,
            sales_count: p.sales_count ?? 0,
            rating: p.rating ?? 0,
            meta_title: p.meta_title ?? null,
            meta_description: p.meta_description ?? null,
            tags: p.tags ?? null,
            brand_id: p.brand_id ?? null,
          }) as Product,
      )

      setProducts(mappedProducts || [])
    } catch (error: any) {
      toast({
        title: "Error al cargar productos",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoadingProducts(false)
    }
  }, [supabase, toast])

  useEffect(() => {
    fetchCategories()
    loadProducts()
  }, [fetchCategories, loadProducts])

  const getZodErrorMessage = (errors: z.ZodIssue[] | null, fieldName: string) => {
    return errors?.find((err) => err.path.includes(fieldName))?.message
  }

  // --- Bulk Upload Handlers ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
      setProductsToUpload([])
      setUploadProgress(0)
    }
  }

  const parseCSV = (csvText: string): ProductData[] => {
    const lines = csvText.split("\n").filter((line) => line.trim() !== "")
    if (lines.length === 0) return []

    const headers = lines[0].split(",").map((header) => header.trim().toLowerCase())
    const products: Partial<ProductData>[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",")
      if (values.length !== headers.length) {
        console.warn(`Skipping malformed row: ${lines[i]}`)
        continue
      }

      const product: Partial<ProductData> = {}
      headers.forEach((header, index) => {
        const value = values[index]?.trim() || ""
        switch (header) {
          case "name":
            product.name = value
            break
          case "description":
            product.description = value // No longer setting to null for empty string if required
            break
          case "short_description":
            product.short_description = value === "" ? null : value
            break
          case "price":
            product.price = Number.parseFloat(value) || 0
            break
          case "original_price":
            product.original_price = value === "" ? null : Number.parseFloat(value) || 0
            break
          case "sku":
            product.sku = value
            break
          case "slug":
            product.slug = value === "" ? null : value // Changed to null for optional field
            break
          case "brand":
            product.brand = value // No longer setting to null for empty string if required
            break
          case "weight":
            product.weight = value === "" ? null : Number.parseFloat(value) || 0
            break
          case "dimensions":
            try {
              product.dimensions = value ? JSON.parse(value) : null
            } catch {
              product.dimensions = null
            }
            break
          case "stock":
            product.stock_quantity = Number.parseInt(value, 10) || 0
            break
          case "category_name":
            const category = categories.find((cat) => cat.name.toLowerCase() === value.toLowerCase())
            product.category_id = category ? category.id : ""
            break
          case "image_url":
            product.image_url = value // No longer setting to null for empty string if required
            break
          case "is_active":
            product.is_active = value.toLowerCase() === "true" || value === "1"
            break
          case "specifications":
            try {
              product.specifications = value ? JSON.parse(value) : null
            } catch {
              product.specifications = null
            }
            break
          case "is_featured":
            product.is_featured = value.toLowerCase() === "true" || value === "1"
            break
          case "is_new":
            product.is_new = value.toLowerCase() === "true" || value === "1"
            break
          case "track_inventory":
            product.track_inventory = value.toLowerCase() === "true" || value === "1"
            break
          case "allow_backorder":
            product.allow_backorder = value.toLowerCase() === "true" || value === "1"
            break
          case "view_count":
            product.view_count = Number.parseInt(value, 10) || 0
            break
          case "sales_count":
            product.sales_count = Number.parseInt(value, 10) || 0
            break
          case "rating":
            product.rating = Number.parseFloat(value) || 0
            break
          case "meta_title":
            product.meta_title = value === "" ? null : value
            break
          case "meta_description":
            product.meta_description = value === "" ? null : value
            break
          case "tags":
            product.tags = value === "" ? null : value.split(";").map((tag) => tag.trim())
            break
          case "brand_id":
            product.brand_id = value === "" ? null : value
            break
        }
      })

      const validationResult = productDataSchema.safeParse(product)
      if (validationResult.success) {
        products.push(validationResult.data)
      } else {
        console.warn("Skipping product due to validation errors:", product, validationResult.error.issues)
      }
    }
    return products as ProductData[]
  }

  const handleProcessCSV = async () => {
    if (!file) {
      toast({
        title: "No se ha seleccionado ningún archivo",
        description: "Por favor, selecciona un archivo CSV para cargar.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    const reader = new FileReader()

    reader.onload = async (e) => {
      const text = e.target?.result as string
      const parsedProducts = parseCSV(text)

      if (parsedProducts.length === 0) {
        toast({
          title: "Archivo CSV vacío o inválido",
          description: "No se encontraron productos válidos en el archivo CSV.",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      setProductsToUpload(parsedProducts.map((p) => ({ ...p, status: "pending" })))
      setIsProcessing(false)
      toast({
        title: "CSV procesado",
        description: `${parsedProducts.length} productos listos para cargar.`,
      })
    }

    reader.onerror = () => {
      toast({
        title: "Error al leer el archivo",
        description: "No se pudo leer el archivo CSV.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }

    reader.readAsText(file)
  }

  const handleUploadProducts = async () => {
    if (productsToUpload.length === 0) {
      toast({
        title: "No hay productos para cargar",
        description: "Por favor, procesa un archivo CSV primero.",
        variant: "destructive",
      })
      return
    }

    let uploadedCount = 0
    const totalProducts = productsToUpload.length

    for (let i = 0; i < totalProducts; i++) {
      const product = productsToUpload[i]
      setProductsToUpload((prev) => prev.map((p, idx) => (idx === i ? { ...p, status: "uploading" } : p)))

      try {
        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        })

        if (response.ok) {
          setProductsToUpload((prev) => prev.map((p, idx) => (idx === i ? { ...p, status: "success" } : p)))
          uploadedCount++
        } else {
          const errorData = await response.json()
          setProductsToUpload((prev) =>
            prev.map((p, idx) =>
              idx === i ? { ...p, status: "error", error: errorData.error || "Error desconocido" } : p,
            ),
          )
        }
      } catch (error: any) {
        setProductsToUpload((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, status: "error", error: error.message || "Error de red" } : p)),
        )
      } finally {
        setUploadProgress(Math.round(((i + 1) / totalProducts) * 100))
      }
    }

    toast({
      title: "Carga masiva completada",
      description: `${uploadedCount} de ${totalProducts} productos cargados exitosamente.`,
      duration: 5000,
    })
    await loadProducts()
  }

  // --- Single Product Add/Edit/Delete Handlers ---
  const handleNewProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewProductForm((prev) => {
      if (
        name === "price" ||
        name === "stock_quantity" ||
        name === "weight" ||
        name === "original_price" ||
        name === "view_count" ||
        name === "sales_count" ||
        name === "rating"
      ) {
        return { ...prev, [name]: Number.parseFloat(value) || 0 }
      }
      if (
        name === "is_active" ||
        name === "is_featured" ||
        name === "is_new" ||
        name === "track_inventory" ||
        name === "allow_backorder"
      ) {
        return { ...prev, [name]: value === "true" }
      }
      if (name === "tags") {
        return { ...prev, [name]: value.split(",").map((tag) => tag.trim()) }
      }
      if (name === "dimensions" || name === "specifications") {
        try {
          return { ...prev, [name]: value ? JSON.parse(value) : null }
        } catch (e) {
          return { ...prev, [name]: value }
        }
      }
      // For required string fields, ensure empty string is kept, not converted to null
      if (name === "description" || name === "image_url" || name === "brand") {
        return { ...prev, [name]: value }
      }
      // For optional string fields, convert empty string to null
      if (
        name === "short_description" ||
        name === "slug" ||
        name === "meta_title" ||
        name === "meta_description" ||
        name === "brand_id"
      ) {
        return { ...prev, [name]: value === "" ? null : value }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleNewProductSelectChange = (name: string, value: string) => {
    setNewProductForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewProductImageUpload = (url: string | null) => {
    setNewProductForm((prev) => ({ ...prev, image_url: url || "" })) // Ensure it's an empty string if null for required field
  }

  const handleAddProduct = async () => {
    setNewProductErrors(null)
    try {
      const validatedData = productDataSchema.parse(newProductForm)
      setLoadingProducts(true)
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      })

      const responseData = await response.json()
      if (!response.ok) {
        if (response.status === 400 && responseData.issues) {
          setNewProductErrors(responseData.issues)
          toast({
            title: "Error de validación",
            description: "Por favor, revisa los campos del formulario.",
            variant: "destructive",
          })
        } else {
          throw new Error(responseData.error || "Error desconocido al crear producto")
        }
        return
      }

      toast({
        title: "Producto creado",
        description: `El producto "${newProductForm.name}" ha sido creado exitosamente.`,
      })
      setIsAddProductOpen(false) // Close the collapsible after adding
      setNewProductForm({
        name: "",
        description: "", // Reset to empty string for required field
        price: 0,
        sku: "",
        stock_quantity: 0,
        category_id: "",
        image_url: "", // Reset to empty string for required field
        is_active: true,
        short_description: null,
        dimensions: null,
        original_price: null,
        specifications: null,
        weight: null,
        is_featured: false,
        is_new: true,
        track_inventory: true,
        allow_backorder: false,
        view_count: 0,
        sales_count: 0,
        rating: 0,
        meta_title: null,
        meta_description: null,
        tags: null,
        brand_id: null,
        slug: null, // Reset to null for optional field
        brand: "", // Reset to empty string for required field
      })
      await loadProducts()
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setNewProductErrors(error.issues)
        toast({
          title: "Error de validación",
          description: "Por favor, revisa los campos del formulario.",
          variant: "destructive",
        })
      } else {
        console.error("Error adding new product:", error)
        toast({
          title: "Error al crear producto",
          description: error.message || "Hubo un error al crear el producto. Inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleEditProductClick = (product: Product) => {
    setEditingProduct(product)
    setIsEditingProduct(true)
    setEditProductErrors(null)
  }

  const handleViewProductClick = (product: Product) => {
    setViewingProduct(product)
    setIsViewingProduct(true)
  }

  const handleEditingProductChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setEditingProduct((prev) => {
      if (!prev) return null
      if (
        name === "price" ||
        name === "stock" ||
        name === "weight" ||
        name === "original_price" ||
        name === "view_count" ||
        name === "sales_count" ||
        name === "rating"
      ) {
        return { ...prev, [name]: Number.parseFloat(value) || 0 }
      }
      if (
        name === "is_active" ||
        name === "is_featured" ||
        name === "is_new" ||
        name === "track_inventory" ||
        name === "allow_backorder"
      ) {
        return { ...prev, [name]: value === "true" }
      }
      if (name === "tags") {
        return { ...prev, [name]: value.split(",").map((tag) => tag.trim()) }
      }
      if (name === "dimensions" || name === "specifications") {
        try {
          return { ...prev, [name]: value ? JSON.parse(value) : null }
        } catch (e) {
          return { ...prev, [name]: value }
        }
      }
      // For required string fields, ensure empty string is kept, not converted to null
      if (name === "description" || name === "image_url" || name === "brand") {
        return { ...prev, [name]: value }
      }
      // For optional string fields, convert empty string to null
      if (
        name === "short_description" ||
        name === "slug" ||
        name === "meta_title" ||
        name === "meta_description" ||
        name === "brand_id"
      ) {
        return { ...prev, [name]: value === "" ? null : value }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleEditingProductImageUpload = (url: string | null) => {
    setEditingProduct((prev) => (prev ? { ...prev, image_url: url || "" } : null)) // Ensure it's an empty string if null for required field
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    setEditProductErrors(null)
    try {
      const validatedData = productUpdateSchema.parse({
        ...editingProduct,
        stock_quantity: editingProduct.stock, // Map frontend 'stock' to schema's 'stock_quantity'
      })

      setLoadingProducts(true)
      const {
        id,
        name,
        description,
        price,
        sku,
        stock_quantity, // Destructure stock_quantity from validatedData
        category_id,
        brand,
        image_url,
        is_active,
        slug,
        short_description,
        dimensions,
        original_price,
        specifications,
        weight,
        is_featured,
        is_new,
        track_inventory,
        allow_backorder,
        view_count,
        sales_count,
        rating,
        meta_title,
        meta_description,
        tags,
        brand_id,
      } = validatedData

      const response = await fetch("/api/admin/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name,
          description: description,
          price,
          sku,
          stock_quantity: stock_quantity, // Send stock_quantity to the API
          category_id,
          brand,
          image_url,
          is_active: is_active,
          slug,
          short_description,
          dimensions,
          original_price,
          specifications,
          weight,
          is_featured,
          is_new,
          track_inventory,
          allow_backorder,
          view_count,
          sales_count,
          rating,
          meta_title,
          meta_description,
          tags,
          brand_id,
        }),
      })

      const responseData = await response.json()
      if (!response.ok) {
        if (response.status === 400 && responseData.issues) {
          setEditProductErrors(responseData.issues)
          toast({
            title: "Error de validación",
            description: "Por favor, revisa los campos del formulario.",
            variant: "destructive",
          })
        } else {
          throw new Error(responseData.error || "Error desconocido al actualizar producto")
        }
        return
      }

      toast({
        title: "Producto actualizado",
        description: `El producto "${name}" ha sido actualizado exitosamente.`,
      })
      setIsEditingProduct(false)
      setEditingProduct(null)
      await loadProducts()
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setEditProductErrors(error.issues)
        toast({
          title: "Error de validación",
          description: "Por favor, revisa los campos del formulario.",
          variant: "destructive",
        })
      } else {
        console.error("Error updating product:", error)
        toast({
          title: "Error al actualizar producto",
          description: error.message || "Hubo un error al actualizar el producto. Inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleDeleteProductClick = (productId: string) => {
    setDeletingProductId(productId)
    setIsDeletingProduct(true)
  }

  const confirmDeleteProduct = async () => {
    if (!deletingProductId) return

    try {
      setLoadingProducts(true)
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: deletingProductId }),
      })

      let responseData
      // Check if the response is OK and has a JSON content type
      if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
        responseData = await response.json()
      } else if (!response.ok) {
        // If response is not OK, try to parse JSON if available, otherwise default error
        try {
          responseData = await response.json()
        } catch (jsonError) {
          responseData = { error: `Error ${response.status}: ${response.statusText}` }
        }
        throw new Error(responseData.error || "Error desconocido al eliminar producto")
      }

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente.",
      })
      setIsDeletingProduct(false)
      setDeletingProductId(null)
      await loadProducts()
    } catch (error: any) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error al eliminar producto",
        description: error.message || "Hubo un error al eliminar el producto. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleAddCategory = async () => {
    setNewCategoryErrors(null)
    setIsCreatingCategory(true)
    try {
      const validatedData = categorySchema.parse({ name: newCategoryName })

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: validatedData.name }),
      })

      const responseData = await response.json()
      if (!response.ok) {
        if (response.status === 400 && responseData.issues) {
          setNewCategoryErrors(responseData.issues)
          toast({
            title: "Error de validación",
            description: "Por favor, revisa el nombre de la categoría.",
            variant: "destructive",
          })
        } else {
          throw new Error(responseData.error || "Error desconocido al crear categoría")
        }
        return
      }

      toast({
        title: "Categoría creada",
        description: `La categoría "${newCategoryName}" ha sido creada exitosamente.`,
      })
      setNewCategoryName("") // Clear input
      await fetchCategories() // Re-fetch categories to update dropdowns
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setNewCategoryErrors(error.issues)
        toast({
          title: "Error de validación",
          description: "Por favor, revisa el nombre de la categoría.",
          variant: "destructive",
        })
      } else {
        console.error("Error adding new category:", error)
        toast({
          title: "Error al crear categoría",
          description: error.message || "Hubo un error al crear la categoría. Inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const handleDeleteCategoryClick = (categoryId: string) => {
    setDeletingCategoryId(categoryId)
    setIsDeletingCategory(true)
  }

  const confirmDeleteCategory = async () => {
    if (!deletingCategoryId) return

    try {
      setLoadingCategories(true)
      const response = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: deletingCategoryId }),
      })

      let responseData
      if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
        responseData = await response.json()
      } else if (!response.ok) {
        try {
          responseData = await response.json()
        } catch (jsonError) {
          responseData = { error: `Error ${response.status}: ${response.statusText}` }
        }
        throw new Error(responseData.error || "Error desconocido al eliminar categoría")
      }

      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada exitosamente.",
      })
      setIsDeletingCategory(false)
      setDeletingCategoryId(null)
      await fetchCategories() // Re-fetch categories to update the list
    } catch (error: any) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error al eliminar categoría",
        description: error.message || "Hubo un error al eliminar la categoría. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoadingCategories(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-9xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Gestión de Productos</h1>
          <p className="text-gray-600 mb-8">
            Añade, edita, elimina productos individualmente o realiza cargas masivas.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Añadir Producto Individual */}
            <Card>
              <Collapsible open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-2xl font-bold">Añadir Nuevo Producto</CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                      {isAddProductOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      <span className="sr-only">Toggle add product form</span>
                    </Button>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleAddProduct()
                      }}
                      className="grid gap-4"
                    >
                      <div className="grid gap-2">
                        <Label htmlFor="new-product-name">
                          Nombre del Producto <span className="text-red-500 text-xs font-normal">(OBLIGATORIO)</span>
                        </Label>
                        <Input
                          id="new-product-name"
                          name="name"
                          value={newProductForm.name}
                          onChange={handleNewProductChange}
                          required
                        />
                        {getZodErrorMessage(newProductErrors, "name") && (
                          <p className="text-red-500 text-sm">{getZodErrorMessage(newProductErrors, "name")}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-product-description">
                          Descripción Completa <span className="text-red-500 text-xs font-normal">(OBLIGATORIO)</span>
                        </Label>
                        <Textarea
                          id="new-product-description"
                          name="description"
                          value={newProductForm.description || ""}
                          onChange={handleNewProductChange}
                          required // Added required based on schema change
                        />
                        {getZodErrorMessage(newProductErrors, "description") && (
                          <p className="text-red-500 text-sm">{getZodErrorMessage(newProductErrors, "description")}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-product-short-description">
                          Descripción Corta <span className="text-blue-500 text-xs font-normal">(OPCIONAL)</span>
                        </Label>
                        <Input
                          id="new-product-short-description"
                          name="short_description"
                          value={newProductForm.short_description || ""}
                          onChange={handleNewProductChange}
                        />
                        {getZodErrorMessage(newProductErrors, "short_description") && (
                          <p className="text-red-500 text-sm">
                            {getZodErrorMessage(newProductErrors, "short_description")}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="new-product-price">
                            Precio (S/) <span className="text-red-500 text-xs font-normal">(OBLIGATORIO)</span>
                          </Label>
                          <Input
                            id="new-product-price"
                            name="price"
                            type="number"
                            step="0.01"
                            value={newProductForm.price}
                            onChange={handleNewProductChange}
                            required
                          />
                          {getZodErrorMessage(newProductErrors, "price") && (
                            <p className="text-red-500 text-sm">{getZodErrorMessage(newProductErrors, "price")}</p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new-product-original-price">
                            Precio Original (S/) <span className="text-blue-500 text-xs font-normal">(OPCIONAL)</span>
                          </Label>
                          <Input
                            id="new-product-original-price"
                            name="original_price"
                            type="number"
                            step="0.01"
                            value={newProductForm.original_price || ""}
                            onChange={handleNewProductChange}
                          />
                          {getZodErrorMessage(newProductErrors, "original_price") && (
                            <p className="text-red-500 text-sm">
                              {getZodErrorMessage(newProductErrors, "original_price")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="new-product-sku">
                            SKU <span className="text-red-500 text-xs font-normal">(OBLIGATORIO)</span>
                          </Label>
                          <Input
                            id="new-product-sku"
                            name="sku"
                            value={newProductForm.sku}
                            onChange={handleNewProductChange}
                            required
                          />
                          {getZodErrorMessage(newProductErrors, "sku") && (
                            <p className="text-red-500 text-sm">{getZodErrorMessage(newProductErrors, "sku")}</p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new-product-slug">
                            Slug <span className="text-blue-500 text-xs font-normal">(OPCIONAL)</span>
                          </Label>
                          <Input
                            id="new-product-slug"
                            name="slug"
                            value={newProductForm.slug || ""}
                            onChange={handleNewProductChange}
                          />
                          {getZodErrorMessage(newProductErrors, "slug") && (
                            <p className="text-red-500 text-sm">{getZodErrorMessage(newProductErrors, "slug")}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-product-brand">
                          Marca <span className="text-red-500 text-xs font-normal">(OBLIGATORIO)</span>
                        </Label>
                        <Input
                          id="new-product-brand"
                          name="brand"
                          value={newProductForm.brand || ""}
                          onChange={handleNewProductChange}
                          required // Added required based on schema change
                        />
                        {getZodErrorMessage(newProductErrors, "brand") && (
                          <p className="text-red-500 text-sm">{getZodErrorMessage(newProductErrors, "brand")}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-product-stock">
                          Stock <span className="text-red-500 text-xs font-normal">(OBLIGATORIO)</span>
                        </Label>
                        <Input
                          id="new-product-stock"
                          name="stock_quantity"
                          type="number"
                          value={newProductForm.stock_quantity}
                          onChange={handleNewProductChange}
                          required
                        />
                        {getZodErrorMessage(newProductErrors, "stock_quantity") && (
                          <p className="text-red-500 text-sm">
                            {getZodErrorMessage(newProductErrors, "stock_quantity")}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-product-weight">
                          Peso (kg) <span className="text-blue-500 text-xs font-normal">(OPCIONAL)</span>
                        </Label>
                        <Input
                          id="new-product-weight"
                          name="weight"
                          type="number"
                          step="0.01"
                          value={newProductForm.weight || ""}
                          onChange={handleNewProductChange}
                        />
                        {getZodErrorMessage(newProductErrors, "weight") && (
                          <p className="text-red-500 text-sm">{getZodErrorMessage(newProductErrors, "weight")}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-product-dimensions">
                          Dimensiones (JSON) <span className="text-blue-500 text-xs font-normal">(OPCIONAL)</span>
                        </Label>
                        <Input
                          id="new-product-dimensions"
                          name="dimensions"
                          value={newProductForm.dimensions ? JSON.stringify(newProductForm.dimensions) : ""}
                          onChange={handleNewProductChange}
                          placeholder='{"width": 10, "height": 20, "depth": 5}'
                        />
                        {getZodErrorMessage(newProductErrors, "dimensions") && (
                          <p className="text-red-500 text-sm">{getZodErrorMessage(newProductErrors, "dimensions")}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-product-specifications">
                          Especificaciones (JSON) <span className="text-blue-500 text-xs font-normal">(OPCIONAL)</span>
                        </Label>
                        <Input
                          id="new-product-specifications"
                          name="specifications"
                          value={newProductForm.specifications ? JSON.stringify(newProductForm.specifications) : ""}
                          onChange={handleNewProductChange}
                          placeholder='{"color": "red", "material": "wood"}'
                        />
                        {getZodErrorMessage(newProductErrors, "specifications") && (
                          <p className="text-red-500 text-sm">
                            {getZodErrorMessage(newProductErrors, "specifications")}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-product-category">Categoría</Label>
                        <Select
                          name="category_id"
                          value={newProductForm.category_id}
                          onValueChange={(value) => handleNewProductSelectChange("category_id", value)}
                          disabled={loadingCategories}
                        >
                          <SelectTrigger id="new-product-category">
                            <SelectValue
                              placeholder={loadingCategories ? "Cargando categorías..." : "Seleccionar categoría"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {getZodErrorMessage(newProductErrors, "category_id") && (
                          <p className="text-red-500 text-sm">{getZodErrorMessage(newProductErrors, "category_id")}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-product-image-url">
                          Añadir Imagen <span className="text-red-500 text-xs font-normal">(OBLIGATORIO)</span>
                        </Label>
                        <ImageUploadInput
                          value={newProductForm.image_url ?? null}
                          onChange={handleNewProductImageUpload}
                          uploadUrl="/api/admin/upload-product-image"
                          identifier={newProductForm.sku}
                        />
                        {getZodErrorMessage(newProductErrors, "image_url") && (
                          <p className="text-red-500 text-sm">{getZodErrorMessage(newProductErrors, "image_url")}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="new-product-is-active">Activo</Label>
                          <Select
                            name="is_active"
                            value={newProductForm.is_active ? "true" : "false"}
                            onValueChange={(value) => handleNewProductSelectChange("is_active", value)}
                          >
                            <SelectTrigger id="new-product-is-active">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Sí</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new-product-is-featured">Destacado</Label>
                          <Select
                            name="is_featured"
                            value={newProductForm.is_featured ? "true" : "false"}
                            onValueChange={(value) => handleNewProductSelectChange("is_featured", value)}
                          >
                            <SelectTrigger id="new-product-is-featured">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Sí</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="new-product-is-new">Nuevo</Label>
                          <Select
                            name="is_new"
                            value={newProductForm.is_new ? "true" : "false"}
                            onValueChange={(value) => handleNewProductSelectChange("is_new", value)}
                          >
                            <SelectTrigger id="new-product-is-new">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Sí</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new-product-track-inventory">Rastrear Inventario</Label>
                          <Select
                            name="track_inventory"
                            value={newProductForm.track_inventory ? "true" : "false"}
                            onValueChange={(value) => handleNewProductSelectChange("track_inventory", value)}
                          >
                            <SelectTrigger id="new-product-track-inventory">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Sí</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-product-allow-backorder">Permitir Pedidos Pendientes</Label>
                        <Select
                          name="allow_backorder"
                          value={newProductForm.allow_backorder ? "true" : "false"}
                          onValueChange={(value) => handleNewProductSelectChange("allow_backorder", value)}
                        >
                          <SelectTrigger id="new-product-allow-backorder">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Sí</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="new-product-view-count">
                            Vistas <span className="text-blue-500 text-xs font-normal">(OPCIONAL)</span>
                          </Label>
                          <Input
                            id="new-product-view-count"
                            name="view_count"
                            type="number"
                            value={newProductForm.view_count || ""}
                            onChange={handleNewProductChange}
                          />
                          {getZodErrorMessage(newProductErrors, "view_count") && (
                            <p className="text-red-500 text-sm">{getZodErrorMessage(newProductErrors, "view_count")}</p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new-product-sales-count">
                            Ventas <span className="text-blue-500 text-xs font-normal">(OPCIONAL)</span>
                          </Label>
                          <Input
                            id="new-product-sales-count"
                            name="sales_count"
                            type="number"
                            value={newProductForm.sales_count || ""}
                            onChange={handleNewProductChange}
                          />
                          {getZodErrorMessage(newProductErrors, "sales_count") && (
                            <p className="text-red-500 text-sm">
                              {getZodErrorMessage(newProductErrors, "sales_count")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-product-rating">
                          Calificación <span className="text-blue-500 text-xs font-normal">(OPCIONAL)</span>
                        </Label>
                        <Input
                          id="new-product-rating"
                          name="rating"
                          type="number"
                          step="0.1"
                          value={newProductForm.rating || ""}
                          onChange={handleNewProductChange}
                        />
                        {getZodErrorMessage(newProductErrors, "rating") && (
                          <p className="text-red-500 text-sm">{getZodErrorMessage(newProductErrors, "rating")}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-product-meta-title">
                          Meta Título <span className="text-blue-500 text-xs font-normal">(OPCIONAL)</span>
                        </Label>
                        <Input
                          id="new-product-meta-title"
                          name="meta_title"
                          value={newProductForm.meta_title || ""}
                          onChange={handleNewProductChange}
                        />
                        {getZodErrorMessage(newProductErrors, "meta_title") && (
                          <p className="text-red-500 text-sm">{getZodErrorMessage(newProductErrors, "meta_title")}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-product-meta-description">
                          Meta Descripción <span className="text-blue-500 text-xs font-normal">(OPCIONAL)</span>
                        </Label>
                        <Textarea
                          id="new-product-meta-description"
                          name="meta_description"
                          value={newProductForm.meta_description || ""}
                          onChange={handleNewProductChange}
                        />
                        {getZodErrorMessage(newProductErrors, "meta_description") && (
                          <p className="text-red-500 text-sm">
                            {getZodErrorMessage(newProductErrors, "meta_description")}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-product-tags">
                          Etiquetas / separadas por coma{" "}
                          <span className="text-blue-500 text-xs font-normal">(OPCIONAL)</span>
                        </Label>
                        <Input
                          id="new-product-tags"
                          name="tags"
                          value={newProductForm.tags?.join(", ") || ""}
                          onChange={handleNewProductChange}
                        />
                        {getZodErrorMessage(newProductErrors, "tags") && (
                          <p className="text-red-500 text-sm">{getZodErrorMessage(newProductErrors, "tags")}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-product-brand-id">
                          ID de Marca <span className="text-blue-500 text-xs font-normal">(OPCIONAL)</span>
                        </Label>
                        <Input
                          id="new-product-brand-id"
                          name="brand_id"
                          value={newProductForm.brand_id || ""}
                          onChange={handleNewProductChange}
                        />
                        {getZodErrorMessage(newProductErrors, "brand_id") && (
                          <p className="text-red-500 text-sm">{getZodErrorMessage(newProductErrors, "brand_id")}</p>
                        )}
                      </div>
                      <Button type="submit" disabled={loadingProducts}>
                        {loadingProducts ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Añadiendo...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Añadir Producto
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Carga Masiva de Productos */}
            <Card>
              <CardHeader>
                <CardTitle>Carga Masiva de Productos (CSV)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <p className="text-sm text-gray-600">
                    Sube un archivo CSV con tus productos. Asegúrate de que el formato sea correcto.
                  </p>
                  <div className="grid gap-2">
                    <Label htmlFor="bulk-upload-file">Archivo CSV</Label>
                    <Input
                      id="bulk-upload-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="file:text-sm file:font-semibold file:bg-green-500 file:text-white file:border-0 file:rounded-md file:py-2 file:px-4 file:mr-4 hover:file:bg-green-600"
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleProcessCSV}
                      disabled={!file || isProcessing || loadingCategories}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" /> Procesar CSV
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleUploadProducts}
                      disabled={productsToUpload.length === 0 || (uploadProgress > 0 && uploadProgress < 100)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="mr-2 h-4 w-4" /> Cargar Productos
                    </Button>
                  </div>

                  {uploadProgress > 0 && (
                    <div className="space-y-2">
                      <Label>Progreso de Carga</Label>
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-gray-600 text-center">{uploadProgress}% completado</p>
                    </div>
                  )}

                  {productsToUpload.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Estado de la Carga</h3>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Producto</TableHead>
                              <TableHead>SKU</TableHead>
                              <TableHead>Precio</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead>Mensaje</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {productsToUpload.map((product, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.sku}</TableCell>
                                <TableCell>S/ {product.price?.toFixed(2)}</TableCell>
                                <TableCell>
                                  {product.status === "pending" && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                      <Loader2 className="h-3 w-3 animate-spin" /> Pendiente
                                    </Badge>
                                  )}
                                  {product.status === "uploading" && (
                                    <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                                      <Loader2 className="h-3 w-3" /> Cargando...
                                    </Badge>
                                  )}
                                  {product.status === "success" && (
                                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" /> Éxito
                                    </Badge>
                                  )}
                                  {product.status === "error" && (
                                    <Badge variant="destructive" className="flex items-center gap-1">
                                      <XCircle className="h-3 w-3" /> Error
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                  {product.error || (product.status === "success" ? "Cargado" : "")}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sección para Crear Nueva Categoría */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Crear Nueva Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <p className="text-sm text-gray-600">
                  Añade una nueva categoría que estará disponible para tus productos.
                </p>
                <div className="grid gap-2">
                  <Label htmlFor="new-category-name">Nombre de la Categoría</Label>
                  <Input
                    id="new-category-name"
                    name="newCategoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ej: Farmaceutica, Riego, Herramientas"
                    required
                  />
                  {getZodErrorMessage(newCategoryErrors, "name") && (
                    <p className="text-red-500 text-sm">{getZodErrorMessage(newCategoryErrors, "name")}</p>
                  )}
                </div>
                <Button onClick={handleAddCategory} disabled={isCreatingCategory || newCategoryName.trim() === ""}>
                  {isCreatingCategory ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> Crear Categoría
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sección de Categorías Existentes */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Categorías Existentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingCategories ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-green-500" />
                          <p className="text-gray-700 mt-2">Cargando categorías...</p>
                        </TableCell>
                      </TableRow>
                    ) : categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-gray-600">
                          No hay categorías registradas.
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow key={category.id} className="border-b hover:bg-gray-50">
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.slug}</TableCell>
                          <TableCell>
                            <Badge variant={category.is_active ? "default" : "secondary"}>
                              {category.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 bg-transparent"
                              title="Eliminar categoría"
                              onClick={() => handleDeleteCategoryClick(category.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Sección de Productos Existentes */}
          <Card>
            <CardHeader>
              <CardTitle>Productos Existencia</CardTitle>
              <div className="relative flex-1 mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar productos por nombre, SKU o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Imagen</th>
                      <th className="text-left p-2">Producto</th>
                      <th className="text-left p-2">Categoría</th>
                      <th className="text-left p-2">Precio</th>
                      <th className="text-left p-2">Stock</th>
                      <th className="text-left p-2">Estado</th>
                      <th className="text-left p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingProducts ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-500" />
                          <p className="text-gray-700 mt-2">Cargando productos...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-600">
                          No hay productos registrados que coincidan con la búsqueda.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id} className="border-b hover:bg-gray-50">
                          <TableCell className="p-2">
                            {product.image_url ? (
                              <Image
                                src={product.image_url || "/placeholder.svg"}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="rounded-md object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs">
                                No Img
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="p-2">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                            </div>
                          </TableCell>
                          <TableCell className="p-2">{product.category_name}</TableCell>
                          <TableCell className="p-2 font-medium">S/ {product.price.toFixed(2)}</TableCell>
                          <TableCell className="p-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                product.stock > 10
                                  ? "bg-green-100 text-green-800"
                                  : product.stock > 0
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {product.stock} unidades
                            </span>
                          </TableCell>
                          <TableCell className="p-2">
                            <Badge variant={product.is_active !== false ? "default" : "secondary"}>
                              {product.is_active !== false ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                title="Ver detalles"
                                onClick={() => handleViewProductClick(product)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                title="Editar producto"
                                onClick={() => handleEditProductClick(product)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 bg-transparent"
                                title="Eliminar producto"
                                onClick={() => handleDeleteProductClick(product.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal para Editar Producto */}
      <Dialog open={isEditingProduct} onOpenChange={setIsEditingProduct}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdateProduct()
              }}
              className="grid gap-4 py-4"
            >
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editingProduct.name}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                  required
                />
                {getZodErrorMessage(editProductErrors, "name") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "name")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Descripción (Opcional)
                </Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={editingProduct.description || ""}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                />
                {getZodErrorMessage(editProductErrors, "description") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "description")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-short_description" className="text-right">
                  Descripción Corta (Opcional)
                </Label>
                <Input
                  id="edit-short_description"
                  name="short_description"
                  value={editingProduct.short_description || ""}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                />
                {getZodErrorMessage(editProductErrors, "short_description") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "short_description")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Precio
                </Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                  required
                />
                {getZodErrorMessage(editProductErrors, "price") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "price")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-original_price" className="text-right">
                  Precio Original (Opcional)
                </Label>
                <Input
                  id="edit-original_price"
                  name="original_price"
                  type="number"
                  step="0.01"
                  value={editingProduct.original_price || 0}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                />
                {getZodErrorMessage(editProductErrors, "original_price") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "original_price")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-sku" className="text-right">
                  SKU
                </Label>
                <Input
                  id="edit-sku"
                  name="sku"
                  value={editingProduct.sku}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                  required
                />
                {getZodErrorMessage(editProductErrors, "sku") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "sku")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-slug" className="text-right">
                  Slug (Opcional)
                </Label>
                <Input
                  id="edit-slug"
                  name="slug"
                  value={editingProduct.slug || ""}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                />
                {getZodErrorMessage(editProductErrors, "slug") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "slug")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-brand" className="text-right">
                  Marca (Opcional)
                </Label>
                <Input
                  id="edit-brand"
                  name="brand"
                  value={editingProduct.brand || ""}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                />
                {getZodErrorMessage(editProductErrors, "brand") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "brand")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  name="stock"
                  type="number"
                  value={editingProduct.stock}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                  required
                />
                {getZodErrorMessage(editProductErrors, "stock") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "stock")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-weight" className="text-right">
                  Peso (kg) (Opcional)
                </Label>
                <Input
                  id="edit-weight"
                  name="weight"
                  type="number"
                  step="0.01"
                  value={editingProduct.weight || 0}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                />
                {getZodErrorMessage(editProductErrors, "weight") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "weight")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-dimensions" className="text-right">
                  Dimensiones (JSON) (Opcional)
                </Label>
                <Input
                  id="edit-dimensions"
                  name="dimensions"
                  value={editingProduct.dimensions ? JSON.stringify(editingProduct.dimensions) : ""}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                  placeholder='{"width": 10, "height": 20, "depth": 5}'
                />
                {getZodErrorMessage(editProductErrors, "dimensions") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "dimensions")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-specifications" className="text-right">
                  Especificaciones (JSON) (Opcional)
                </Label>
                <Input
                  id="edit-specifications"
                  name="specifications"
                  value={editingProduct.specifications ? JSON.stringify(editingProduct.specifications) : ""}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                  placeholder='{"color": "red", "material": "wood"}'
                />
                {getZodErrorMessage(editProductErrors, "specifications") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "specifications")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category_id" className="text-right">
                  Categoría
                </Label>
                <Select
                  name="category_id"
                  value={editingProduct.category_id}
                  onValueChange={(value) =>
                    handleEditingProductChange({
                      target: { name: "category_id", value },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                >
                  <SelectTrigger id="edit-category_id" className="col-span-3">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getZodErrorMessage(editProductErrors, "category_id") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "category_id")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-image_url" className="text-right">
                  Añadir Imagen (Opcional)
                </Label>
                <ImageUploadInput
                  value={editingProduct.image_url ?? null}
                  onChange={handleEditingProductImageUpload}
                  uploadUrl="/api/admin/upload-product-image"
                  identifier={editingProduct.id}
                />
                {getZodErrorMessage(editProductErrors, "image_url") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "image_url")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-is_active" className="text-right">
                  Activo
                </Label>
                <Select
                  name="is_active"
                  value={editingProduct.is_active ? "true" : "false"}
                  onValueChange={(value) =>
                    handleEditingProductChange({
                      target: { name: "is_active", value },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                >
                  <SelectTrigger id="edit-is_active" className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sí</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-is_featured" className="text-right">
                  Destacado
                </Label>
                <Select
                  name="is_featured"
                  value={editingProduct.is_featured ? "true" : "false"}
                  onValueChange={(value) =>
                    handleEditingProductChange({
                      target: { name: "is_featured", value },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                >
                  <SelectTrigger id="edit-is_featured" className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sí</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-is_new" className="text-right">
                  Nuevo
                </Label>
                <Select
                  name="is_new"
                  value={editingProduct.is_new ? "true" : "false"}
                  onValueChange={(value) =>
                    handleEditingProductChange({
                      target: { name: "is_new", value },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                >
                  <SelectTrigger id="edit-is_new" className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sí</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-track_inventory" className="text-right">
                  Rastrear Inventario
                </Label>
                <Select
                  name="track_inventory"
                  value={editingProduct.track_inventory ? "true" : "false"}
                  onValueChange={(value) =>
                    handleEditingProductChange({
                      target: { name: "track_inventory", value },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                >
                  <SelectTrigger id="edit-track_inventory" className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sí</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-allow_backorder" className="text-right">
                  Permitir Pedidos Pendientes
                </Label>
                <Select
                  name="allow_backorder"
                  value={editingProduct.allow_backorder ? "true" : "false"}
                  onValueChange={(value) =>
                    handleEditingProductChange({
                      target: { name: "allow_backorder", value },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                >
                  <SelectTrigger id="edit-allow_backorder" className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sí</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-view_count" className="text-right">
                  Vistas (Opcional)
                </Label>
                <Input
                  id="edit-view_count"
                  name="view_count"
                  type="number"
                  value={editingProduct.view_count || 0}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                />
                {getZodErrorMessage(editProductErrors, "view_count") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "view_count")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-sales_count" className="text-right">
                  Ventas (Opcional)
                </Label>
                <Input
                  id="edit-sales_count"
                  name="sales_count"
                  type="number"
                  value={editingProduct.sales_count || 0}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                />
                {getZodErrorMessage(editProductErrors, "sales_count") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "sales_count")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-rating" className="text-right">
                  Calificación (Opcional)
                </Label>
                <Input
                  id="edit-rating"
                  name="rating"
                  type="number"
                  step="0.1"
                  value={editingProduct.rating || 0}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                />
                {getZodErrorMessage(editProductErrors, "rating") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "rating")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-meta_title" className="text-right">
                  Meta Título (Opcional)
                </Label>
                <Input
                  id="edit-meta_title"
                  name="meta_title"
                  value={editingProduct.meta_title || ""}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                />
                {getZodErrorMessage(editProductErrors, "meta_title") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "meta_title")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-meta_description" className="text-right">
                  Meta Descripción (Opcional)
                </Label>
                <Textarea
                  id="edit-meta_description"
                  name="meta_description"
                  value={editingProduct.meta_description || ""}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                />
                {getZodErrorMessage(editProductErrors, "meta_description") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "meta_description")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-tags" className="text-right">
                  Etiquetas (separadas por coma) (Opcional)
                </Label>
                <Input
                  id="edit-tags"
                  name="tags"
                  value={editingProduct.tags?.join(", ") || ""}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                />
                {getZodErrorMessage(editProductErrors, "tags") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "tags")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-brand_id" className="text-right">
                  ID de Marca (Opcional)
                </Label>
                <Input
                  id="edit-brand_id"
                  name="brand_id"
                  value={editingProduct.brand_id || ""}
                  onChange={handleEditingProductChange}
                  className="col-span-3"
                />
                {getZodErrorMessage(editProductErrors, "brand_id") && (
                  <p className="text-red-500 text-sm col-span-4 text-right">
                    {getZodErrorMessage(editProductErrors, "brand_id")}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loadingProducts}>
                  {loadingProducts ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para Ver Detalles del Producto */}
      <Dialog open={isViewingProduct} onOpenChange={setIsViewingProduct}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Producto</DialogTitle>
          </DialogHeader>
          {viewingProduct && (
            <div className="grid gap-4 py-4">
              <div className="flex justify-center mb-4">
                <Image
                  src={viewingProduct.image_url || "/placeholder.svg"}
                  alt={viewingProduct.name}
                  width={150}
                  height={150}
                  className="rounded-md object-cover"
                />
              </div>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold w-1/3">Nombre:</TableCell>
                    <TableCell className="w-2/3">{viewingProduct.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">SKU:</TableCell>
                    <TableCell>{viewingProduct.sku}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Precio:</TableCell>
                    <TableCell>S/ {viewingProduct.price.toFixed(2)}</TableCell>
                  </TableRow>
                  {viewingProduct.original_price && (
                    <TableRow>
                      <TableCell className="font-semibold">Precio Original:</TableCell>
                      <TableCell>S/ {viewingProduct.original_price.toFixed(2)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell className="font-semibold">Stock:</TableCell>
                    <TableCell>{viewingProduct.stock} unidades</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Categoría:</TableCell>
                    <TableCell>{viewingProduct.category_name || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Marca:</TableCell>
                    <TableCell>{viewingProduct.brand || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Activo:</TableCell>
                    <TableCell>{viewingProduct.is_active ? "Sí" : "No"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Destacado:</TableCell>
                    <TableCell>{viewingProduct.is_featured ? "Sí" : "No"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Nuevo:</TableCell>
                    <TableCell>{viewingProduct.is_new ? "Sí" : "No"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Rastrear Inventario:</TableCell>
                    <TableCell>{viewingProduct.track_inventory ? "Sí" : "No"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Permitir Pedidos Pendientes:</TableCell>
                    <TableCell>{viewingProduct.allow_backorder ? "Sí" : "No"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Vistas:</TableCell>
                    <TableCell>{viewingProduct.view_count}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Ventas:</TableCell>
                    <TableCell>{viewingProduct.sales_count}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Calificación:</TableCell>
                    <TableCell>{viewingProduct.rating}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Slug:</TableCell>
                    <TableCell>{viewingProduct.slug || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Peso (kg):</TableCell>
                    <TableCell>{viewingProduct.weight || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Dimensiones:</TableCell>
                    <TableCell>
                      {viewingProduct.dimensions ? JSON.stringify(viewingProduct.dimensions) : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Especificaciones:</TableCell>
                    <TableCell>
                      {viewingProduct.specifications ? JSON.stringify(viewingProduct.specifications) : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Meta Título:</TableCell>
                    <TableCell>{viewingProduct.meta_title || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Meta Descripción:</TableCell>
                    <TableCell>{viewingProduct.meta_description || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Etiquetas:</TableCell>
                    <TableCell>{viewingProduct.tags?.join(", ") || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">ID de Marca:</TableCell>
                    <TableCell>{viewingProduct.brand_id || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold" colSpan={2}>
                      Descripción Completa:
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm text-gray-700" colSpan={2}>
                      {viewingProduct.description || "N/A"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewingProduct(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación para Eliminar Producto */}
      <AlertDialog open={isDeletingProduct} onOpenChange={setIsDeletingProduct}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el producto de tu base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de Confirmación para Eliminar Categoría */}
      <AlertDialog open={isDeletingCategory} onOpenChange={setIsDeletingCategory}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la categoría de tu base de datos.
              Asegúrate de que ningún producto esté asociado a esta categoría antes de eliminarla.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
