import { useCallback, useEffect, useRef } from "react"
import type { Crop } from "react-image-crop"

interface PreviewConfig {
  ratio: number
  label: string
  crop?: Crop
  height: number
}

interface CoverPreviewProps {
  imageUrl: string | null
  previews: PreviewConfig[]
}

export function CoverPreview({ imageUrl, previews }: CoverPreviewProps) {
  if (!imageUrl) return null

  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])

  const drawPreview = useCallback((
    img: HTMLImageElement,
    canvas: HTMLCanvasElement,
    preview: PreviewConfig
  ) => {
    if (!preview.crop) return

    canvas.height = preview.height
    canvas.width = preview.height * preview.ratio

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height

    const sourceX = preview.crop.x * scaleX
    const sourceY = preview.crop.y * scaleY
    const sourceWidth = preview.crop.width * scaleX
    const sourceHeight = preview.crop.height * scaleY

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    )
  }, [])

  useEffect(() => {
    const img = new Image()
    img.src = imageUrl
    img.onload = () => {
      previews.forEach((preview, index) => {
        const canvas = canvasRefs.current[index]
        if (!canvas) return
        drawPreview(img, canvas, preview)
      })
    }
  }, [imageUrl, previews, drawPreview])

  return (
    <>
      {previews.map((preview, index) => (
        <div key={preview.label} className="relative">
          <canvas
            ref={(el) => {
              canvasRefs.current[index] = el
            }}
            className="rounded-lg border bg-muted"
          />
          <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
            {preview.label}
          </div>
        </div>
      ))}
    </>
  )
} 