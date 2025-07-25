import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, context: { params: Promise<{ type: string }> }) {
  try {
    const params = await context.params
    const { type } = params
    const supabase = await createClient()

    // Validate export type
    const validTypes = ["products", "orders", "users", "categories"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    let data: any[] = []
    let filename = ""

    switch (type) {
      case "products":
        const { data: products } = await supabase.from("products").select("*")
        data = products || []
        filename = "products_export.csv"
        break

      case "orders":
        const { data: orders } = await supabase.from("orders").select("*")
        data = orders || []
        filename = "orders_export.csv"
        break

      case "users":
        const { data: users } = await supabase.from("user_profiles").select("*")
        data = users || []
        filename = "users_export.csv"
        break

      case "categories":
        const { data: categories } = await supabase.from("categories").select("*")
        data = categories || []
        filename = "categories_export.csv"
        break
    }

    // Convert to CSV
    if (data.length === 0) {
      return NextResponse.json({ error: "No data found" }, { status: 404 })
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => JSON.stringify(row[header] || "")).join(",")),
    ].join("\n")

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
