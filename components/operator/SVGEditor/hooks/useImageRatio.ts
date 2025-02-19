interface ImageRatio {
  width: number
  height: number
  ratio: number
}

export function useImageRatio() {
  const [imageRatio, setImageRatio] = useState<ImageRatio>({
    width: 0,
    height: 0,
    ratio: 1
  })

  const updateImageRatio = useCallback(async (imageUrl: string) => {
    return new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => {
        setImageRatio({
          width: img.naturalWidth,
          height: img.naturalHeight,
          ratio: img.naturalWidth / img.naturalHeight
        })
        resolve()
      }
      img.src = imageUrl
    })
  }, [])

  return { imageRatio, updateImageRatio }
} 