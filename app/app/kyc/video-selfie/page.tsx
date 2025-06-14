"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ProgressIndicator } from "@/components/progress-indicator"
import { ChevronLeft, ChevronRight, Camera, Play, Square, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"

export default function VideoSelfiePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [videoRecorded, setVideoRecorded] = useState(false)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      setErrors({ camera: "Impossible d'accéder à la caméra. Veuillez autoriser l'accès." })
    }
  }

  const startRecording = () => {
    if (!streamRef.current) return

    const mediaRecorder = new MediaRecorder(streamRef.current)
    mediaRecorderRef.current = mediaRecorder
    const chunks: BlobPart[] = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" })
      setVideoBlob(blob)
      setVideoRecorded(true)
    }

    mediaRecorder.start()
    setIsRecording(true)

    // Arrêter automatiquement après 10 secondes
    setTimeout(() => {
      if (mediaRecorderRef.current && isRecording) {
        stopRecording()
      }
    }, 10000)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const retakeVideo = () => {
    setVideoRecorded(false)
    setVideoBlob(null)
    startCamera()
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!videoRecorded || !videoBlob) {
      newErrors.video = "Veuillez enregistrer une vidéo selfie pour continuer"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        // Stocker la vidéo dans localStorage (en production, l'envoyer au serveur)
        if (videoBlob) {
          const reader = new FileReader()
          reader.onload = () => {
            localStorage.setItem("videoSelfie", "recorded")
            router.push("/kyc/contrat")
          }
          reader.readAsDataURL(videoBlob)
        }
      }, 1000)
    }
  }

  const handleBack = () => {
    // Arrêter la caméra
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    router.push("/kyc/residence-proof")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4F6] p-4">
      <div className="w-full max-w-md">
        <Header />

        <Card className="w-full shadow-lg">
          <CardHeader className="pb-2">
            <ProgressIndicator currentStep={1} totalSteps={1} title="Vidéo Selfie" />
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start gap-3 mb-6">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Instructions</p>
                <ul className="space-y-1">
                  <li>• Placez-vous sous un éclairage clair</li>
                  <li>• Gardez votre visage visible dans le cadre</li>
                  <li>• Suivez les consignes à l'écran</li>
                  <li>• L'enregistrement durera 10 secondes maximum</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                {!videoRecorded ? (
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                )}

                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">Enregistrement...</span>
                  </div>
                )}
              </div>

              {!videoRecorded ? (
                <div className="flex flex-col gap-3">
                  {!streamRef.current && (
                    <Button onClick={startCamera} className="w-full flex items-center justify-center gap-2">
                      <Camera className="h-5 w-5" />
                      Activer la caméra
                    </Button>
                  )}

                  {streamRef.current && !isRecording && (
                    <Button onClick={startRecording} className="w-full flex items-center justify-center gap-2">
                      <Play className="h-5 w-5" />
                      Commencer l'enregistrement
                    </Button>
                  )}

                  {isRecording && (
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Square className="h-5 w-5" />
                      Arrêter l'enregistrement
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <p className="text-green-600 font-medium">✓ Vidéo enregistrée avec succès</p>
                  <Button
                    onClick={retakeVideo}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Camera className="h-5 w-5" />
                    Reprendre la vidéo
                  </Button>
                </div>
              )}

              {errors.video && (
                <p className="text-[#EF4444] text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {errors.video}
                </p>
              )}

              {errors.camera && (
                <p className="text-[#EF4444] text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {errors.camera}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={handleBack} className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> Retour
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={isLoading || !videoRecorded}
              className="flex items-center gap-1"
            >
              {isLoading ? "Chargement..." : "Suivant"}
              {!isLoading && <ChevronRight className="h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
