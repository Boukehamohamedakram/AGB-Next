"use client"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, StampIcon as Passport, FileText } from "lucide-react"

interface DocumentTypeSelectorProps {
  selectedType: string
  onChange: (type: string) => void
}

export function DocumentTypeSelector({ selectedType, onChange }: DocumentTypeSelectorProps) {
  return (
    <div className="mb-6">
      <Label className="text-base font-medium mb-3 block">Type de document d'identité</Label>
      <RadioGroup value={selectedType} onValueChange={onChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Label
          htmlFor="cni"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedType === "cni"
              ? "border-[#003087] bg-blue-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <RadioGroupItem value="cni" id="cni" className="sr-only" />
          <CreditCard className="h-8 w-8 mb-2 text-[#003087]" />
          <span className="font-medium">Carte nationale d'identité</span>
          <span className="text-xs text-gray-500 mt-1">Recto et verso requis</span>
        </Label>

        <Label
          htmlFor="passport"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedType === "passport"
              ? "border-[#003087] bg-blue-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <RadioGroupItem value="passport" id="passport" className="sr-only" />
          <Passport className="h-8 w-8 mb-2 text-[#003087]" />
          <span className="font-medium">Passeport</span>
          <span className="text-xs text-gray-500 mt-1">Page d'informations</span>
        </Label>

        <Label
          htmlFor="permis"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedType === "permis"
              ? "border-[#003087] bg-blue-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <RadioGroupItem value="permis" id="permis" className="sr-only" />
          <FileText className="h-8 w-8 mb-2 text-[#003087]" />
          <span className="font-medium">Permis de conduire</span>
          <span className="text-xs text-gray-500 mt-1">Recto uniquement</span>
        </Label>
      </RadioGroup>
    </div>
  )
}
