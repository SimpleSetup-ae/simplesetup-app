"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface BackgroundProps {
  className?: string
  dotSize?: string
  dotColor?: string
  maskColor?: string
}

export function Background({
  className,
  dotSize = "1px",
  dotColor = "rgba(18, 113, 255, 0.15)",
  maskColor = "rgba(255, 255, 255, 0.1)"
}: BackgroundProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full opacity-20",
        className
      )}
      style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, ${dotColor} ${dotSize}, transparent 0)`,
        backgroundSize: "40px 40px",
        maskImage: `radial-gradient(ellipse at center, ${maskColor}, transparent 70%)`,
        WebkitMaskImage: `radial-gradient(ellipse at center, ${maskColor}, transparent 70%)`
      }}
    />
  )
}
