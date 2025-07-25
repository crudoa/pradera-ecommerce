"use client"

import { CardDescription } from "@/components/ui/card"

import { useMemo } from "react"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/lib/hooks/use-toast"
import { orderFormSchema, type orderItemSchema } from "@/lib/validations/forms"
import type { Product } from "@/types/product"
import type { OrderDetails } from "@/types/order" // Import OrderDetails and OrderItem
import { X, PlusCircle, RefreshCw } from "lucide-react" // Ensure PlusCircle, ChevronDown, ChevronUp are imported, added RefreshCw
import { Separator } from "@/components/ui/separator" // Import Separator
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { v4 as uuidv4 } from "uuid" // Import uuid for unique IDs

// Define the type for a selected order item in the form
type SelectedOrderItem = z.infer<typeof orderItemSchema> & {
  tempId: string // Used for unique key in UI before actual product ID is set
}

// Hardcoded Peruvian payment methods
const PAYMENT_METHOD_OPTIONS = [
  { value: "tarjeta_credito_debito", label: "Tarjeta de Crédito/Débito" },
  { value: "yape", label: "Yape" },
  { value: "plin", label: "Plin" },
  { value: "pagoefectivo", label: "PagoEfectivo" },
  { value: "transferencia_bancaria", label: "Transferencia Bancaria" },
  { value: "culqi_qr", label: "Culqi QR" },
  { value: "niubiz_link", label: "Niubiz Link" },
  { value: "kasnet", label: "Kasnet" },
  { value: "bcp_deposito", label: "Depósito BCP" },
  { value: "interbank_deposito", label: "Depósito Interbank" },
  { value: "bbva_deposito", label: "Depósito BBVA" },
]

// Order status options
const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "processing", label: "Procesando" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
]

interface NewOrder {
  userId: string
  status: string
  paymentMethod: string
  shippingAddress: string
  buyerName?: string // Optional field for buyer's full name
  email?: string // Add email field
  phone?: string // Add phone field
}

// Helper function to format shipping address
const formatShippingAddress = (address: any) => {
  if (!address) return "N/A"
  if (typeof address === "string") {
    try {
      const parsedAddress = JSON.parse(address)
      if (typeof parsedAddress === "object" && parsedAddress !== null) {
        // Assuming address object has properties like street, city, etc.
        const parts = []
        if (parsedAddress.street) parts.push(parsedAddress.street)
        if (parsedAddress.city) parts.push(parsedAddress.city)
        if (parsedAddress.state) parts.push(parsedAddress.state)
        if (parsedAddress.zipCode) parts.push(parsedAddress.zipCode)
        if (parts.length > 0) return parts.join(", ")
      }
    } catch (e) {
      // Not a JSON string, treat as plain string
      return address
    }
  }
  // If it's already an object (e.g., JSONB from Supabase)
  if (typeof address === "object" && address !== null) {
    const parts = []
    if (address.street) parts.push(address.street)
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    if (address.zipCode) parts.push(address.zipCode)
    if (parts.length > 0) return parts.join(", ")
    // Fallback if no specific address parts are found
    return JSON.stringify(address)
  }
  return String(address) // Fallback for any other type
}

