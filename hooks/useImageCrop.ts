import { useState, useCallback } from "react"
import type { Crop } from "react-image-crop"
import type { CropState, CroppedImages } from "@/types/draft"
import { formatCropCoordinates } from "@/lib/utils"

interface CropResult {
  crops: CropState
  images: CroppedImages
  pic_crop_235_1?: string
  pic_crop_1_1?: string
}

export function useImageCrop(initialImage: string | null, initialCrops?: CropState) {
  const [originalImage, setOriginalImage] = useState<string | null>(initialImage)
  const [croppedImages, setCroppedImages] = useState<CroppedImages>({ crop235: null, crop11: null })
  const [crops, setCrops] = useState<CropState>(initialCrops || {})
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)

  const handleCropComplete = useCallback((result: { crops: CropState; images: CroppedImages }): CropResult => {
    setCroppedImages(result.images)
    setCrops(result.crops)

    // 转换裁切坐标
    const pic_crop_235_1 = result.crops.crop235 ? formatCropCoordinates(result.crops.crop235) : undefined
    const pic_crop_1_1 = result.crops.crop11 ? formatCropCoordinates(result.crops.crop11) : undefined

    return {
      ...result,
      pic_crop_235_1,
      pic_crop_1_1,
      thumb_media_id: "temp_media_id",
      show_cover_pic: 1,
    }
  }, [])

  return {
    originalImage,
    setOriginalImage,
    croppedImages,
    crops,
    isCropDialogOpen,
    setIsCropDialogOpen,
    handleCropComplete,
  }
} 