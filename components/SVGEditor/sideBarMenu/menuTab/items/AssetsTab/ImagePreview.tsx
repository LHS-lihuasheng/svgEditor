"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatFileSize, formatDimensions, formatLastModified } from "@/utils/file-utils"
import type { FileEntry } from "@/utils/file-utils"
import { Image } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImagePreviewProps {
    file: FileEntry
    onLoad?: (info: {
        dimensions: { width: number; height: number }
        relativePath: string
        name: string
        url: string
    }) => void
    onClick?: () => void
}

interface ImageDimensions {
    width: number
    height: number
}

export function ImagePreview({ file, onLoad, onClick }: ImagePreviewProps) {
    const [dimensions, setDimensions] = useState<ImageDimensions>({ width: 0, height: 0 })
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

        // 根据容器和图片的宽高比决定填充方式
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
        onLoad?.({
            dimensions: newDimensions,
            relativePath: file.relativePath,
            name: file.name,
            url: file.url
        })
    }, [file, onLoad, calculateObjectFit])

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
                        className="group relative w-full h-full overflow-hidden border bg-muted hover:bg-muted/80 transition-colors cursor-pointer text-xs"
                        onClick={onClick}
                    >
                        {/* 图片预览容器 */}
                        <div className="w-full h-full relative flex items-center justify-center bg-black/5">
                            <img
                                ref={imageRef}
                                src={file.url}
                                alt={file.name}
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
                            <div className="hidden absolute inset-0 flex items-center justify-center">
                                <Image className="h-6 w-6 text-muted-foreground" />
                            </div>
                        </div>

                        {/* 图片信息面板 */}
                        <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/50">
                            <div className="space-y-0.5">
                                <p className="text-[10px] text-white font-medium truncate">
                                    {file.name}
                                </p>
                                <div className="flex items-center justify-between text-[9px] text-white/80">
                                    <span>{formatFileSize(file.size)}</span>
                                    <span>{formatDimensions(dimensions.width, dimensions.height)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="text-xs space-y-1">
                        <p className="text-muted-foreground">
                            修改于 {formatLastModified(file.lastModified)}
                        </p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
} 