export default function AdminOrdersPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [selectedOrderItems, setSelectedOrderItems] = useState<SelectedOrderItem[]>([
    { tempId: uuidv4(), productId: "", quantity: 1, price: 0, productName: "" },
  ])
  const [newOrder, setNewOrder] = useState<NewOrder>({
    userId: "",
    status: "pending",
    paymentMethod: "tarjeta_credito_debito", // Default value
    shippingAddress: "",
    buyerName: "", // Initialize buyerName
    email: "", // Initialize email
    phone: "", // Initialize phone
  })
  const [existingOrders, setExistingOrders] = useState<OrderDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAllOrders, setShowAllOrders] = useState(false) // State for toggling all orders

  const totalAmountDisplay = useMemo(() => {
    const sum = selectedOrderItems.reduce((acc, item) => {
      return acc + item.quantity * item.price
    }, 0)
    return sum.toFixed(2)
  }, [selectedOrderItems])

  // Log current newOrder state and totalAmountDisplay for debugging
  console.log("Current newOrder state:", newOrder)
  console.log("Calculated totalAmountDisplay:", totalAmountDisplay)

  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      userId: "",
      shippingAddress: "",
      totalAmount: 0,
      status: "pending",
      paymentMethod: "tarjeta_credito_debito", // Ensure this matches initial newOrder state
      itemsJson: "[]",
      buyerName: "",
      email: "", // Add email to defaultValues
    },
  })

  // Fetch products for the dropdown
  useEffect(() => {
    async function fetchProducts() {
      setLoadingProducts(true)
      try {
        const response = await fetch("/api/admin/products")
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
          throw new Error(`Failed to fetch products: ${errorData.message || response.statusText}`)
        }
        const data = await response.json()
        setProducts(data)
      } catch (error: any) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: error.message || "No se pudieron cargar los productos.",
          variant: "destructive",
        })
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [toast])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const url = `/api/admin/orders/list${showAllOrders ? "?all=true" : ""}` // Conditionally add 'all=true'
      const response = await fetch(url)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch orders")
      }
      const data = await response.json()
      // Correctly access the 'orders' array from the response
      setExistingOrders(data.orders || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to load orders: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast, showAllOrders]) // Re-run when showAllOrders changes

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setNewOrder((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId)
    setSelectedOrderItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index
          ? {
              ...item,
              productId: productId,
              price: product ? product.price : 0,
              productName: product ? product.name : "",
            }
          : item,
      ),
    )
  }

  const handleQuantityChange = (index: number, quantity: string) => {
    setSelectedOrderItems((prevItems) =>
      prevItems.map((item, i) => (i === index ? { ...item, quantity: Number.parseInt(quantity) || 0 } : item)),
    )
  }

  const handlePriceChange = (index: number, price: string) => {
    setSelectedOrderItems((prevItems) =>
      prevItems.map((item, i) => (i === index ? { ...item, price: Number.parseFloat(price) || 0 } : item)),
    )
  }

  const addOrderItem = () => {
    setSelectedOrderItems((prevItems) => [
      ...prevItems,
      { tempId: uuidv4(), productId: "", quantity: 1, price: 0, productName: "" },
    ])
  }

  const removeOrderItem = (tempId: string) => {
    setSelectedOrderItems((prevItems) => prevItems.filter((item) => item.tempId !== tempId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const orderToSubmit = {
        ...newOrder,
        totalAmount: Number.parseFloat(totalAmountDisplay), // Use the calculated total amount
        orderNumber: uuidv4(), // Generate a unique order number
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentStatus: "pending",
        itemsJson: JSON.stringify(selectedOrderItems.filter((item) => item.productId !== "")),
      }

      // Log the orderToSubmit object right before the fetch call
      console.log("Order to submit:", orderToSubmit)

      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderToSubmit),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create order")
      }

      const createdOrder: OrderDetails = await response.json()

      // Add the new order to the existing orders state, including buyerName and email from client
      setExistingOrders((prevOrders) => [
        {
          ...createdOrder,
          buyerName: newOrder.buyerName || createdOrder.buyer_name, // Use client-side buyerName if available, fallback to DB
          email: newOrder.email || createdOrder.email, // Use client-side email if available, fallback to DB
          phone: newOrder.phone || createdOrder.phone, // Use client-side phone if available, fallback to DB
        },
        ...prevOrders,
      ])

      toast({
        title: "Success",
        description: "Order created successfully!",
      })
      setNewOrder({
        userId: "",
        status: "pending",
        paymentMethod: "tarjeta_credito_debito", // Reset to default
        shippingAddress: "",
        buyerName: "", // Reset buyerName
        email: "", // Reset email
        phone: "", // Reset phone
      })
      setSelectedOrderItems([{ tempId: uuidv4(), productId: "", quantity: 1, price: 0, productName: "" }])
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create order: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    form.setValue("totalAmount", Number.parseFloat(totalAmountDisplay))
    form.setValue("itemsJson", JSON.stringify(selectedOrderItems.filter((item) => item.productId !== "")))
  }, [totalAmountDisplay, selectedOrderItems, form])

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">Órdenes Existentes</CardTitle>
            <CardDescription>Lista de todas las órdenes registradas en el sistema.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrders} className="ml-auto bg-transparent">
            <RefreshCw className="mr-2 h-4 w-4" /> Recargar
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Cargando órdenes...</p>
          ) : existingOrders.length === 0 ? (
            <p>No hay órdenes para mostrar.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID de Orden</TableHead>
                    <TableHead>ID de Usuario</TableHead>
                    <TableHead>Nombre Comprador</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Monto Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Método de Pago</TableHead>
                    <TableHead>Dirección de Envío</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {existingOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number || order.id}</TableCell>
                      <TableCell>{order.user_id}</TableCell>
                      <TableCell>{order.customer_name || order.buyerName || "N/A"}</TableCell>
                      <TableCell>{order.email || "N/A"}</TableCell>

                      <TableCell>S/. {Number(order.total_amount).toFixed(2)}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{order.payment_method}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {formatShippingAddress(order.shipping_address)}
                      </TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
