"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileFormFieldProps {
  label: string
  name: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  error?: string
  icon?: React.ReactNode
  autoComplete?: string
  inputMode?: "text" | "email" | "tel" | "numeric" | "decimal" | "search" | "url"
}

export function MobileFormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
  error,
  icon,
  autoComplete,
  inputMode,
}: MobileFormFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const actualType = type === "password" ? (showPassword ? "text" : "password") : type

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <Label htmlFor={name} className="text-base font-medium text-gray-700">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </Label>
      </div>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
            {icon}
          </div>
        )}
        <Input
          id={name}
          name={name}
          type={actualType}
          value={value}
          onChange={onChange}
          className={cn(
            "min-h-[48px] text-base px-4 py-3",
            icon ? "pl-12" : "",
            error ? "border-[#EF4444] focus:border-[#EF4444]" : "",
            "touch-manipulation",
          )}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 touch-manipulation min-w-[48px] min-h-[48px]"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      {error && <p className="text-[#EF4444] text-sm mt-2">{error}</p>}
    </div>
  )
}
