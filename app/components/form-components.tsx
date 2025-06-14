"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"

interface InputFieldProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
  required?: boolean
  pattern?: string
  error?: string
  className?: string
}

export function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
  pattern,
  error,
  className,
}: InputFieldProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <Label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-agb-error">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`${error ? "border-agb-error" : ""}`}
        placeholder={placeholder}
        pattern={pattern}
        required={required}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-label={label}
      />
      {error && (
        <p id={`${name}-error`} className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface PasswordFieldProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  error?: string
  className?: string
}

export function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = true,
  error,
  className,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={`mb-4 ${className}`}>
      <Label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-agb-error">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`${error ? "border-agb-error" : ""}`}
          placeholder={placeholder}
          required={required}
          aria-describedby={error ? `${name}-error` : undefined}
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && (
        <p id={`${name}-error`} className="error" role="alert">
          {error}
        </p>
      )}
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
  disabled?: boolean
  className?: string
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = true,
  error,
  disabled = false,
  className,
}: SelectFieldProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <Label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-agb-error">*</span>}
      </Label>
      <Select
        id={name}
        value={value}
        onChange={onChange}
        className={`${error ? "border-agb-error" : ""}`}
        required={required}
        disabled={disabled}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-label={label}
      >
        <option value="">Sélectionnez une option</option>
        {options.map((option, index) => {
          const optionValue = typeof option === "string" ? option : option.value
          const optionLabel = typeof option === "string" ? option : option.label
          return (
            <option key={index} value={optionValue}>
              {optionLabel}
            </option>
          )
        })}
      </Select>
      {error && (
        <p id={`${name}-error`} className="error" role="alert">
          {error}
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
  selectedFile?: File | null
  className?: string
}

export function FileInput({
  label,
  name,
  onChange,
  accept = "image/*",
  required = true,
  error,
  selectedFile,
  className,
}: FileInputProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <Label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-agb-error">*</span>}
      </Label>
      <Input
        id={name}
        type="file"
        onChange={onChange}
        className={`${error ? "border-agb-error" : ""}`}
        accept={accept}
        required={required}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-label={label}
      />
      {selectedFile && <p className="text-sm text-gray-600 mt-2">Fichier sélectionné : {selectedFile.name}</p>}
      {error && (
        <p id={`${name}-error`} className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
