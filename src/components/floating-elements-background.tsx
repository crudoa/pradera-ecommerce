"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"

const FloatingElementsBackground = () => {
  const [elements, setElements] = useState<
    Array<{
      id: number
      top: string
      left: string
      size: number
      delay: number
      duration: number
      randomX: number
    }>
  >([])

  useEffect(() => {
    const numElements = 40 
    const newElements = Array.from({ length: numElements }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}vh`, 
      left: `${Math.random() * 100}vw`, 
      size: 60 + Math.random() * 100,
      delay: Math.random() * 10, 
      duration: 15 + Math.random() * 15, 
      randomX: (Math.random() - 0.5) * 200, 
    }))
    setElements(newElements)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute floating-element opacity-100" 
          style={
            {
              top: el.top,
              left: el.left,
              width: `${el.size}px`,
              height: `${el.size}px`,
              animation: `float-down ${el.duration}s linear ${el.delay}s infinite`,
              "--random-x": `${el.randomX}px`, 
            } as React.CSSProperties
          } 
        >
          <Image
            src="/images/wheat-stalk-professional.png"
            alt="Floating wheat stalk"
            width={el.size}
            height={el.size}
            className="w-full h-full object-contain"
          />
        </div>
      ))}
    </div>
  )
}

export default FloatingElementsBackground
