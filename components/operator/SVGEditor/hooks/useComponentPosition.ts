interface Position {
  x: number
  y: number
}

export function useComponentPosition(imageRatio: ImageRatio) {
  // 将画布坐标转换为 SVG 坐标
  const canvasToSVG = useCallback((position: Position) => {
    return {
      x: (position.x / 100) * imageRatio.width,
      y: (position.y / 100) * imageRatio.height
    }
  }, [imageRatio])

  // 将 SVG 坐标转换为画布坐标
  const SVGToCanvas = useCallback((position: Position) => {
    return {
      x: (position.x / imageRatio.width) * 100,
      y: (position.y / imageRatio.height) * 100
    }
  }, [imageRatio])

  return { canvasToSVG, SVGToCanvas }
} 