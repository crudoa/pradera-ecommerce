"use client"

import { useState, useCallback } from "react"

interface UseAsyncResult<T> {
  execute: (promiseFn: () => Promise<T>, context?: string) => Promise<T | undefined>
  loading: boolean
  error: Error | null
  data: T | null
}

export function useSafeAsync<T = any>(): UseAsyncResult<T> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (promiseFn: () => Promise<T>, context?: string) => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const result = await promiseFn()
      setData(result)
      return result
    } catch (err: any) {
      console.error(`Error in async operation (${context || "unknown"}):`, err)
      setError(err)
      return undefined
    } finally {
      setLoading(false)
    }
  }, [])

  return { execute, loading, error, data }
}
