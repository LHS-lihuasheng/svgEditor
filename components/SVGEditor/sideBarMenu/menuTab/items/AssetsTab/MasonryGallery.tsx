"use client"

import { useEffect, useRef } from "react"
import { useImmer } from "use-immer"
import { useInView } from "react-intersection-observer"
import { ImagePreview } from "./ImagePreview"
import type { ImageAsset, ImageItem } from "@/types/asset"
import { naturalSortCompare } from "@/utils/assetUtils"

// 接口定义
interface MasonryGalleryProps {
  assets: ImageAsset[]
  selectedImagePaths: string[]
  onSelectImage: (path: string) => void
  columnsCount?: number
}

// 画廊状态接口
interface GalleryState {
  images: ImageItem[]
  columns: ImageItem[][]
  containerWidth: number
  visibleCount: number
}

export function MasonryGallery({
  assets,
  selectedImagePaths,
  onSelectImage,
  columnsCount = 2
}: MasonryGalleryProps) {
  // 使用 useImmer 管理状态
  const [state, updateState] = useImmer<GalleryState>({
    images: [],
    columns: Array(columnsCount).fill([]).map(() => []),
    containerWidth: 0,
    visibleCount: 10
  })

  // 引用
  const containerRef = useRef<HTMLDivElement>(null)

  // 计算值
  const columnWidth = state.containerWidth / columnsCount

  // 确保信息栏完整展示的最小高度
  const MIN_IMAGE_HEIGHT = 120

  const { ref: observerRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  // 计算容器宽度
  useEffect(() => {
    if (!containerRef.current) return

    const updateWidth = () => {
      updateState(draft => {
        draft.containerWidth = containerRef.current?.clientWidth || 0
      })
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [updateState])

  // 初始化图片数据 - 使用自然排序
  useEffect(() => {
    const sortedAssets = [...assets].sort((a, b) =>
      naturalSortCompare(a.name, b.name)
    )

    updateState(draft => {
      draft.images = sortedAssets.map(asset => ({
        ...asset,
        height: 0,
        loaded: false,
        visible: false
      }))
    })
  }, [assets, updateState])

  // 逐步显示图片
  useEffect(() => {
    if (state.images.length === 0) return
    let timeout: NodeJS.Timeout

    const showImages = () => {
      updateState(draft => {
        const firstInvisibleIndex = draft.images.findIndex(img => !img.visible)
        if (firstInvisibleIndex !== -1) {
          draft.images[firstInvisibleIndex].visible = true
        }
      })

      const hasInvisibleImages = state.images.some(img => !img.visible)
      if (hasInvisibleImages) {
        timeout = setTimeout(showImages, 50)
      }
    }

    timeout = setTimeout(showImages, 0)
    return () => clearTimeout(timeout)
  }, [state.images.length, updateState, state.images])

  // 懒加载更多图片
  useEffect(() => {
    if (inView && state.visibleCount < state.images.length) {
      updateState(draft => {
        draft.visibleCount = Math.min(draft.visibleCount + 10, draft.images.length)
      })
    }
  }, [inView, state.images.length, state.visibleCount, updateState])

  // 当图片加载完成时更新高度
  const handleImageLoad = (index: number, dimensions: { width: number; height: number }) => {
    updateState(draft => {
      if (!draft.images[index]) return

      const aspectRatio = dimensions.width / dimensions.height
      const calculatedHeight = columnWidth / aspectRatio
      const finalHeight = Math.max(calculatedHeight, MIN_IMAGE_HEIGHT)

      draft.images[index].height = finalHeight
      draft.images[index].loaded = true
    })
  }

  // 分配图片到最短的列
  useEffect(() => {
    if (state.images.length === 0 || columnWidth <= 0) return

    const columnHeights = Array(columnsCount).fill(0)
    const newColumns: ImageItem[][] = Array(columnsCount).fill([]).map(() => [])
    const imagesToProcess = state.images.slice(0, state.visibleCount)

    for (const image of imagesToProcess) {
      const minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights))
      newColumns[minHeightIndex].push(image)
      columnHeights[minHeightIndex] += image.loaded ? image.height : MIN_IMAGE_HEIGHT
    }

    updateState(draft => {
      draft.columns = newColumns
    })
  }, [state.images, columnWidth, columnsCount, state.visibleCount, updateState])

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex gap-2">
        {state.columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex-1 flex flex-col gap-2">
            {column.map((image) => {
              const isSelected = selectedImagePaths.includes(image.relativePath)

              return (
                <ImagePreview
                  key={image.relativePath}
                  asset={image}
                  isSelected={isSelected}
                  height={image.loaded ? image.height : 'auto'}
                  minHeight={MIN_IMAGE_HEIGHT}
                  columnWidth={columnWidth}
                  isVisible={image.visible}
                  onLoad={(dimensions) => handleImageLoad(
                    state.images.indexOf(image),
                    dimensions
                  )}
                  onClick={() => onSelectImage(image.relativePath)}
                  onCheckboxClick={(e) => {
                    e.stopPropagation();
                    onSelectImage(image.relativePath);
                  }}
                />
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
        {state.visibleCount < state.images.length && inView && (
          <div className="animate-pulse text-muted-foreground text-sm">
            加载更多...
          </div>
        )}
      </div>
    </div>
  )
} 