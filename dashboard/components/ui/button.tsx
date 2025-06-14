"use client"

import type React from "react"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

    const variants = {
      primary:
        "bg-agb-gradient text-white shadow-md hover:bg-agb-gradient-hover hover:shadow-lg focus:ring-agb-primary transform hover:scale-105",
      secondary:
        "bg-agb-accent text-agb-primary border border-agb-light hover:bg-agb-light hover:text-white focus:ring-agb-primary",
      outline:
        "border border-agb-primary text-agb-primary hover:bg-agb-primary hover:text-white focus:ring-agb-primary",
      ghost: "text-agb-primary hover:bg-agb-accent focus:ring-agb-primary",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    }

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    }

    return <button className={cn(baseClasses, variants[variant], sizes[size], className)} ref={ref} {...props} />
  },
)

Button.displayName = "Button"

export { Button }
