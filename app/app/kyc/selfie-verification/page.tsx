"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ProgressIndicator } from "@/components/progress-indicator"
import { ChevronLeft, ChevronRight, Camera, CheckCircle, AlertCircle, RotateCcw, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget"

export default function SelfieVerificationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [photoTaken, setPhotoTaken] = useState(false)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [currentCamera, setCurrentCamera] = useState<"user" | "environment" | "any">("user")
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraStream])

  const startCamera = async (cameraType: "user" | "environment" | "any" = "user") => {
    try {
      setCameraError(null)
      setErrors({})

      let constraints: MediaStreamConstraints

      if (cameraType === "any") {
        // Try any available camera without specifying facingMode
        constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        }
      } else {
        // Try specific camera (front or back)
        constraints = {
          video: {
            facingMode: cameraType,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setCameraStream(stream)
      setCurrentCamera(cameraType)
      setShowCamera(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      console.log(`Camera started successfully with mode: ${cameraType}`)
    } catch (error) {
      console.error(`Camera error with mode ${cameraType}:`, error)

      // Try fallback cameras
      if (cameraType === "user") {
        console.log("Front camera failed, trying back camera...")
        setCameraError("Caméra frontale non disponible, essai de la caméra arrière...")
        setTimeout(() => startCamera("environment"), 1000)
      } else if (cameraType === "environment") {
        console.log("Back camera failed, trying any available camera...")
        setCameraError("Caméra arrière non disponible, essai de toute caméra disponible...")
        setTimeout(() => startCamera("any"), 1000)
      } else {
        // All camera attempts failed
        setCameraError(
          "Aucune caméra disponible. Veuillez vérifier les autorisations ou utiliser l'option de téléchargement.",
        )
        setErrors({
          camera:
            "Impossible d'accéder à une caméra. Veuillez autoriser l'accès ou utiliser l'option de téléchargement de fichier.",
        })
      }
    }
  }

  const switchCamera = async () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }

    // Switch to next available camera type
    const nextCamera = currentCamera === "user" ? "environment" : "user"
    await startCamera(nextCamera)
  }

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current && cameraStream) {
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      const video = videoRef.current

      // S'assurer que la vidéo est prête
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setErrors({ capture: "La caméra n'est pas encore prête. Veuillez réessayer." })
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        // Dessiner l'image de la vidéo sur le canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convertir en blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
              const fileName = `selfie-${timestamp}.jpg`
              const file = new File([blob], fileName, { type: "image/jpeg" })

              setPhotoBlob(blob)
              setPhotoUrl(canvas.toDataURL("image/jpeg", 0.8))
              setPhotoTaken(true)
              stopCamera()

              // Store immediately when photo is taken
              const photoData = {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                cameraUsed: currentCamera,
                capturedAt: new Date().toISOString(),
                status: "ready",
              }
              localStorage.setItem("selfieVerification", JSON.stringify(photoData))
            }
          },
          "image/jpeg",
          0.9, // Qualité élevée
        )
      }
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
    setCameraError(null)
  }

  const retakePhoto = () => {
    setPhotoTaken(false)
    setPhotoBlob(null)
    setPhotoUrl(null)
    setErrors({})
    startCamera(currentCamera)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!photoTaken || !photoBlob) {
      newErrors.photo = "Veuillez prendre un selfie pour continuer"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      // Direct navigation to next step
      router.push("/kyc/contrat")
    }
  }

  const handleBack = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
    }
    router.push("/kyc/residence-proof")
  }

  const getCameraTypeLabel = () => {
    switch (currentCamera) {
      case "user":
        return "Caméra frontale"
      case "environment":
        return "Caméra arrière"
      case "any":
        return "Caméra disponible"
      default:
        return "Caméra"
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4F6] p-4">
      <div className="w-full max-w-md">
        <Header />

        <Card className="w-full shadow-lg">
          <CardHeader className="pb-2">
            <ProgressIndicator currentStep={1} totalSteps={1} title="Vérification d'identité" />
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start gap-3 mb-6">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Instructions pour le selfie</p>
                <ul className="space-y-1">
                  <li>• Placez-vous dans un endroit bien éclairé</li>
                  <li>• Regardez directement la caméra</li>
                  <li>• Gardez une expression neutre</li>
                  <li>• Assurez-vous que votre visage est entièrement visible</li>
                  <li>• Si la caméra frontale ne fonctionne pas, nous utiliserons une autre caméra</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              {!showCamera && !photoTaken && (
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Prenez un selfie en temps réel</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Cette étape permet de confirmer votre identité en comparant votre visage avec vos documents
                    </p>
                    <Button
                      onClick={() => startCamera("user")}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Camera className="h-5 w-5" />
                      Activer la caméra
                    </Button>
                  </div>
                </div>
              )}

              {cameraError && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-yellow-700 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {cameraError}
                  </p>
                </div>
              )}

              {photoTaken && photoUrl && (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={photoUrl || "/placeholder.svg"}
                      alt="Votre selfie"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Photo prise avec {getCameraTypeLabel()}
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg text-sm">
                    <p className="text-green-700 font-medium mb-1">✅ Selfie capturé avec succès</p>
                    <p className="text-green-600">Caméra utilisée : {getCameraTypeLabel()}</p>
                  </div>

                  <Button
                    onClick={retakePhoto}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reprendre la photo
                  </Button>
                </div>
              )}

              {Object.keys(errors).map((key) => (
                <p key={key} className="text-[#EF4444] text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {errors[key]}
                </p>
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={handleBack} className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> Retour
            </Button>

            <Button type="button" onClick={handleNext} disabled={!photoTaken} className="flex items-center gap-1">
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Caméra en plein écran */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex-1 relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Overlay avec guide visuel */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-80 border-4 border-white rounded-full opacity-50"></div>
            </div>

            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <Button variant="ghost" onClick={stopCamera} className="text-white bg-black/50 hover:bg-black/70">
                Annuler
              </Button>

              <div className="flex items-center gap-2">
                <div className="text-white text-sm bg-black/50 px-3 py-1 rounded">{getCameraTypeLabel()}</div>
                {(currentCamera === "user" || currentCamera === "environment") && (
                  <Button
                    variant="ghost"
                    onClick={switchCamera}
                    className="text-white bg-black/50 hover:bg-black/70 p-2"
                    title="Changer de caméra"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="absolute bottom-20 left-4 right-4 text-center">
              <div className="text-white text-sm bg-black/50 px-3 py-2 rounded">
                Positionnez votre visage dans le cercle
              </div>
            </div>
          </div>

          <div className="p-6 bg-white">
            <Button onClick={capturePhoto} className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white py-4 text-lg">
              <Camera className="h-6 w-6 mr-2" />
              Prendre le selfie
            </Button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      <ChatbotWidget
        context={{ page: "selfie_verification", step: "identity_verification", cameraType: currentCamera }}
      />
    </div>
  )
}
