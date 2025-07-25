"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number[]
  onValueChange: (values: number[]) => void
  max: number
  min: number
  step: number
  className?: string
  single?: boolean // New prop for single handle mode
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, onValueChange, max, min, step, single = false, ...props }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false)
    const [activeThumb, setActiveThumb] = React.useState<number | null>(null)
    const trackRef = React.useRef<HTMLDivElement>(null)

    const getPercentage = (val: number) => ((val - min) / (max - min)) * 100

    const handleMouseDown = (thumbIndex: number) => (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      setActiveThumb(thumbIndex)
    }

    const handleMouseMove = React.useCallback(
      (e: MouseEvent) => {
        if (!isDragging || activeThumb === null || !trackRef.current) return

        const rect = trackRef.current.getBoundingClientRect()
        const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
        const newValue = min + (percentage / 100) * (max - min)
        const steppedValue = Math.round(newValue / step) * step

        if (single) {
          // Single handle mode - only update the maximum value
          const newValues = [min, Math.max(min, Math.min(max, steppedValue))]
          onValueChange(newValues)
        } else {
          // Dual handle mode (original behavior)
          const newValues = [...value]
          newValues[activeThumb] = Math.max(min, Math.min(max, steppedValue))

          // Ensure min <= max
          if (activeThumb === 0 && newValues[0] > newValues[1]) {
            newValues[0] = newValues[1]
          } else if (activeThumb === 1 && newValues[1] < newValues[0]) {
            newValues[1] = newValues[0]
          }

          onValueChange(newValues)
        }
      },
      [isDragging, activeThumb, min, max, step, value, onValueChange, single],
    )

    const handleMouseUp = React.useCallback(() => {
      setIsDragging(false)
      setActiveThumb(null)
    }, [])

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
        return () => {
          document.removeEventListener("mousemove", handleMouseMove)
          document.removeEventListener("mouseup", handleMouseUp)
        }
      }
    }, [isDragging, handleMouseMove, handleMouseUp])

    const leftPercentage = single ? 0 : getPercentage(value[0])
    const rightPercentage = getPercentage(value[1])

    return (
      <div ref={ref} className={cn("relative flex w-full touch-none select-none items-center", className)} {...props}>
        <div
          ref={trackRef}
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary cursor-pointer"
        >
          <div
            className="absolute h-full bg-primary"
            style={{
              left: `${leftPercentage}%`,
              width: `${rightPercentage - leftPercentage}%`,
            }}
          />
        </div>

        {/* Left thumb - only show in dual mode */}
        {!single && (
          <div
            className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer hover:scale-110 transition-transform"
            style={{ left: `calc(${leftPercentage}% - 10px)` }}
            onMouseDown={handleMouseDown(0)}
          />
        )}

        {/* Right thumb - always show */}
        <div
          className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer hover:scale-110 transition-transform"
          style={{ left: `calc(${rightPercentage}% - 10px)` }}
          onMouseDown={handleMouseDown(single ? 0 : 1)}
        />
      </div>
    )
  },
)

Slider.displayName = "Slider"

export { Slider }
