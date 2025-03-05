"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"
import type { FileEntry } from "@/utils/file-utils"
import { ImagePreview } from "./ImagePreview"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { normalizeAssetPath } from "@/utils/pathUtils"

interface MasonryGalleryProps {
  files: FileEntry[]
  selectedImagePaths: string[]
  onSelectImage: (path: string) => void
  columnsCount?: number
}

interface ImageItem extends FileEntry {
  height: number
  loaded: boolean
  visible: boolean
}

/**
 * 自然排序比较函数 - 按照人类直觉对数字进行排序
 * 如：1, 2, 3, 10, 11, 12 而不是 1, 10, 11, 12, 2, 3
 */
function naturalSortCompare(a: string, b: string): number {
  // 正则表达式提取字符串中的数字和非数字部分
  const chunksRegExp = /(^\d+|\d+$|\d+(?=\D)|\D+)/g;
  const chunksA = a.match(chunksRegExp) || [];
  const chunksB = b.match(chunksRegExp) || [];

  // 比较每一部分
  const maxLength = Math.max(chunksA.length, chunksB.length);
  for (let i = 0; i < maxLength; i++) {
    // 如果其中一个字符串已经没有更多部分，则较短者排在前面
    if (i >= chunksA.length) return -1;
    if (i >= chunksB.length) return 1;

    const chunkA = chunksA[i];
    const chunkB = chunksB[i];

    // 检查是否都是数字部分
    const numA = /^\d+$/.test(chunkA) ? parseInt(chunkA, 10) : NaN;
    const numB = /^\d+$/.test(chunkB) ? parseInt(chunkB, 10) : NaN;

    if (!isNaN(numA) && !isNaN(numB)) {
      // 如果两部分都是数字，按数值比较
      if (numA !== numB) {
        return numA - numB;
      }
    } else {
      // 如果不是数字，则按字符串比较
      const comparison = chunkA.localeCompare(chunkB, 'zh-CN');
      if (comparison !== 0) {
        return comparison;
      }
    }
  }

  return 0;
}

