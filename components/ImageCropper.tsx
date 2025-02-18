"use client"

import { useState, useCallback } from "react"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

interface ImageCropperProps {
  image: string
  crop: Crop
  setCrop: (crop: Crop) => void
  aspect: number
}

export default function ImageCropper({ image, crop, setCrop, aspect }: ImageCropperProps) {
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null)

  const onCropChange = useCallback(
    (newCrop: Crop) => {
      setCrop(newCrop)
    },
    [setCrop],
  )

  const onCropComplete = useCallback((croppedArea: Crop, croppedAreaPixels: Crop) => {
    setCompletedCrop(croppedAreaPixels)
  }, [])

  return (
    <div>
      <ReactCrop crop={crop} onChange={onCropChange} onComplete={onCropComplete} aspect={aspect} keepSelection>
        <img src={image || "/placeholder.svg"} alt="Cover" />
      </ReactCrop>
    </div>
  )
}

