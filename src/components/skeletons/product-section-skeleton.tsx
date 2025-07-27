"use client"

import { Skeleton } from "@/components/ui/skeleton"

interface ProductSectionSkeletonProps {
  title: string
}

export function ProductSectionSkeleton({ title }: ProductSectionSkeletonProps) {
  return (
    <section className="py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-6 md:mb-8">
          <Skeleton className="h-8 w-64" />
        </div>

        {/* Adjusted grid for 3 columns on mobile */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
              {" "}
              {/* Reduced padding to match product-card */}
              <Skeleton className="aspect-square w-full mb-2 rounded-lg h-40 sm:h-48" />{" "}
              {/* Adjusted height to match product-card */}
              <Skeleton className="h-3 w-3/4 mb-1" /> {/* Smaller text skeleton */}
              <Skeleton className="h-3 w-1/2 mb-1" /> {/* Smaller text skeleton */}
              <Skeleton className="h-5 w-1/3" /> {/* Smaller price skeleton */}
              <Skeleton className="h-8 w-full mt-2" /> {/* Smaller button skeleton */}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
