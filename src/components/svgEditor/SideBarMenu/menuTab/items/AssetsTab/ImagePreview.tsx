"use client"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Image } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import type { ImageItem } from "@/types/asset"
import { formatFileSize, formatDimensions, formatLastModified } from "@/utils/assetUtils"
import { useEffect, useState } from "react"

interface ImagePreviewProps {
    asset: ImageItem
    isSelected?: boolean
    minHeight?: number
    onClick?: () => void
}

export function ImagePreview({
    asset,
    isSelected = false,
    minHeight,
    onClick,
}: ImagePreviewProps) {
    const [isAnimatingIn, setIsAnimatingIn] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsAnimatingIn(true)
        }, 50)
        return () => clearTimeout(timer)
    }, [])

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        className={cn(
                            "relative rounded-md overflow-hidden cursor-pointer",
                            "ring-1 ring-muted/20 hover:ring-2 hover:ring-primary/50",
                            isSelected && "ring-2 ring-primary",
                            "transition-all duration-300",
                            isAnimatingIn ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
                        )}
                        style={{ minHeight }}
                        onClick={onClick}
                    >
                        {/* 图片预览容器 */}
                        <div className="w-full h-full relative flex items-center justify-center bg-black/5">
                            <img
                                src={asset.url}
                                alt={asset.name}
                                className={cn(
                                    "max-w-full max-h-full transition-all duration-200",
                                    'object-cover w-full h-auto'
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
                                    <span>{formatDimensions(asset.dimensions.width, asset.dimensions.height)}</span>
                                    <span>{formatFileSize(asset.size || 0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* 复选框 */}
                        <Checkbox
                            checked={isSelected}
                            className="absolute top-1 right-1 h-4 w-4 bg-background/95 z-10"
                            onClick={(e) => { e.stopPropagation() }}
                        />
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