"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ButtonProps } from "@/components/ui/button"

interface MobileOptimizedButtonProps extends ButtonProps {
  touchOptimized?: boolean
}

export function MobileOptimizedButton({
  children,
  className,
  touchOptimized = true,
  ...props
}: MobileOptimizedButtonProps) {
  return (
    <Button
      className={cn(
        touchOptimized && "min-h-[48px] px-6 py-3 text-base font-medium",
        "touch-manipulation select-none",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
