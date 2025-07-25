import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { verifyAdmin } from "@/lib/auth/admin-auth"
import { orderFormSchema } from "@/lib/validations/forms"
import { logger } from "@/lib/utils/logger"

export async function POST(request: Request) {
  const supabase = await createServiceRoleClient()

  logger.info("Attempting to create order with Supabase service role client.")

  try {
    const { isAdmin, error: authError } = await verifyAdmin(supabase)
    if (authError) {
      logger.error("Admin verification failed:", authError.message)
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    if (!isAdmin) {
      logger.warn("Unauthorized attempt to create order.")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    logger.info("Received body for order creation:", body) // Log raw body

    // Validate the request body using the Zod schema
    const validatedData = orderFormSchema.parse(body)
    logger.info("Validated data:", validatedData) // Log validated data

    const { userId, shippingAddress, totalAmount, status, paymentMethod, itemsJson, buyerName, email, phone } =
      validatedData // Destructure email, buyerName, and phone

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        shipping_address: shippingAddress,
        total_amount: totalAmount,
        status: status,
        payment_method: paymentMethod,
        order_number: orderNumber,
        payment_status: "pending",
        customer_name: buyerName, // Map buyerName to customer_name
        email: email, // Add email
        phone: phone, // Add phone
      })
      .select()
      .single()

    if (orderError) {
      logger.error("Supabase order insertion error:", orderError)
      if (orderError.code === "42501") {
        logger.error(
          "RLS policy violation detected. Ensure SUPABASE_SERVICE_ROLE_KEY is correctly configured and your RLS policies allow service role bypass, or are configured to allow inserts for the service role. [^vercel_knowledge_base]",
        )
      }
      return NextResponse.json({ error: orderError.message, code: orderError.code }, { status: 500 })
    }

    const parsedItems = JSON.parse(itemsJson)
    const orderItemsToInsert = parsedItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_at_purchase: item.price,
      product_name: item.productName,
    }))

    const { error: orderItemsError } = await supabase.from("order_items").insert(orderItemsToInsert)

    if (orderItemsError) {
      logger.error("Supabase order items insertion error:", orderItemsError)
      await supabase.from("orders").delete().eq("id", order.id)
      return NextResponse.json({ error: orderItemsError.message }, { status: 500 })
    }

    logger.info(`Order created successfully: ${order.order_number}`)
    return NextResponse.json(
      {
        message: "Order created successfully",
        orderNumber: order.order_number,
        orderId: order.id,
        buyerName: order.customer_name, // Ensure these are returned from the DB response
        email: order.email,
        phone: order.phone, // Return phone
      },
      { status: 201 },
    )
  } catch (error: any) {
    logger.error("Order creation failed:", error)
    if (error.issues) {
      return NextResponse.json({ error: "Validation Error", issues: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const supabase = await createServiceRoleClient()

  try {
    const { isAdmin, error: authError } = await verifyAdmin(supabase)
    if (authError) {
      logger.error("Admin verification failed:", authError.message)
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    if (!isAdmin) {
      logger.warn("Unauthorized attempt to update order.")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const { data: updatedOrder, error } = await supabase.from("orders").update(updates).eq("id", id).select().single()

    if (error) {
      logger.error(`Error updating order ${id}:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    logger.info(`Order updated successfully: ${updatedOrder.id}`)
    return NextResponse.json({ message: "Order updated successfully", order: updatedOrder }, { status: 200 })
  } catch (error) {
    logger.error("Unhandled error in PUT /api/admin/orders:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const supabase = await createServiceRoleClient()

  try {
    const { isAdmin, error: authError } = await verifyAdmin(supabase)
    if (authError) {
      logger.error("Admin verification failed:", authError.message)
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    if (!isAdmin) {
      logger.warn("Unauthorized attempt to delete order.")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("orders").delete().eq("id", id)

    if (error) {
      logger.error(`Error deleting order ${id}:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    logger.info(`Order deleted successfully: ${id}`)
    return NextResponse.json({ message: `Order ${id} deleted successfully` }, { status: 200 })
  } catch (error) {
    logger.error("Unhandled error in DELETE /api/admin/orders:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
