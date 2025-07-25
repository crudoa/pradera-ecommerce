// Kept this one, deleting src/lib/security/rate-limiter.ts
import { cacheManager } from "@/lib/cache/cache-manager" // Using the consolidated cache manager

interface RateLimitResult {
  allowed: boolean
  remainingAttempts: number
  resetTime?: number // Unix timestamp in ms
}

export class RateLimiter {
  private static readonly MAX_ATTEMPTS = 5
  private static readonly LOCKOUT_DURATION_MS = 5 * 60 * 1000 // 5 minutes

  private static getKey(identifier: string): string {
    return `rate_limit:${identifier}`
  }

  /**
   * Checks if a login attempt is allowed and updates the rate limit state.
   * @param identifier User email or IP address.
   * @param ipAddress User's IP address (for logging).
   * @param userAgent User's User-Agent string (for logging).
   * @returns RateLimitResult indicating if the attempt is allowed, remaining attempts, and reset time if locked.
   */
  static async checkLoginAttempt(identifier: string, ipAddress: string, userAgent: string): Promise<RateLimitResult> {
    const key = this.getKey(identifier)
    const { data: storedData } = await cacheManager.get<{ attempts: number; lockoutUntil: number }>(key)

    let attempts = storedData?.attempts || 0
    let lockoutUntil = storedData?.lockoutUntil || 0
    const now = Date.now()

    if (lockoutUntil > now) {
      // Still locked out
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: lockoutUntil,
      }
    }

    // If lockout period has passed, reset attempts
    if (attempts >= this.MAX_ATTEMPTS && lockoutUntil <= now) {
      attempts = 0
      lockoutUntil = 0
    }

    return {
      allowed: true,
      remainingAttempts: this.MAX_ATTEMPTS - attempts,
      resetTime: 0,
    }
  }

  /**
   * Records a failed login attempt and updates the rate limit state.
   * @param identifier User email or IP address.
   * @param ipAddress User's IP address (for logging).
   * @param userAgent User's User-Agent string (for logging).
   */
  static async recordFailedAttempt(identifier: string, ipAddress: string, userAgent: string): Promise<void> {
    const key = this.getKey(identifier)
    const { data: storedData } = await cacheManager.get<{ attempts: number; lockoutUntil: number }>(key)

    let attempts = storedData?.attempts || 0
    let lockoutUntil = storedData?.lockoutUntil || 0
    const now = Date.now()

    if (lockoutUntil > now) {
      // Still locked out, no change to attempts
      return
    }

    attempts++

    if (attempts >= this.MAX_ATTEMPTS) {
      lockoutUntil = now + this.LOCKOUT_DURATION_MS
      console.warn(`🔒 Rate limit exceeded for ${identifier}. Locked until ${new Date(lockoutUntil).toISOString()}`)
    }

    await cacheManager.set(key, { attempts, lockoutUntil }, this.LOCKOUT_DURATION_MS / 1000 + 60) // TTL slightly longer than lockout
  }

  /**
   * Resets the rate limit for a given identifier (e.g., after a successful login).
   * @param identifier User email or IP address.
   */
  static async resetAttempts(identifier: string): Promise<void> {
    const key = this.getKey(identifier)
    await cacheManager.delete(key)
    console.log(`🔓 Rate limit reset for ${identifier}`)
  }
}
