import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Pencil, Upload } from "lucide-react"

interface CroppedImagePreviewsProps {
  image235: string | null
  image11: string | null
  onEdit: () => void
  onNewImage: () => void
}

export function CroppedImagePreviews({ image235, image11, onEdit, onNewImage }: CroppedImagePreviewsProps) {
  if (!image235 && !image11) return null

  const previewHeight = 200 // Fixed height for both previews

  return (
    <div className="space-y-4">
      <div className="flex gap-6 justify-center">
        <Card className="relative group">
          <div style={{ height: previewHeight }} className="p-4">
            <div className="h-full relative">
              {image235 && (
                <img
                  src={image235 || "/placeholder.svg"}
                  alt="2.35:1 预览"
                  className="h-full w-auto object-contain"
                  style={{
                    maxWidth: `${previewHeight * 2.35}px`,
                  }}
                />
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">2.35:1 (消息列表)</p>
          </div>
        </Card>

        <Card className="relative group">
          <div style={{ height: previewHeight }} className="p-4">
            <div className="h-full relative">
              {image11 && (
                <img
                  src={image11 || "/placeholder.svg"}
                  alt="1:1 预览"
                  className="h-full w-auto object-contain"
                  style={{
                    maxWidth: `${previewHeight}px`,
                  }}
                />
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">1:1 (转发卡片、公众号主页)</p>
          </div>
        </Card>
      </div>

      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          重新裁切
        </Button>
        <Button variant="outline" size="sm" onClick={onNewImage}>
          <Upload className="h-4 w-4 mr-2" />
          更换图片
        </Button>
      </div>
    </div>
  )
}

