"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ProgressIndicator } from "@/components/progress-indicator"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"

export default function ContratPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [acceptConditions, setAcceptConditions] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!acceptConditions) {
      newErrors.acceptConditions = "Vous devez accepter les conditions générales pour continuer"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        // Rediriger vers la signature électronique
        router.push("/verification")
      }, 500)
    }
  }

  const handleBack = () => {
    router.push("/kyc/residence-proof")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4F6] p-4">
      <div className="w-full max-w-md">
        <Header />

        <Card className="w-full shadow-lg">
          <CardHeader className="pb-2">
            <ProgressIndicator currentStep={1} totalSteps={1} title="Contrat d'ouverture de compte" />
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <FileText className="h-16 w-16 text-[#003087] mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Contrat d'ouverture de compte</h3>
              <p className="text-sm text-gray-600">Veuillez lire attentivement le contrat avant de l'accepter</p>
            </div>

            <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-gray-50 mb-6">
              <h3 className="font-medium mb-2">CONTRAT D'OUVERTURE DE COMPTE BANCAIRE</h3>
              <p className="text-sm text-gray-600 mb-4">Algeria Gulf Bank</p>

              <div className="space-y-3 text-xs text-gray-600">
                <p className="font-medium">Entre les soussignés :</p>

                <p>
                  <strong>Algeria Gulf Bank</strong>, société par actions au capital de 20.000.000.000 DA, dont le siège
                  social est situé à Alger, immatriculée au registre du commerce sous le numéro XX/XX-XXXXXXXX,
                  représentée par son Directeur Général, ci-après dénommée "la Banque",
                </p>

                <p>
                  <strong>Et</strong>
                </p>

                <p>Le client, identifié dans le formulaire d'ouverture de compte, ci-après dénommé "le Client",</p>

                <p className="font-medium">Il a été convenu ce qui suit :</p>

                <div className="space-y-2">
                  <p>
                    <strong>Article 1 : Objet du contrat</strong>
                  </p>
                  <p>
                    Le présent contrat a pour objet de définir les conditions d'ouverture, de fonctionnement et de
                    clôture du compte bancaire ouvert par le Client auprès de la Banque.
                  </p>

                  <p>
                    <strong>Article 2 : Ouverture du compte</strong>
                  </p>
                  <p>
                    La Banque ouvre au Client un compte bancaire sous réserve de l'acceptation de sa demande et de la
                    fourniture de l'ensemble des documents requis par la réglementation en vigueur.
                  </p>

                  <p>
                    <strong>Article 3 : Fonctionnement du compte</strong>
                  </p>
                  <p>
                    Le compte fonctionne selon les conditions générales de la Banque et la réglementation bancaire en
                    vigueur en Algérie.
                  </p>

                  <p>
                    <strong>Article 4 : Obligations du Client</strong>
                  </p>
                  <p>
                    Le Client s'engage à fournir des informations exactes et à jour, et à respecter les conditions
                    d'utilisation des services bancaires.
                  </p>

                  <p>
                    <strong>Article 5 : Obligations de la Banque</strong>
                  </p>
                  <p>
                    La Banque s'engage à fournir les services bancaires dans le respect de la réglementation et des
                    meilleures pratiques professionnelles.
                  </p>

                  <p>
                    <strong>Article 6 : Tarification</strong>
                  </p>
                  <p>
                    Les tarifs applicables sont ceux en vigueur au moment de l'opération, conformément aux conditions
                    tarifaires de la Banque.
                  </p>

                  <p>
                    <strong>Article 7 : Clôture du compte</strong>
                  </p>
                  <p>
                    Le compte peut être clôturé à l'initiative du Client ou de la Banque selon les modalités prévues par
                    la réglementation.
                  </p>

                  <p>
                    <strong>Article 8 : Droit applicable</strong>
                  </p>
                  <p>
                    Le présent contrat est soumis au droit algérien. Tout litige sera de la compétence des tribunaux
                    algériens.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptConditions"
                  checked={acceptConditions}
                  onCheckedChange={(checked) => setAcceptConditions(checked === true)}
                  className="mt-1"
                />
                <label htmlFor="acceptConditions" className="text-sm font-medium leading-relaxed cursor-pointer">
                  J'ai lu et j'accepte les conditions générales d'utilisation et le contrat d'ouverture de compte
                </label>
              </div>

              {errors.acceptConditions && <p className="text-[#EF4444] text-sm">{errors.acceptConditions}</p>}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={handleBack} className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> Retour
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={isLoading || !acceptConditions}
              className="flex items-center gap-1"
            >
              {isLoading ? "Chargement..." : "Lire et signer le contrat"}
              {!isLoading && <ChevronRight className="h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