export function MasonryGallery({
  files,
  selectedImagePaths,
  onSelectImage,
  columnsCount = 2
}: MasonryGalleryProps) {
  const [images, setImages] = useState<ImageItem[]>([])
  const [columns, setColumns] = useState<ImageItem[][]>(Array(columnsCount).fill([]).map(() => []))
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const columnWidth = containerWidth / columnsCount
  const [visibleCount, setVisibleCount] = useState(10)

  // 确保信息栏完整展示的最小高度
  const MIN_IMAGE_HEIGHT = 120

  // 使用 IntersectionObserver 进行懒加载
  const { ref: observerRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  // 计算容器宽度
  useEffect(() => {
    if (containerRef.current) {
      const updateWidth = () => {
        setContainerWidth(containerRef.current?.clientWidth || 0)
      }

      updateWidth()
      window.addEventListener('resize', updateWidth)
      return () => window.removeEventListener('resize', updateWidth)
    }
  }, [])

  // 初始化图片数据 - 使用自然排序
  useEffect(() => {
    // 复制文件数组并按自然顺序排序
    const sortedFiles = [...files].sort((a, b) => {
      // 使用自然排序比较函数
      return naturalSortCompare(a.name, b.name)
    })

    setImages(sortedFiles.map(file => ({
      ...file,
      height: 0,
      loaded: false,
      visible: false
    })))
  }, [files])

  // 当浏览器空闲时逐步显示图片以创建流畅的过渡效果
  useEffect(() => {
    if (images.length === 0) return

    let timeout: NodeJS.Timeout

    const showImages = () => {
      setImages(prev => {
        // 查找第一个不可见的图片
        const firstInvisibleIndex = prev.findIndex(img => !img.visible)
        if (firstInvisibleIndex === -1) return prev // 所有图片都已可见

        // 创建新数组，使特定索引的图片可见
        const newImages = [...prev]
        newImages[firstInvisibleIndex] = {
          ...newImages[firstInvisibleIndex],
          visible: true
        }

        return newImages
      })

      // 检查是否仍有不可见的图片
      const hasInvisibleImages = images.some(img => !img.visible)
      if (hasInvisibleImages) {
        // 延迟显示下一张图片（创建级联效果）
        timeout = setTimeout(showImages, 50)
      }
    }

    // 开始显示过程
    timeout = setTimeout(showImages, 0)

    // 清理
    return () => clearTimeout(timeout)
  }, [images.length])

  // 懒加载更多图片
  useEffect(() => {
    if (inView && visibleCount < images.length) {
      // 当用户滚动到底部时，增加可见图片数量
      setVisibleCount(prev => Math.min(prev + 10, images.length))
    }
  }, [inView, images.length])

  // 当图片加载完成时更新高度
  const handleImageLoad = (index: number, dimensions: { width: number; height: number }) => {
    setImages(prev => {
      const newImages = [...prev]
      if (newImages[index]) {
        // 根据容器宽度计算图片高度，保持原始比例
        const aspectRatio = dimensions.width / dimensions.height
        const calculatedHeight = columnWidth / aspectRatio

        // 确保高度不低于最小高度（保证图片信息完整显示）
        const finalHeight = Math.max(calculatedHeight, MIN_IMAGE_HEIGHT)

        newImages[index] = {
          ...newImages[index],
          height: finalHeight,
          loaded: true
        }
      }
      return newImages
    })
  }

  // 分配图片到最短的列
  useEffect(() => {
    if (images.length > 0 && columnWidth > 0) {
      // 初始化列高度数组
      const columnHeights = Array(columnsCount).fill(0)
      const newColumns: ImageItem[][] = Array(columnsCount).fill([]).map(() => [])

      // 根据当前可见数量限制处理的图片
      const imagesToProcess = images.slice(0, visibleCount)

      // 按照列高度排序，始终将图片添加到最短的列
      for (let i = 0; i < imagesToProcess.length; i++) {
        const image = images[i]
        if (!image) continue

        // 找到高度最小的列
        const minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights))
        newColumns[minHeightIndex].push(image)

        // 更新该列的高度，确保未加载图片也有足够高度显示信息
        columnHeights[minHeightIndex] += image.loaded ? image.height : MIN_IMAGE_HEIGHT
      }

      setColumns(newColumns)
    }
  }, [images, columnWidth, columnsCount, visibleCount])

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex gap-2">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex-1 flex flex-col gap-2">
            {column.map((image, imageIndex) => {
              const normalizedPath = normalizeAssetPath(image.path)
              const isSelected = selectedImagePaths.includes(normalizedPath)

              return (
                <div
                  key={image.path}
                  data-image-path={normalizedPath}
                  className={cn(
                    "relative rounded-md overflow-hidden cursor-pointer",
                    "ring-1 ring-muted/20 hover:ring-2 hover:ring-primary/50",
                    isSelected && "ring-2 ring-primary",
                    "transition-all duration-300",
                    image.visible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
                  )}
                  style={{
                    height: image.loaded ? image.height : 'auto',
                    minHeight: MIN_IMAGE_HEIGHT // 确保信息栏完整显示
                  }}
                >
                  <ImagePreview
                    file={image}
                    onLoad={(info) => handleImageLoad(
                      images.indexOf(image),
                      info.dimensions
                    )}
                    onClick={() => onSelectImage(normalizedPath)}
                  />
                  <Checkbox
                    checked={isSelected}
                    className="absolute top-1 right-1 h-4 w-4 bg-background/95 z-10"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectImage(normalizedPath)
                    }}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* 懒加载触发器 */}
      <div
        ref={observerRef}
        className="h-10 w-full mt-4 flex items-center justify-center"
      >
        {visibleCount < images.length && inView && (
          <div className="animate-pulse text-muted-foreground text-sm">
            加载更多...
          </div>
        )}
      </div>
    </div>
  )
} 