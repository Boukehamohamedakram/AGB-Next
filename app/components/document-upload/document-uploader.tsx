"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Upload, X, FileImage, FileIcon as FilePdf, Camera } from "lucide-react"
import Image from "next/image"

interface DocumentUploaderProps {
  title: string
  instructions: string
  onFileSelected: (file: File | null) => void
  maxSizeMB?: number
  acceptedFileTypes?: string[]
  error?: string
  existingFile?: File | null
}

export function DocumentUploader({
  title,
  instructions,
  onFileSelected,
  maxSizeMB = 5,
  acceptedFileTypes = ["image/jpeg", "image/png", "application/pdf"],
  error,
  existingFile = null,
}: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(existingFile)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      processFile(selectedFile)
    }
  }

  const processFile = (selectedFile: File) => {
    // Validation du type de fichier
    if (!acceptedFileTypes.includes(selectedFile.type)) {
      setFileError(
        `Type de fichier non supporté. Veuillez télécharger un fichier ${acceptedFileTypes.map((type) => type.split("/")[1]).join(", ")}.`,
      )
      return
    }

    // Validation de la taille
    if (selectedFile.size > maxSizeBytes) {
      setFileError(`Fichier trop volumineux. La taille maximale est de ${maxSizeMB} Mo.`)
      return
    }

    setFile(selectedFile)
    onFileSelected(selectedFile)
    setFileError(null)

    // Créer un aperçu pour les images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
    onFileSelected(null)
    setFileError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const startCamera = async () => {
    try {
      setShowCameraModal(false)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Caméra arrière par défaut
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      setCameraStream(stream)
      setShowCamera(true)

      // Attendre que la vidéo soit prête
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }, 100)

      setFileError(null)
    } catch (error) {
      console.error("Camera error:", error)
      setFileError(
        "Impossible d'accéder à la caméra. Veuillez autoriser l'accès ou utiliser l'option de téléchargement.",
      )
      setShowCameraModal(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && cameraStream) {
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      const video = videoRef.current

      // S'assurer que la vidéo est prête
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setFileError("La caméra n'est pas encore prête. Veuillez réessayer.")
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
              const fileName = `document-${timestamp}.jpg`
              const file = new File([blob], fileName, { type: "image/jpeg" })

              processFile(file)
              stopCamera()
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
  }

  const getFileIcon = () => {
    if (!file) return null

    if (file.type.startsWith("image/")) {
      return <FileImage className="h-12 w-12 text-[#003087]" />
    } else if (file.type === "application/pdf") {
      return <FilePdf className="h-12 w-12 text-[#003087]" />
    }

    return <FileImage className="h-12 w-12 text-[#003087]" />
  }

  return (
    <div className="mb-6">
      <div className="flex items-start mb-3">
        <h3 className="text-base font-medium">{title}</h3>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start gap-3 mb-4">
        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Instructions</p>
          <p>{instructions}</p>
        </div>
      </div>

      {!file ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={acceptedFileTypes.join(",")}
            className="hidden"
            aria-label={`Télécharger ${title}`}
          />

          <div className="mx-auto flex flex-col items-center justify-center">
            <Upload className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">Comment souhaitez-vous ajouter votre document ?</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                type="button"
                onClick={() => setShowCameraModal(true)}
                className="flex items-center gap-2 bg-[#1E3A8A] hover:bg-[#1E40AF]"
              >
                <Camera className="h-4 w-4" /> Prendre une photo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" /> Choisir un fichier
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Formats acceptés: {acceptedFileTypes.map((type) => type.split("/")[1].toUpperCase()).join(", ")}
              <br />
              Taille maximale: {maxSizeMB} Mo
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {getFileIcon()}
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-gray-500 hover:text-red-500"
              aria-label="Supprimer le fichier"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {preview && (
            <div className="mt-3 relative">
              <Image
                src={preview || "/placeholder.svg"}
                alt="Aperçu du document"
                width={400}
                height={300}
                className="w-full h-auto rounded-md object-contain max-h-[300px]"
              />
            </div>
          )}
        </div>
      )}

      {/* Modal de choix */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
            <h3 className="font-medium mb-4 text-center">📷 Prendre une photo</h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Assurez-vous d'être dans un endroit bien éclairé et que le document est entièrement visible.
            </p>
            <div className="space-y-3">
              <Button onClick={startCamera} className="w-full flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Ouvrir la caméra
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCameraModal(false)
                  fileInputRef.current?.click()
                }}
                className="w-full flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Choisir un fichier à la place
              </Button>
              <Button variant="ghost" onClick={() => setShowCameraModal(false)} className="w-full">
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Caméra plein écran */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex-1 relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Overlay avec guide */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-4 border-white border-dashed rounded-lg w-80 h-52 opacity-70"></div>
            </div>

            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <Button variant="ghost" onClick={stopCamera} className="text-white bg-black/50 hover:bg-black/70">
                <X className="h-5 w-5" />
              </Button>
              <div className="text-white text-sm bg-black/50 px-3 py-1 rounded">{title}</div>
            </div>
          </div>

          <div className="p-6 bg-white">
            <Button onClick={capturePhoto} className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white py-4 text-lg">
              <Camera className="h-6 w-6 mr-2" />
              Capturer la photo
            </Button>
          </div>
        </div>
      )}

      {(fileError || error) && (
        <p className="text-[#EF4444] text-sm mt-2 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" /> {fileError || error}
        </p>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
