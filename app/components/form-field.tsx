"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

interface FormFieldProps {
  label: string
  name: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  error?: string
  icon?: React.ReactNode
}

export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
  error,
  icon,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const actualType = type === "password" ? (showPassword ? "text" : "password") : type

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <Label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </Label>
      </div>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            {icon}
          </div>
        )}
        <Input
          id={name}
          name={name}
          type={actualType}
          value={value}
          onChange={onChange}
          className={`${icon ? "pl-10" : ""} ${error ? "border-[#EF4444]" : ""}`}
          placeholder={placeholder}
          required={required}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-[#EF4444] text-sm mt-1">{error}</p>}
    </div>
  )
}

interface SelectFieldProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: Array<{ value: string; label: string } | string>
  required?: boolean
  error?: string
  placeholder?: string
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = true,
  error,
  placeholder = "Sélectionnez une option",
}: SelectFieldProps) {
  return (
    <div className="mb-4">
      <Label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-[#EF4444]">*</span>}
      </Label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-md border ${
          error ? "border-[#EF4444]" : "border-gray-300"
        } bg-white py-2 px-3 shadow-sm focus:border-[#003087] focus:outline-none focus:ring-1 focus:ring-[#003087]`}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => {
          const optionValue = typeof option === "string" ? option : option.value
          const optionLabel = typeof option === "string" ? option : option.label
          return (
            <option key={index} value={optionValue}>
              {optionLabel}
            </option>
          )
        })}
      </select>
      {error && <p className="text-[#EF4444] text-sm mt-1">{error}</p>}
    </div>
  )
}

interface OtpInputProps {
  value: string[]
  onChange: (index: number, value: string) => void
  error?: string
}

export function OtpInput({ value, onChange, error }: OtpInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value

    // Accepter seulement les chiffres
    if (/^\d*$/.test(val) && val.length <= 1) {
      onChange(index, val)

      // Auto-focus sur le champ suivant si un chiffre est entré
      if (val && index < 5) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus()
        }, 10)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Retour arrière : focus sur le champ précédent
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus()
        }, 10)
      } else {
        onChange(index, "")
      }
    }

    // Flèches gauche/droite pour navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    if (/^\d+$/.test(pastedData) && pastedData.length <= 6) {
      const digits = pastedData.split("").slice(0, 6)
      digits.forEach((digit, index) => {
        if (index < 6) {
          onChange(index, digit)
        }
      })

      // Focus sur le dernier champ rempli ou le suivant
      const nextIndex = Math.min(digits.length, 5)
      setTimeout(() => {
        inputRefs.current[nextIndex]?.focus()
      }, 10)
    }
  }

  return (
    <div className="mb-4">
      <div className="flex justify-center gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg transition-all ${
              error ? "border-[#EF4444] bg-red-50" : "border-gray-300 focus:border-[#1E3A8A]"
            } focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20`}
            aria-label={`Chiffre ${index + 1} du code OTP`}
          />
        ))}
      </div>
      {error && (
        <p className="text-[#EF4444] text-sm mt-3 text-center flex items-center justify-center gap-1">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  )
}

interface FileInputProps {
  label: string
  name: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  accept?: string
  required?: boolean
  error?: string
  fileName?: string
}

export function FileInput({
  label,
  name,
  onChange,
  accept = "image/*",
  required = true,
  error,
  fileName,
}: FileInputProps) {
  return (
    <div className="mb-4">
      <Label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-[#EF4444]">*</span>}
      </Label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8h-3M12 8H4a4 4 0 00-4 4v20a4 4 0 004 4h28a4 4 0 004-4V12a4 4 0 00-4-4H12z" />
          </svg>
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor={name}
              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
            >
              <span>Upload a file</span>
              <input
                id={name}
                name={name}
                type="file"
                className="sr-only"
                accept={accept}
                onChange={onChange}
                required={required}
              />
            </label>
            {fileName && <p className="pl-1">{fileName}</p>}
          </div>
          {error && <p className="text-[#EF4444] text-sm mt-1">{error}</p>}
        </div>
      </div>
    </div>
  )
}
