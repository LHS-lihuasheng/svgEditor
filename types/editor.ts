export type SlideElement = {
  id: string
  type: "image"
  src: string
  width: number
  height: number
  x: number
  y: number
}

export type SlideComponent = {
  id: string
  type: "slide"
  elements: SlideElement[]
  activeIndex: number
}

export type EditorElement = SlideComponent

