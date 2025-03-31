"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"
import type { FileEntry } from "@/utils/file-utils"
import { ImagePreview } from "./ImagePreview"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { normalizeAssetPath } from "@/utils/pathUtils"

// 接口定义
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
 * 自然排序函数 - 数字部分按数值排序，文本部分按字符串排序
 */
function naturalSortCompare(a: string, b: string): number {
  return a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' });
}

export function MasonryGallery({
  files,
  selectedImagePaths,
  onSelectImage,
  columnsCount = 2
}: MasonryGalleryProps) {
  // 状态定义
  const [images, setImages] = useState<ImageItem[]>([])
  const [columns, setColumns] = useState<ImageItem[][]>(Array(columnsCount).fill([]).map(() => []))
  const [containerWidth, setContainerWidth] = useState(0)
  const [visibleCount, setVisibleCount] = useState(10)

  // 引用和计算值
  const containerRef = useRef<HTMLDivElement>(null)
  const columnWidth = containerWidth / columnsCount

  // 配置常量
  const MIN_IMAGE_HEIGHT = 120 // 确保信息栏完整展示的最小高度

  // 使用 IntersectionObserver 进行懒加载
  const { ref: observerRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  /**
   * 布局和响应式处理
   */
  // 计算容器宽度
  useEffect(() => {
    if (!containerRef.current) return

    const updateWidth = () => {
      setContainerWidth(containerRef.current?.clientWidth || 0)
    }

    // 初始更新和监听窗口大小变化
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // 初始化图片数据 - 使用自然排序
  useEffect(() => {
    // 复制文件数组并按自然顺序排序
    const sortedFiles = [...files].sort((a, b) =>
      naturalSortCompare(a.name, b.name)
    )

    // 转换为内部图片对象
    setImages(sortedFiles.map(file => ({
      ...file,
      height: 0,
      loaded: false,
      visible: false
    })))
  }, [files])

  /**
   * 图片显示与懒加载
   */
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

      // 检查是否仍有不可见的图片，继续级联显示
      const hasInvisibleImages = images.some(img => !img.visible)
      if (hasInvisibleImages) {
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

  /**
   * 图片布局处理
   */
  // 当图片加载完成时更新高度
  const handleImageLoad = (index: number, dimensions: { width: number; height: number }) => {
    setImages(prev => {
      const newImages = [...prev]
      if (!newImages[index]) return prev

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

      return newImages
    })
  }

  // 分配图片到最短的列（瀑布流核心逻辑）
  useEffect(() => {
    if (images.length === 0 || columnWidth <= 0) return

    // 初始化列高度数组和新列数据
    const columnHeights = Array(columnsCount).fill(0)
    const newColumns: ImageItem[][] = Array(columnsCount).fill([]).map(() => [])

    // 根据当前可见数量限制处理的图片
    const imagesToProcess = images.slice(0, visibleCount)

    // 按照"贪心"策略分配：将图片添加到当前最短的列
    for (const image of imagesToProcess) {
      // 找到高度最小的列
      const minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights))
      newColumns[minHeightIndex].push(image)

      // 更新该列的高度
      columnHeights[minHeightIndex] += image.loaded ? image.height : MIN_IMAGE_HEIGHT
    }

    setColumns(newColumns)
  }, [images, columnWidth, columnsCount, visibleCount])

  /**
   * 渲染瀑布流画廊
   */
  return (
    <div ref={containerRef} className="w-full">
      <div className="flex gap-2">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex-1 flex flex-col gap-2">
            {column.map((image) => {
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
                    minHeight: MIN_IMAGE_HEIGHT
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