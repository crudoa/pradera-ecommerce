"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePerformance } from "@/lib/hooks/use-performance"
import { Activity, Clock, Cpu, Wifi } from "lucide-react"

export function PerformanceMonitor() {
  const metrics = usePerformance()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Solo mostrar en desarrollo
    setIsVisible(process.env.NODE_ENV === "development")
  }, [])

  if (!isVisible || !metrics) return null

  const getPerformanceColor = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return "bg-green-500"
    if (value < thresholds[1]) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Load Time</span>
            </div>
            <Badge className={getPerformanceColor(metrics.loadTime, [1000, 3000])}>
              {metrics.loadTime.toFixed(0)}ms
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Render Time</span>
            </div>
            <Badge className={getPerformanceColor(metrics.renderTime, [500, 1500])}>
              {metrics.renderTime.toFixed(0)}ms
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Memory</span>
            </div>
            <Badge className={getPerformanceColor(metrics.memoryUsage, [50, 100])}>
              {metrics.memoryUsage.toFixed(1)}MB
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-sm">Network</span>
            </div>
            <Badge className={getPerformanceColor(metrics.networkLatency, [200, 500])}>
              {metrics.networkLatency.toFixed(0)}ms
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
