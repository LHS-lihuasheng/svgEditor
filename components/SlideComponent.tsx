"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react"
import type { SlideComponent as SlideComponentType, SlideElement } from "@/types/editor"

interface SlideComponentProps {
  component: SlideComponentType
  onUpdate: (component: SlideComponentType) => void
  onDelete?: () => void
}

export default function SlideComponent({ component, onUpdate, onDelete }: SlideComponentProps) {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleImageUpload = async () => {
    try {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "image/*"
      input.multiple = true

      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files
        if (!files) return

        const newElements: SlideElement[] = []

        for (const file of Array.from(files)) {
          const reader = new FileReader()

          const element = await new Promise<SlideElement>((resolve) => {
            reader.onload = (e) => {
              const img = new Image()
              img.onload = () => {
                resolve({
                  id: `image-${Date.now()}-${Math.random()}`,
                  type: "image",
                  src: e.target?.result as string,
                  width: img.width,
                  height: img.height,
                  x: 0,
                  y: 0,
                })
              }
              img.src = e.target?.result as string
            }
            reader.readAsDataURL(file)
          })

          newElements.push(element)
        }

        onUpdate({
          ...component,
          elements: [...component.elements, ...newElements],
        })
      }

      input.click()
    } catch (error) {
      console.error("Error uploading images:", error)
    }
  }

  const handleDeleteImage = (elementId: string) => {
    onUpdate({
      ...component,
      elements: component.elements.filter((el) => el.id !== elementId),
    })
  }

  return (
    <div className="relative bg-white rounded-lg">
      {onDelete && (
        <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 z-10" onClick={onDelete}>
          <X className="h-4 w-4" />
        </Button>
      )}

      <section className="overflow-hidden -mt-[1px]">
        <section
          ref={sliderRef}
          className="box-border flex flex-row overflow-x-auto overflow-y-hidden w-full overscroll-behavior-auto snap-x snap-mandatory"
          style={{
            perspective: "1px",
            transformStyle: "preserve-3d",
          }}
        >
          {component.elements.length > 0 ? (
            component.elements.map((element) => (
              <section
                key={element.id}
                className="box-border w-full m-0 flex flex-none flex-col snap-center snap-always"
              >
                <section>
                  <section className="box-border w-full h-auto" style={{ transform: "translateZ(0) scale(1)" }}>
                    <div className="relative">
                      <img src={element.src || "/placeholder.svg"} alt="" className="w-full h-auto" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                        onClick={() => handleDeleteImage(element.id)}
                      >
                        <X className="h-3 w-3 text-white" />
                      </Button>
                    </div>
                  </section>
                </section>
              </section>
            ))
          ) : (
            <div className="flex items-center justify-center w-full min-h-[200px] border-2 border-dashed border-gray-200 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <Button variant="ghost" size="icon" className="h-12 w-12" onClick={handleImageUpload}>
                  <Plus className="h-6 w-6" />
                </Button>
                <span className="text-sm text-gray-500">添加图片</span>
              </div>
            </div>
          )}
        </section>
      </section>

      {component.elements.length > 0 && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
          <Button
            variant="ghost"
            size="icon"
            className="pointer-events-auto bg-black/50 hover:bg-black/70"
            onClick={() => {
              sliderRef.current?.scrollBy({ left: -sliderRef.current.clientWidth, behavior: "smooth" })
            }}
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="pointer-events-auto bg-black/50 hover:bg-black/70"
            onClick={() => {
              sliderRef.current?.scrollBy({ left: sliderRef.current.clientWidth, behavior: "smooth" })
            }}
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </Button>
        </div>
      )}
    </div>
  )
}

