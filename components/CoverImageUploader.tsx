import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ImageCropDialog } from "./ImageCropDialog"
import { CoverPreview } from "./CoverPreview"
import type { CropState } from "@/types/draft"

interface CoverImageUploaderProps {
  originalImage: string | null
  croppedImages: { crop235: string | null; crop11: string | null }
  crops: CropState
  isCropDialogOpen: boolean
  onImageSelect: (imageUrl: string) => void
  onCropDialogClose: () => void
  onCropComplete: (result: any) => void
  initialCrops?: CropState
}

export function CoverImageUploader({
  originalImage,
  croppedImages,
  crops,
  isCropDialogOpen,
  onImageSelect,
  onCropDialogClose,
  onCropComplete,
  initialCrops,
}: CoverImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onImageSelect(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNewImage = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <Label>封面图片</Label>
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload} 
        className="hidden" 
      />
      {croppedImages.crop235 || croppedImages.crop11 ? (
        <div className="space-y-4">
          <div className="flex gap-4 w-full items-start">
            <CoverPreview 
              imageUrl={croppedImages.crop235 || croppedImages.crop11}
              previews={[
                {
                  ratio: 2.35,
                  label: "2.35:1 (消息列表)",
                  crop: crops.crop235,
                  height: 150,
                },
                {
                  ratio: 1,
                  label: "1:1 (转发卡片、公众号主页)",
                  crop: crops.crop11,
                  height: 150,
                }
              ]}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onCropDialogClose()}>
              重新裁切
            </Button>
            <Button variant="outline" onClick={handleNewImage}>
              更换图片
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={handleNewImage}>
          选择封面图片
        </Button>
      )}
      {originalImage && (
        <ImageCropDialog
          isOpen={isCropDialogOpen}
          onClose={onCropDialogClose}
          imageSrc={originalImage}
          initialCrops={initialCrops}
          onCropComplete={(result) => {
            onCropComplete(result)
            onCropDialogClose()
          }}
        />
      )}
    </div>
  )
} 