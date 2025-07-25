import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { AdminAuthService } from "@/lib/auth/admin-auth"
import { logger } from "@/lib/utils/logger"

export async function GET(request: Request) {
  const { isAdmin, error } = await AdminAuthService.isCurrentUserAdmin()

  if (!isAdmin) {
    logger.warn(`Unauthorized access attempt to /api/admin/orders/list: ${error}`)
    return NextResponse.json({ message: error || "Unauthorized" }, { status: 403 })
  }

  const supabase = createServiceRoleClient()
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const offset = (page - 1) * limit
  const status = searchParams.get("status")
  const searchTerm = searchParams.get("search")
  const fromDate = searchParams.get("from")
  const toDate = searchParams.get("to")

  try {
    let query = (await supabase)
      .from("orders")
      .select(
        `
        *,
        order_items (
          product_id,
          quantity,
          price,
          product_name
        ),
        user_profiles (
          full_name,
          email
        )
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (searchTerm) {
      query = query.ilike("order_number", `%${searchTerm}%`)
    }

    if (fromDate) {
      query = query.gte("created_at", fromDate)
    }

    if (toDate) {
      query = query.lte("created_at", toDate)
    }

    const { data: orders, error: dbError, count } = await query

    if (dbError) {
      logger.error("Error fetching orders:", dbError.message)
      return NextResponse.json({ message: "Error fetching orders", error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({
      orders,
      total: count,
      page,
      limit,
    })
  } catch (err: any) {
    logger.error("Unexpected error in GET /api/admin/orders/list:", err)
    return NextResponse.json({ message: "Internal server error", error: err.message }, { status: 500 })
  }
}
