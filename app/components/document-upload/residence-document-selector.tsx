"use client"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FileText, Home } from "lucide-react"

interface ResidenceDocumentSelectorProps {
  selectedType: string
  onChange: (type: string) => void
}

export function ResidenceDocumentSelector({ selectedType, onChange }: ResidenceDocumentSelectorProps) {
  return (
    <div className="mb-6">
      <Label className="text-base font-medium mb-3 block">Type de justificatif de résidence</Label>
      <RadioGroup value={selectedType} onValueChange={onChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Label
          htmlFor="facture"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedType === "facture"
              ? "border-[#003087] bg-blue-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <RadioGroupItem value="facture" id="facture" className="sr-only" />
          <FileText className="h-8 w-8 mb-2 text-[#003087]" />
          <span className="font-medium">Facture</span>
          <span className="text-xs text-gray-500 mt-1">Électricité, eau ou gaz (moins de 3 mois)</span>
        </Label>

        <Label
          htmlFor="contrat"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedType === "contrat"
              ? "border-[#003087] bg-blue-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <RadioGroupItem value="contrat" id="contrat" className="sr-only" />
          <Home className="h-8 w-8 mb-2 text-[#003087]" />
          <span className="font-medium">Contrat de location</span>
          <span className="text-xs text-gray-500 mt-1">Ou attestation de résidence (moins de 6 mois)</span>
        </Label>
      </RadioGroup>
    </div>
  )
}
