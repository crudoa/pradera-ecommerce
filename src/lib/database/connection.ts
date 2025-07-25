// Consolidated generic database methods here.
import { supabase } from "@/lib/supabase/client"

export class DatabaseConnection {
  private client = supabase
  private static instance: DatabaseConnection

  constructor() {
    this.client = supabase
  }

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection()
    }
    return DatabaseConnection.instance
  }

  async query<T = any>(
    table: string,
    options?: {
      select?: string
      filter?: Record<string, any>
      limit?: number
      offset?: number
      orderBy?: { column: string; ascending?: boolean }
    },
  ): Promise<{ data: T[] | null; error: any }> {
    try {
      let query = (this.client as any).from(table).select(options?.select || "*")

      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true })
      }

      const { data, error } = await query

      return { data: data as T[] | null, error }
    } catch (error) {
      console.error("Database query error:", error)
      return { data: null, error }
    }
  }

  async insert<T = any>(table: string, data: any): Promise<{ data: T | null; error: any }> {
    try {
      const { data: result, error } = await (this.client as any).from(table).insert(data).select().single()

      return { data: result as T | null, error }
    } catch (error) {
      console.error("Database insert error:", error)
      return { data: null, error }
    }
  }

  async update<T = any>(
    table: string,
    data: any,
    filter: Record<string, any>,
  ): Promise<{ data: T | null; error: any }> {
    try {
      let query = (this.client as any).from(table).update(data)

      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value)
      })

      const { data: result, error } = await query.select().single()

      return { data: result as T | null, error }
    } catch (error) {
      console.error("Database update error:", error)
      return { data: null, error }
    }
  }

  async delete(table: string, filter: Record<string, any>): Promise<{ error: any }> {
    try {
      let query = (this.client as any).from(table).delete()

      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value)
      })

      const { error } = await query

      return { error }
    } catch (error) {
      console.error("Database delete error:", error)
      return { error }
    }
  }

  async findById<T = any>(table: string, id: string): Promise<{ data: T | null; error: any }> {
    try {
      const { data, error } = await (this.client as any).from(table).select("*").eq("id", id).single()

      return { data: data as T | null, error }
    } catch (error) {
      console.error("Database findById error:", error)
      return { data: null, error }
    }
  }

  async count(table: string, filter?: Record<string, any>): Promise<{ count: number | null; error: any }> {
    try {
      let query = (this.client as any).from(table).select("*", { count: "exact", head: true })

      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { count, error } = await query

      return { count, error }
    } catch (error) {
      console.error("Database count error:", error)
      return { count: null, error }
    }
  }

  async exists(table: string, filter: Record<string, any>): Promise<boolean> {
    try {
      const { count } = await this.count(table, filter)
      return (count || 0) > 0
    } catch (error) {
      console.error("Database exists error:", error)
      return false
    }
  }

  async transaction(operations: Array<() => Promise<any>>): Promise<{ success: boolean; error?: any }> {
    try {
      const results = await Promise.all(operations.map((op) => op()))
      return { success: true }
    } catch (error) {
      console.error("Database transaction error:", error)
      return { success: false, error }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const tableName = "user_profiles"
      const { error } = await (this.client as any).from(tableName).select("*").limit(0)

      if (error) {
        console.error("Database connection test failed:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Database connection test error:", error)
      return false
    }
  }
}

export const db = DatabaseConnection.getInstance()
export default db
