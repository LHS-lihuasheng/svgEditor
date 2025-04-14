"use client"

import { useEffect, useMemo, useRef } from "react"
import { useImmer } from "use-immer"
import { useInView } from "react-intersection-observer"
import { ImagePreview } from "./ImagePreview"
import type { ImageAsset, ImageItem } from "@/types/asset"
import { naturalSortCompare } from "@/utils/assetUtils"
import _ from "lodash"

interface MasonryGalleryProps {
  assets: ImageAsset[]
  selectedImagePaths: string[]
  onSelectImage: (path: string) => void
  columnsCount?: number
}

interface GalleryState {
  images: ImageItem[]
  columns: ImageItem[][]
  containerWidth: number
  visibleCount: number
  columnHeights: number[]
}

const INITIAL_VISIBLE_COUNT = 10
const LOAD_MORE_COUNT = 10

export function MasonryGallery({
  assets,
  selectedImagePaths,
  onSelectImage,
  columnsCount = 2
}: MasonryGalleryProps) {
  const [state, updateState] = useImmer<GalleryState>({
    images: [],
    columns: Array(columnsCount).fill(0).map(() => []),
    containerWidth: 0,
    visibleCount: INITIAL_VISIBLE_COUNT,
    columnHeights: Array(columnsCount).fill(0)
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const columnWidth = useMemo(() => state.containerWidth > 0 ? state.containerWidth / columnsCount : 0, [state.containerWidth, columnsCount])
  const MIN_IMAGE_HEIGHT = useMemo(() => 120, [])
  const preVisibleCount = useRef(0)
  const lastInViewRef = useRef(false);

  const { ref: observerRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  //处理容器宽度变化
  useEffect(() => {
    if (!containerRef.current) return

    const updateContainerWidth = () => {
      const newWidth = containerRef.current?.clientWidth || 0
      if (newWidth > 0 && newWidth !== state.containerWidth) {
        updateState(draft => {
          draft.containerWidth = newWidth
          const newColumnWidth = newWidth / columnsCount
          draft.images = draft.images.map(img => ({
            ...img,
            realHeight: Math.max(newColumnWidth / img.dimensions.width * img.dimensions.height, MIN_IMAGE_HEIGHT),
          }))

          const newColumnHeights = Array(columnsCount).fill(0);
          draft.columns.forEach((column, index) => {
            newColumnHeights[index] = column.reduce((sum, img) => {
              const updatedImg = draft.images.find(i => i.relativePath === img.relativePath);
              return sum + (updatedImg?.realHeight || MIN_IMAGE_HEIGHT);
            }, 0);
          });
          draft.columnHeights = newColumnHeights;
        })
      } else if (newWidth > 0 && state.containerWidth === 0) {
        updateState(draft => {
          draft.containerWidth = newWidth
          if (draft.images.length > 0) {
            const initialColumnWidth = newWidth / columnsCount;
            draft.images = draft.images.map(img => ({
              ...img,
              realHeight: Math.max(initialColumnWidth / img.dimensions.width * img.dimensions.height, MIN_IMAGE_HEIGHT),
            }))
          }
          if (draft.columnHeights.length !== columnsCount) {
            draft.columnHeights = Array(columnsCount).fill(0);
          }
        })
      }
    }

    updateContainerWidth()
    const debouncedUpdateContainerWidth = _.debounce(updateContainerWidth, 300)
    window.addEventListener('resize', debouncedUpdateContainerWidth)
    return () => { window.removeEventListener('resize', updateContainerWidth) }
  }, [columnsCount, MIN_IMAGE_HEIGHT, updateState, state.containerWidth, state.columns, state.images.length])

  //处理资源变化
  useEffect(() => {
    if (columnWidth <= 0 && assets.length > 0) return

    const sortedAssets = [...assets].sort((a, b) =>
      naturalSortCompare(a.name, b.name)
    )

    updateState(draft => {
      if (draft.images.length !== sortedAssets.length || draft.images[0]?.relativePath !== sortedAssets[0]?.relativePath) {
        draft.images = sortedAssets.map(asset => ({
          ...asset,
          realHeight: columnWidth > 0 ? Math.max(columnWidth / asset.dimensions.width * asset.dimensions.height, MIN_IMAGE_HEIGHT) : MIN_IMAGE_HEIGHT,
        }))
        draft.columns = Array(columnsCount).fill(0).map(() => [])
        draft.visibleCount = INITIAL_VISIBLE_COUNT
        draft.columnHeights = Array(columnsCount).fill(0)
        preVisibleCount.current = 0
        lastInViewRef.current = false;
      }
    })
  }, [assets, columnWidth, columnsCount, MIN_IMAGE_HEIGHT, updateState])

  //处理新增图片分配
  useEffect(() => {
    if (state.columns.length !== columnsCount || state.columnHeights.length !== columnsCount) {
      if (containerRef.current?.clientWidth) {
        updateState(draft => {
          draft.containerWidth = containerRef.current?.clientWidth || 0
          draft.columns = Array(columnsCount).fill(0).map(() => [])
          draft.columnHeights = Array(columnsCount).fill(0)
          preVisibleCount.current = 0
          const newColumnWidth = draft.containerWidth / columnsCount;
          draft.images = draft.images.map(img => ({
            ...img,
            realHeight: Math.max(newColumnWidth / img.dimensions.width * img.dimensions.height, MIN_IMAGE_HEIGHT),
          }));
          draft.visibleCount = INITIAL_VISIBLE_COUNT;
        });
      }
      return;
    }

    if (state.images.length === 0 || columnWidth <= 0) {
      return;
    }

    const startIndex = preVisibleCount.current
    const endIndex = Math.min(state.visibleCount, state.images.length);

    if (startIndex < endIndex) {
      const imagesToProcess = state.images.slice(startIndex, endIndex)

      if (imagesToProcess.length > 0) {
        updateState(draft => {
          const currentColumnHeights = draft.columnHeights;

          imagesToProcess.forEach((image) => {
            const minHeight = Math.min(...currentColumnHeights)
            let minHeightIndex = currentColumnHeights.indexOf(minHeight)

            if (minHeightIndex < 0 || minHeightIndex >= columnsCount) {
              minHeightIndex = 0
            }

            if (draft.columns[minHeightIndex]) {
              const imageHeight = image.realHeight || MIN_IMAGE_HEIGHT;
              draft.columns[minHeightIndex].push(image)
              draft.columnHeights[minHeightIndex] += imageHeight
            } else {
              console.warn(`MasonryGallery: 尝试添加图片到不存在的列索引: ${minHeightIndex}`);
            }
          })
        })
        preVisibleCount.current = endIndex
      }
    }
  }, [state.images, state.visibleCount, columnWidth, columnsCount, MIN_IMAGE_HEIGHT, updateState, state.columnHeights])

  // 处理懒加载
  useEffect(() => {
    if (inView && !lastInViewRef.current && state.visibleCount < state.images.length) {
      updateState(draft => {
        draft.visibleCount = Math.min(draft.visibleCount + LOAD_MORE_COUNT, state.images.length)
      })
    }
    lastInViewRef.current = inView;
  }, [inView, state.images.length, state.visibleCount, updateState])

  return (
    <div ref={containerRef} className="w-full">
      {columnWidth > 0 && state.columns.length === columnsCount && (
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
                    minHeight={MIN_IMAGE_HEIGHT}
                    onClick={() => onSelectImage(image.relativePath)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      )}

      <div
        ref={observerRef}
        className="h-10 w-full mt-4 flex items-center justify-center"
      >
        {state.visibleCount < state.images.length && (
          <div className="text-muted-foreground text-sm">
            {inView ? '加载更多...' : ''}
          </div>
        )}
      </div>
    </div>
  )
} 