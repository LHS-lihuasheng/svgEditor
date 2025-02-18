"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import SlideComponent from "./SlideComponent"
import type { EditorElement } from "@/types/editor"

export default function Canvas() {
  const [elements, setElements] = useState<EditorElement[]>([])

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    try {
      const componentData = JSON.parse(event.dataTransfer.getData("application/json"))
      setElements([...elements, componentData])
    } catch (error) {
      console.error("Error adding component:", error)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleUpdateElement = (id: string, updatedElement: EditorElement) => {
    setElements(elements.map((el) => (el.id === id ? updatedElement : el)))
  }

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id))
  }

  return (
    <div className="flex-1 bg-gray-100 p-4" onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className="bg-white rounded-lg h-full flex flex-col">
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-500 w-6 h-6 rounded-full flex items-center justify-center">
              {elements.length + 1}
            </span>
            <span className="text-blue-500">组件编辑区</span>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4">
          {elements.map((element) => {
            if (element.type === "slide") {
              return (
                <SlideComponent
                  key={element.id}
                  component={element}
                  onUpdate={(updated) => handleUpdateElement(element.id, updated)}
                  onDelete={() => handleDeleteElement(element.id)}
                />
              )
            }
            return null
          })}

          {elements.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <Button variant="ghost" className="flex-col gap-2">
                <Plus className="h-8 w-8" />
                <span className="text-gray-400 text-sm">点击左侧组件或拖动至此以继续添加</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

