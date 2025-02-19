"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ReactCrop, { type Crop } from "react-image-crop"
import { Check, ArrowLeft } from "lucide-react"
import "react-image-crop/dist/ReactCrop.css"

interface CropState {
  crop235?: Crop
  crop11?: Crop
}

interface CroppedImages {
  crop235: string | null
  crop11: string | null
}

interface ImageCropDialogProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  initialCrops?: CropState
  onCropComplete: (result: { crops: CropState; images: CroppedImages }) => void
}

export function ImageCropDialog({ isOpen, onClose, imageSrc, initialCrops, onCropComplete }: ImageCropDialogProps) {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [selectedRatio, setSelectedRatio] = useState<"2.35:1" | "1:1">("2.35:1")
  
  // 计算最佳裁剪区域
  const calculateOptimalCrop = useCallback((image: HTMLImageElement, aspectRatio: number): Crop => {
    const imageWidth = image.width
    const imageHeight = image.height

    // 先尝试使用全宽
    const cropWidth = imageWidth
    const cropHeight = cropWidth / aspectRatio

    if (cropHeight <= imageHeight) {
      // 如果按全宽计算的高度合适，就使用全宽
      return {
        unit: "px",
        width: cropWidth,
        height: cropHeight,
        x: 0,
        y: (imageHeight - cropHeight) / 2, // 垂直居中
      }
    } else {
      // 如果按全宽计算的高度太大，就使用全高
      const cropHeight = imageHeight
      const cropWidth = cropHeight * aspectRatio
      return {
        unit: "px",
        width: cropWidth,
        height: cropHeight,
        x: (imageWidth - cropWidth) / 2, // 水平居中
        y: 0,
      }
    }
  }, [])

  const [crop235, setCrop235] = useState<Crop>(
    initialCrops?.crop235 || {
      unit: "px",
      width: 100,
      height: 100 / 2.35,
      x: 0,
      y: 0,
    }
  )

  const [crop11, setCrop11] = useState<Crop>(
    initialCrops?.crop11 || {
      unit: "px",
      width: 100,
      height: 100,
      x: 0,
      y: 0,
    }
  )

  const [currentCrop, setCurrentCrop] = useState<Crop>(crop235)

  useEffect(() => {
    const newCrop = selectedRatio === "2.35:1" ? crop235 : crop11
    setCurrentCrop(newCrop)
  }, [selectedRatio, crop235, crop11])

  const onImageLoad = useCallback((image: HTMLImageElement) => {
    imageRef.current = image

    // 计算两种比例的最佳裁剪区域
    const newCrop235 = calculateOptimalCrop(image, 2.35)
    const newCrop11 = calculateOptimalCrop(image, 1)

    setCrop235(newCrop235)
    setCrop11(newCrop11)
    
    // 设置当前选中的裁剪框
    setCurrentCrop(selectedRatio === "2.35:1" ? newCrop235 : newCrop11)
  }, [calculateOptimalCrop, selectedRatio])

  const onCropChange = useCallback((newCrop: Crop) => {
    setCurrentCrop(newCrop)
    if (selectedRatio === "2.35:1") {
      setCrop235(newCrop)
    } else {
      setCrop11(newCrop)
    }
  }, [selectedRatio])

  const getCroppedImg = useCallback((image: HTMLImageElement, crop: Crop): Promise<string> => {
    const canvas = document.createElement("canvas")
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    // 根据裁切框的实际像素计算画布尺寸
    canvas.width = crop.width * scaleX
    canvas.height = crop.height * scaleY

    const ctx = canvas.getContext("2d")

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,      // 源图像的 x 坐标
        crop.y * scaleY,      // 源图像的 y 坐标
        crop.width * scaleX,  // 源图像的宽度
        crop.height * scaleY, // 源图像的高度
        0,                    // 目标画布的 x 坐标
        0,                    // 目标画布的 y 坐标
        canvas.width,         // 目标画布的宽度
        canvas.height         // 目标画布的高度
      )
    }

    return new Promise<string>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas is empty")
            return
          }
          const croppedImageUrl = URL.createObjectURL(blob)
          resolve(croppedImageUrl)
        },
        "image/jpeg",
        1  // 最高质量
      )
    })
  }, [])

  const handleCropComplete = useCallback(async () => {
    if (!imageRef.current) return

    const crop235Image = await getCroppedImg(imageRef.current, crop235)
    const crop11Image = await getCroppedImg(imageRef.current, crop11)

    onCropComplete({
      crops: { crop235, crop11 },
      images: { crop235: crop235Image, crop11: crop11Image },
    })
    onClose()
  }, [crop235, crop11, getCroppedImg, onCropComplete, onClose])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col p-0">
        <div className="flex items-center gap-2 p-4 border-b">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">编辑封面</h2>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-muted/10">
            <ReactCrop
              crop={currentCrop}
              onChange={onCropChange}
              aspect={selectedRatio === "2.35:1" ? 2.35 : 1}
              className="max-h-[calc(80vh-8rem)]"
            >
              <img
                src={imageSrc}
                alt="待裁剪的图片"
                className="max-w-full max-h-[calc(80vh-8rem)]"
                onLoad={(e) => onImageLoad(e.currentTarget)}
              />
            </ReactCrop>
          </div>

          <div className="w-72 border-l bg-muted/10 p-4 space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium">裁剪尺寸</h3>

              <div className="space-y-2">
                <Card
                  className={`p-4 cursor-pointer hover:bg-accent ${
                    selectedRatio === "2.35:1" ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedRatio("2.35:1")}
                >
                  <div className="flex items-center justify-between">
                    <span>2.35:1 (消息列表)</span>
                    {selectedRatio === "2.35:1" && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="mt-2 aspect-[2.35/1] bg-muted rounded-sm" />
                </Card>

                <Card
                  className={`p-4 cursor-pointer hover:bg-accent ${
                    selectedRatio === "1:1" ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedRatio("1:1")}
                >
                  <div className="flex items-center justify-between">
                    <span>1:1 (转发卡片、公众号主页)</span>
                    {selectedRatio === "1:1" && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="mt-2 aspect-square bg-muted rounded-sm" />
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleCropComplete}>确认</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

