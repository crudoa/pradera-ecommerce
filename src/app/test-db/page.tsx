"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function TestDatabase() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setResults([])

    try {
      console.log("🔌 Testing Supabase connection...")

      // Test 1: Basic connection
      const { data: basicTest, error: basicError } = await supabase
        .from("products")
        .select("count", { count: "exact", head: true })

      if (basicError) {
        throw new Error(`Connection failed: ${basicError.message}`)
      }

      setResults((prev) => [...prev, { test: "Connection", status: "✅ Success", data: `Found ${basicTest} products` }])

      // Test 2: Get actual products
      const { data: products, error: productsError } = await supabase.from("products").select("*").limit(5)

      if (productsError) {
        throw new Error(`Products query failed: ${productsError.message}`)
      }

      setResults((prev) => [
        ...prev,
        {
          test: "Products Query",
          status: "✅ Success",
          data: `Retrieved ${products?.length || 0} products`,
          details: products,
        },
      ])

      // Test 3: Get categories
      const { data: categories, error: categoriesError } = await supabase.from("categories").select("*").limit(5)

      if (categoriesError) {
        setResults((prev) => [
          ...prev,
          {
            test: "Categories Query",
            status: "⚠️ Warning",
            data: `Categories failed: ${categoriesError.message}`,
          },
        ])
      } else {
        setResults((prev) => [
          ...prev,
          {
            test: "Categories Query",
            status: "✅ Success",
            data: `Retrieved ${categories?.length || 0} categories`,
            details: categories,
          },
        ])
      }

      // Test 4: Environment variables
      const envTest = {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30) + "...",
      }

      setResults((prev) => [
        ...prev,
        {
          test: "Environment Variables",
          status: envTest.hasUrl && envTest.hasKey ? "✅ Success" : "❌ Failed",
          data: `URL: ${envTest.hasUrl ? "Set" : "Missing"}, Key: ${envTest.hasKey ? "Set" : "Missing"}`,
          details: envTest,
        },
      ])
    } catch (err: any) {
      setError(err.message)
      setResults((prev) => [...prev, { test: "Error", status: "❌ Failed", data: err.message }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>

        <div className="mb-6">
          <Button onClick={testConnection} disabled={loading}>
            {loading ? "Testing..." : "Run Test Again"}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{result.test}</h3>
                <span className="text-sm">{result.status}</span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{result.data}</p>
              {result.details && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600">Show Details</summary>
                  <pre className="mt-2 bg-gray-50 p-2 rounded overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">Next Steps:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>1. Verify your Supabase environment variables are set correctly</li>
            <li>2. Check that your products table exists and has data</li>
            <li>3. Ensure RLS (Row Level Security) policies allow public read access</li>
            <li>4. Verify your Supabase project is active and not paused</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
