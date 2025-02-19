"use client"

import { useEffect, useState, useRef } from "react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import type { FileEntry } from "@/utils/fileSystem"
import { Image } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImagePreviewProps {
    file: FileEntry
    onClick?: () => void
}

interface ImageDimensions {
    width: number
    height: number
}

export function ImagePreview({ file, onClick }: ImagePreviewProps) {
    const [dimensions, setDimensions] = useState<ImageDimensions>({ width: 0, height: 0 })
    const [objectFit, setObjectFit] = useState<'contain' | 'cover'>('contain')
    const containerRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)

    // 监听图片加载完成，获取实际尺寸
    useEffect(() => {
        const image = imageRef.current
        if (!image) return

        const handleLoad = () => {
            const { naturalWidth, naturalHeight } = image
            setDimensions({ width: naturalWidth, height: naturalHeight })

            // 获取容器尺寸
            const container = containerRef.current
            if (container) {
                const { width, height } = container.getBoundingClientRect()
                const containerRatio = width / height
                const imageRatio = naturalWidth / naturalHeight

                // 根据容器和图片的宽高比决定填充方式
                setObjectFit(imageRatio > containerRatio ? 'contain' : 'cover')
            }
        }

        image.addEventListener('load', handleLoad)
        return () => image.removeEventListener('load', handleLoad)
    }, [file.url])

    // 格式化文件大小
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    // 格式化最后修改时间
    const formatLastModified = (timestamp: number) => {
        return formatDistanceToNow(new Date(timestamp), {
            addSuffix: true,
            locale: zhCN
        })
    }

    // 格式化尺寸显示
    const formatDimensions = (width: number, height: number) => {
        return `${width} × ${height}`
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        ref={containerRef}
                        className="group relative aspect-square rounded-md overflow-hidden border bg-muted hover:bg-muted/80 transition-colors cursor-pointer text-xs"
                        onClick={onClick}
                    >
                        {/* 图片预览 */}
                        <div className="w-full h-full relative flex items-center justify-center bg-black/5">
                            <img
                                ref={imageRef}
                                src={file.url}
                                alt={file.name}
                                className={cn(
                                    "max-w-full max-h-full transition-all duration-200",
                                    objectFit === 'contain' ? 'object-contain' : 'object-cover'
                                )}
                                style={{
                                    width: objectFit === 'contain' ? 'auto' : '100%',
                                    height: objectFit === 'contain' ? '100%' : 'auto'
                                }}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                }}
                            />
                            <div className="hidden absolute inset-0 flex items-center justify-center">
                                <Image className="h-6 w-6 text-muted-foreground" />
                            </div>
                        </div>

                        {/* 图片信息 */}
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