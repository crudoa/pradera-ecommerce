import { NextResponse } from "next/server"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class RateLimiter {
  private store: RateLimitStore = {}
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  incrementAttempts(identifier: string): void {
    const now = Date.now()
    const record = this.store[identifier]
    if (!record || now > record.resetTime) {
      this.store[identifier] = {
        count: 1,
        resetTime: now + this.windowMs,
      }
    } else {
      record.count++
    }
  }

  clearAttempts(identifier: string): void {
    delete this.store[identifier]
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const record = this.store[identifier]

    if (!record || now > record.resetTime) {
      this.store[identifier] = {
        count: 1,
        resetTime: now + this.windowMs,
      }
      return false
    }

    if (record.count >= this.maxRequests) {
      return true
    }

    record.count++
    return false
  }

  getRemainingRequests(identifier: string): number {
    const record = this.store[identifier]
    if (!record || Date.now() > record.resetTime) {
      return this.maxRequests
    }
    return Math.max(0, this.maxRequests - record.count)
  }

  getResetTime(identifier: string): number {
    const record = this.store[identifier]
    if (!record || Date.now() > record.resetTime) {
      return Date.now() + this.windowMs
    }
    return record.resetTime
  }

  cleanup(): void {
    const now = Date.now()
    Object.keys(this.store).forEach((key) => {
      if (now > this.store[key].resetTime) {
        delete this.store[key]
      }
    })
  }
}

// Global rate limiter instances
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5) // 5 requests per 15 minutes
export const apiRateLimiter = new RateLimiter(60 * 1000, 60) // 60 requests per minute
export const generalRateLimiter = new RateLimiter(15 * 60 * 1000, 100) // 100 requests per 15 minutes

export async function getClientIP(reqHeaders: Headers): Promise<string> {
  // Made async and return type Promise<string>
  // Changed type to Headers
  const forwarded = await reqHeaders.get("x-forwarded-for") // Await the get call
  const realIP = await reqHeaders.get("x-real-ip") // Await the get call

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return "unknown"
}

export function createRateLimitResponse(identifier: string, rateLimiter: RateLimiter): NextResponse {
  // Changed return type to NextResponse
  return NextResponse.json(
    // Used NextResponse.json
    {
      error: "Too many requests",
      retryAfter: Math.ceil((rateLimiter.getResetTime(identifier) - Date.now()) / 1000),
    },
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": Math.ceil((rateLimiter.getResetTime(identifier) - Date.now()) / 1000).toString(),
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": rateLimiter.getRemainingRequests(identifier).toString(),
        "X-RateLimit-Reset": rateLimiter.getResetTime(identifier).toString(),
      },
    },
  )
}
