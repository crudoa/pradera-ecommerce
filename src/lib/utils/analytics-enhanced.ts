"use client"

interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: number
  userId?: string
  sessionId?: string
}

interface UserBehavior {
  pageViews: number
  timeOnSite: number
  clickEvents: number
  scrollDepth: number
  bounceRate: number
}

declare global {
  interface Window {
    gtag: (command: "config" | "event" | "js" | "set", targetId: string | Date, config?: Record<string, any>) => void
  }
}

class AnalyticsManager {
  private events: AnalyticsEvent[] = []
  private sessionId: string
  private startTime: number
  private behavior: UserBehavior
  private isEnabled = process.env.NODE_ENV === "production" // Use NODE_ENV for production check

  constructor() {
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
    this.behavior = {
      pageViews: 0,
      timeOnSite: 0,
      clickEvents: 0,
      scrollDepth: 0,
      bounceRate: 0,
    }

    this.initializeTracking()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeTracking() {
    if (typeof window === "undefined") return

    // Tracking de scroll
    let maxScroll = 0
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100,
      )
      maxScroll = Math.max(maxScroll, scrollPercent)
      this.behavior.scrollDepth = maxScroll
    }

    // Tracking de clicks
    const handleClick = (event: MouseEvent) => {
      this.behavior.clickEvents++
      this.track("click", {
        element: (event.target as HTMLElement)?.tagName,
        x: event.clientX,
        y: event.clientY,
      })
    }

    // Tracking de tiempo en sitio
    const updateTimeOnSite = () => {
      this.behavior.timeOnSite = Date.now() - this.startTime
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("click", handleClick)
    setInterval(updateTimeOnSite, 1000)

    // Cleanup al salir
    window.addEventListener("beforeunload", () => {
      this.track("session_end", {
        duration: this.behavior.timeOnSite,
        pageViews: this.behavior.pageViews,
        scrollDepth: this.behavior.scrollDepth,
      })
      this.flush()
    })
  }

  track(eventName: string, properties?: Record<string, any>, userId?: string) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        url: typeof window !== "undefined" ? window.location.href : "N/A",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: userId,
    }

    this.events.push(event)

    // Send to Google Analytics 4
    if (this.isEnabled && typeof window !== "undefined" && window.gtag) {
      // Map properties to GA4 recommended event parameters
      const ga4Properties: Record<string, any> = {
        ...event.properties,
        user_id: event.userId,
        session_id: this.sessionId,
      }

      // Specific mapping for e-commerce events to GA4 standards
      if (eventName === "view_item" && properties) {
        ga4Properties.items = [
          {
            item_id: properties.item_id,
            item_name: properties.item_name,
            item_category: properties.item_category,
            price: properties.price, // Add price if available for view_item
          },
        ]
        delete ga4Properties.item_id
        delete ga4Properties.item_name
        delete ga4Properties.item_category
        delete ga4Properties.price
      } else if (eventName === "add_to_cart" && properties) {
        ga4Properties.items = [
          {
            item_id: properties.item_id,
            item_name: properties.item_name,
            price: properties.price,
            quantity: properties.quantity,
          },
        ]
        ga4Properties.value = properties.value // Total value of items added
        delete ga4Properties.item_id
        delete ga4Properties.item_name
        delete ga4Properties.price
        delete ga4Properties.quantity
      } else if (eventName === "purchase" && properties) {
        ga4Properties.transaction_id = properties.transaction_id
        ga4Properties.value = properties.value
        ga4Properties.currency = properties.currency || "PEN"
        ga4Properties.items = properties.items
        delete ga4Properties.orderId // Remove old property name
      } else if (eventName === "search" && properties) {
        ga4Properties.search_term = properties.search_term
        delete ga4Properties.query // Remove old property name
      }

      window.gtag("event", event.name, ga4Properties)
    }

    // Auto-flush cada 10 eventos o cada 30 segundos
    if (this.events.length >= 10) {
      this.flush()
    }

    if (process.env.NODE_ENV === "development") {
      console.log("📊 Analytics Event:", event)
    }
  }

  // Enhanced tracking methods with GA4-friendly properties
  trackPageView(page: string, userId?: string) {
    this.behavior.pageViews++
    this.track(
      "page_view",
      {
        page_location: typeof window !== "undefined" ? window.location.href : "N/A", // GA4 recommended
        page_path: page, // GA4 recommended
        page_referrer: typeof document !== "undefined" ? document.referrer : "N/A", // GA4 recommended
      },
      userId,
    )
  }

  trackPurchase(orderId: string, total: number, items: any[], userId?: string) {
    this.track(
      "purchase",
      {
        transaction_id: orderId, // GA4 recommended
        value: total,
        currency: "PEN",
        items: items.map((item) => ({
          // Map items to GA4 format
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
          item_category: item.category, // Assuming item has a category
        })),
      },
      userId,
    )
  }

  trackProductView(productId: string, productName: string, category: string, price?: number, userId?: string) {
    this.track(
      "view_item", // GA4 recommended event name
      {
        items: [
          {
            // GA4 expects items array
            item_id: productId,
            item_name: productName,
            item_category: category,
            price: price,
          },
        ],
      },
      userId,
    )
  }

  trackAddToCart(productId: string, productName: string, price: number, quantity: number, userId?: string) {
    this.track(
      "add_to_cart", // GA4 recommended event name
      {
        items: [
          {
            // GA4 expects items array
            item_id: productId,
            item_name: productName,
            price: price,
            quantity: quantity,
          },
        ],
        value: price * quantity, // Total value of items added
        currency: "PEN", // Assuming PEN as default currency
      },
      userId,
    )
  }

  trackSearch(searchTerm: string, resultsCount: number, userId?: string) {
    this.track(
      "search",
      {
        search_term: searchTerm, // GA4 recommended
        results_count: resultsCount,
      },
      userId,
    )
  }

  private async flush() {
    if (this.events.length === 0) return

    try {
      // In production, send to your analytics service
      if (this.isEnabled) {
        await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            events: this.events,
            behavior: this.behavior,
          }),
        })
      }

      this.events = []
    } catch (error) {
      console.error("Error enviando analytics:", error)
    }
  }

  getBehaviorMetrics(): UserBehavior {
    return { ...this.behavior }
  }
}

export const analytics = new AnalyticsManager()

export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackPurchase: analytics.trackPurchase.bind(analytics),
    trackProductView: analytics.trackProductView.bind(analytics),
    trackAddToCart: analytics.trackAddToCart.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    getBehaviorMetrics: analytics.getBehaviorMetrics.bind(analytics),
  }
}
