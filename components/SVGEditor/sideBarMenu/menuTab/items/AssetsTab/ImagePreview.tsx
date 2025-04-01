"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Image } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import type { ImageAsset } from "@/types/asset"
import { formatFileSize, formatDimensions, formatLastModified } from "@/utils/assetUtils"

interface ImagePreviewProps {
    asset: ImageAsset
    isSelected?: boolean
    height?: number | string
    minHeight?: number
    columnWidth?: number
    isVisible?: boolean
    onLoad?: (dimensions: { width: number; height: number }) => void
    onClick?: () => void
    onCheckboxClick?: (e: React.MouseEvent) => void
}

export function ImagePreview({
    asset,
    isSelected = false,
    height = 'auto',
    minHeight = 120,
    columnWidth,
    isVisible = true,
    onLoad,
    onClick,
    onCheckboxClick
}: ImagePreviewProps) {
    const [dimensions, setDimensions] = useState<{ width: number; height: number }>(
        asset.dimensions || { width: 0, height: 0 }
    )
    const [objectFit, setObjectFit] = useState<'contain' | 'cover'>('contain')
    const containerRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)

    // 计算并设置最佳的图片显示方式
    const calculateObjectFit = useCallback((imgWidth: number, imgHeight: number) => {
        const container = containerRef.current
        if (!container) return

        const { width, height } = container.getBoundingClientRect()
        const containerRatio = width / height
        const imageRatio = imgWidth / imgHeight

        setObjectFit(imageRatio > containerRatio ? 'contain' : 'cover')
    }, [])

    // 处理图片加载完成事件
    const handleLoad = useCallback(() => {
        if (!imageRef.current) return

        const { naturalWidth, naturalHeight } = imageRef.current
        const newDimensions = { width: naturalWidth, height: naturalHeight }

        setDimensions(newDimensions)
        calculateObjectFit(naturalWidth, naturalHeight)

        // 调用外部加载回调
        onLoad?.(newDimensions)
    }, [onLoad, calculateObjectFit])

    // 根据图片比例和列宽计算最佳高度
    useEffect(() => {
        if (dimensions.width > 0 && dimensions.height > 0 && columnWidth) {
            const aspectRatio = dimensions.width / dimensions.height
            const calculatedHeight = columnWidth / aspectRatio

            // 这里不直接设置高度，而是通过onLoad回调传递给父组件
            // MasonryGallery将负责最终设置高度
        }
    }, [dimensions, columnWidth])

    // 监听图片加载
    useEffect(() => {
        const image = imageRef.current
        if (!image) return

        image.addEventListener('load', handleLoad)
        return () => image.removeEventListener('load', handleLoad)
    }, [handleLoad])

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        ref={containerRef}
                        className={cn(
                            "relative rounded-md overflow-hidden cursor-pointer",
                            "ring-1 ring-muted/20 hover:ring-2 hover:ring-primary/50",
                            isSelected && "ring-2 ring-primary",
                            "transition-all duration-300",
                            isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
                        )}
                        style={{
                            height,
                            minHeight
                        }}
                        onClick={onClick}
                    >
                        {/* 图片预览容器 */}
                        <div className="w-full h-full relative flex items-center justify-center bg-black/5">
                            <img
                                ref={imageRef}
                                src={asset.url}
                                alt={asset.name}
                                className={cn(
                                    "max-w-full max-h-full transition-all duration-200",
                                    objectFit === 'contain' ? 'object-contain' : 'object-cover',
                                    objectFit === 'contain' ? 'w-auto h-full' : 'w-full h-auto'
                                )}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                }}
                            />
                            {/* 图片加载失败时显示的替代图标 */}
                            <div className="hidden absolute inset-0 items-center justify-center">
                                <Image className="h-6 w-6 text-muted-foreground" />
                            </div>
                        </div>

                        {/* 图片信息面板 */}
                        <div className="absolute inset-x-0 bottom-0 bg-black/50 p-1.5">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[10px] text-white font-medium truncate">
                                    {asset.name}
                                </p>

                                <div className="flex items-center justify-between text-[8px] text-white/80">
                                    <span>{formatDimensions(dimensions.width, dimensions.height)}</span>
                                    <span>{formatFileSize(asset.size || 0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* 复选框 */}
                        {onCheckboxClick && (
                            <Checkbox
                                checked={isSelected}
                                className="absolute top-1 right-1 h-4 w-4 bg-background/95 z-10"
                                onClick={onCheckboxClick}
                            />
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="text-xs space-y-1">
                        <p className="text-muted-foreground">
                            修改于 {formatLastModified(asset.lastModified)}
                        </p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
} 