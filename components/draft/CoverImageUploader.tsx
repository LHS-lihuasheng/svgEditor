import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ImageCropDialog } from "./ImageCropDialog"
import { CoverPreview } from "./CoverPreview"
import type { CropState } from "@/types/draft"
import { useMessage } from "@/contexts/MessageContext"

interface CoverImageUploaderProps {
  originalImage: string | null
  croppedImages: { crop235: string | null; crop11: string | null }
  crops: CropState
  isCropDialogOpen: boolean
  onImageSelect: (file: File) => void
  onImageUpload: (file: File) => Promise<string | null>
  onCropDialogClose: () => void
  onCropComplete: (result: any) => void
  initialCrops?: CropState
  maxSize?: number
  acceptedFormats?: string[]
}

export function CoverImageUploader({
  originalImage,
  croppedImages,
  crops,
  isCropDialogOpen,
  onImageSelect,
  onImageUpload,
  onCropDialogClose,
  onCropComplete,
  initialCrops,
  maxSize = 2 * 1024 * 1024,
  acceptedFormats = ["image/jpeg", "image/png"],
}: CoverImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { tip } = useMessage()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (acceptedFormats.length > 0 && !acceptedFormats.includes(file.type)) {
      tip(`不支持的文件格式，请上传 ${acceptedFormats.join(', ')} 格式的图片`)
      return
    }

    // 验证文件大小
    if (file.size > maxSize) {
      tip(`文件过大，请上传小于 ${Math.round(maxSize / 1024 / 1024)}MB 的图片`)
      return
    }

    onImageSelect(file)
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
        accept={acceptedFormats.join(',')}
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