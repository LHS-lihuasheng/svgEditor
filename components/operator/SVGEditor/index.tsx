"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useDrop } from 'react-dnd'
import type { Component } from '@/types/atomicComponent'
import { COMPONENT_TEMPLATES } from '@/types/atomicComponent'
import { generateCode } from "@/utils/code-generator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { SideBarMenu } from "./sideBarMenu/index"
import { EditorArea } from "./EditorArea"
import { useAssets } from '@/contexts/AssetContext'
import { MenuBarProvider } from '@/contexts/MenuBarContext'


interface DragItem {
  type: Component['type']
  id: string
  isToolItem: boolean
  index?: number
  parentId?: string | null
  size: {
    width: number
    height: number
  }
}

export default function SVGEditor() {
  const [components, setComponents] = useState<Component[]>([])
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [showCodePreview, setShowCodePreview] = useState(false)
  const { getOrderedSelectedImages, imageAssets } = useAssets()
  const dropRef = useRef<HTMLDivElement>(null)

  const generateUniqueId = (type: Component['type'], components: Component[]): string => {
    const baseId = `${type}-${Date.now()}`
    let id = baseId
    let counter = 1

    const isIdExists = (comps: Component[], checkId: string): boolean => {
      return comps.some(comp => {
        if (comp.id === checkId) return true
        if (comp.children) return isIdExists(comp.children, checkId)
        return false
      })
    }

    while (isIdExists(components, id)) {
      id = `${baseId}-${counter}`
      counter++
    }

    return id
  }

  const handleAddComponent = useCallback((type: Component['type'], position: { x: number; y: number }) => {
    setComponents(prev => {
      const newComponent = {
        id: generateUniqueId(type, prev),
        type,
        position,
        size: { width: 100, height: 100 },
        ...(type === 'svg' && {
          viewBox: '0 0 100 100',
        }),
        ...(type === 'section' && {
          style: {
            height: '0px',
            lineHeight: '0',
            pointerEvents: 'none',
          }
        })
      } as Component

      return [...prev, newComponent]
    })
  }, [])

  const handleComponentUpdate = useCallback((updated: Component) => {
    setComponents(prev =>
      prev.map(c => c.id === updated.id ? updated : c)
    )
  }, [])

  const [, drop] = useDrop<DragItem, void, any>(() => ({
    accept: ['TOOL', 'COMPONENT'],
    drop: (item, monitor) => {
      if (monitor.didDrop()) return

      const editorElement = document.getElementById('editor-area')
      if (!editorElement) return

      const editorRect = editorElement.getBoundingClientRect()
      const offset = monitor.getClientOffset()
      if (!offset) return

      const x = offset.x - editorRect.left
      const y = offset.y - editorRect.top

      if (item.isToolItem) {
        handleAddComponent(item.type, {
          x: Math.max(0, Math.min(x, editorRect.width - 100)),
          y: Math.max(0, Math.min(y, editorRect.height - 100))
        })
      } else {
        setComponents(prev => {
          const [movedComponent] = findComponentById(prev, item.id)
          if (!movedComponent) return prev

          const newComponents = removeComponent(prev, item.id)

          return [...newComponents, {
            ...movedComponent,
            position: {
              x: Math.max(0, Math.min(x, editorRect.width - 100)),
              y: Math.max(0, Math.min(y, editorRect.height - 100))
            }
          }]
        })
      }
    }
  }), [handleAddComponent])

  drop(dropRef)

  const moveComponent = useCallback((dragIndex: number, hoverIndex: number, parentId: string | null = null) => {
    setComponents(prevComponents => {
      if (parentId) {
        return prevComponents.map(comp => {
          if (comp.id === parentId && comp.children) {
            const newChildren = [...comp.children]
            const [removed] = newChildren.splice(dragIndex, 1)
            newChildren.splice(hoverIndex, 0, removed)
            return { ...comp, children: newChildren }
          }
          return comp
        })
      } else {
        const newComponents = [...prevComponents]
        const [removed] = newComponents.splice(dragIndex, 1)
        newComponents.splice(hoverIndex, 0, removed)
        return newComponents
      }
    })
  }, [])

  const findComponentById = (components: Component[], id: string): [Component | undefined, Component[] | undefined] => {
    if (!Array.isArray(components)) return [undefined, undefined]

    for (const component of components) {
      if (!component || typeof component !== 'object') continue

      if (component.id === id) {
        return [component, components]
      }
      if (Array.isArray(component.children)) {
        const [found, parentArray] = findComponentById(component.children, id)
        if (found) {
          return [found, parentArray]
        }
      }
    }
    return [undefined, undefined]
  }

  const removeComponent = (components: Component[], id: string): Component[] => {
    if (!Array.isArray(components)) return []

    return components
      .filter((comp): comp is Component => {
        if (!comp || typeof comp !== 'object') {
          console.warn('Invalid component found:', comp)
          return false
        }
        return true
      })
      .map(comp => {
        if (Array.isArray(comp.children)) {
          return {
            ...comp,
            children: removeComponent(comp.children, id)
          }
        }
        return comp
      })
      .filter(comp => comp.id !== id)
  }

  const handleDrop = useCallback((item: DragItem, targetId: string | null = null) => {
    if (item.isToolItem) {
      const template = COMPONENT_TEMPLATES[item.type]
      if (!template) {
        console.error(`Template not found for type: ${item.type}`)
        return
      }

      setComponents(prev => {
        const newComponent: Component = {
          id: generateUniqueId(item.type, prev),
          type: item.type,
          position: { x: 0, y: 0 },
          size: { width: '100%', height: 'auto' },
          code: template.code,
          children: []
        }

        if (targetId) {
          return updateComponentTree(prev, targetId, newComponent)
        } else {
          return [...prev, newComponent]
        }
      })
    } else {
      setComponents(prev => {
        const [movedComponent] = findComponentById(prev, item.id)
        if (!movedComponent) return prev

        const template = COMPONENT_TEMPLATES[movedComponent.type]
        if (!template) {
          console.error(`Template not found for type: ${movedComponent.type}`)
          return prev
        }

        const componentToMove: Component = {
          ...movedComponent,
          position: { x: 0, y: 0 },
          code: template.code,
          children: Array.isArray(movedComponent.children) ? [...movedComponent.children] : []
        }

        if (targetId === item.id || isDescendant(componentToMove, targetId)) {
          return prev
        }

        const newComponents = removeComponent(prev, item.id)
        if (targetId) {
          return updateComponentTree(newComponents, targetId, componentToMove)
        } else {
          return [...newComponents, componentToMove]
        }
      })
    }
  }, [])

  const isDescendant = (component: Component, targetId: string | null): boolean => {
    if (!targetId || !component || typeof component !== 'object') return false
    if (!Array.isArray(component.children)) return false

    return component.children.some(child => {
      if (!child || typeof child !== 'object') return false
      return child.id === targetId || isDescendant(child, targetId)
    })
  }

  const updateComponentTree = (components: Component[], targetId: string, movedComponent: Component): Component[] => {
    if (!Array.isArray(components)) return []

    return components
      .filter((comp): comp is Component => {
        if (!comp || typeof comp !== 'object') {
          console.warn('Invalid component found:', comp)
          return false
        }
        return true
      })
      .map(comp => {
        if (comp.id === targetId) {
          const template = COMPONENT_TEMPLATES[movedComponent.type]
          if (!template) return comp

          return {
            ...comp,
            children: [...(Array.isArray(comp.children) ? comp.children : []), {
              ...movedComponent,
              position: { x: 0, y: 0 },
              code: template.code
            }]
          }
        }
        if (Array.isArray(comp.children)) {
          return {
            ...comp,
            children: updateComponentTree(comp.children, targetId, movedComponent)
          }
        }
        return comp
      })
  }

  const handleDelete = useCallback((id: string) => {
    setComponents(prev => {
      const removeComponentAndChildren = (components: Component[]): Component[] => {
        return components.filter(comp => {
          if (comp.id === id) return false
          if (comp.children) {
            comp.children = removeComponentAndChildren(comp.children)
          }
          return true
        })
      }

      return removeComponentAndChildren(prev)
    })

    if (selectedComponent?.id === id) {
      setSelectedComponent(null)
    }
  }, [selectedComponent])

  const handleAddImages = useCallback((targetId: string) => {
    const orderedImages = getOrderedSelectedImages()

    const validImages = orderedImages.filter(img => {
      if (!img) return false
      if (!imageAssets.has(img.relativePath)) {
        console.error('路径不存在:', img.relativePath)
        return false
      }
      return true
    })

    const newComponents = validImages
      .map((image, index) => ({
        id: generateUniqueId('svg', components),
        type: 'svg' as const,
        position: { x: 0, y: index * 20 },
        size: image.dimensions,
        viewBox: `0 0 ${image.dimensions.width} ${image.dimensions.height}`,
        backgroundImage: image.url,
        code: `<svg style="background-image:url('${image.relativePath}');background-size:cover" viewBox="0 0 ${image.dimensions.width} ${image.dimensions.height}"/>`
      }))

    setComponents(prev => {
      const targetIndex = prev.findIndex(comp => comp.id === targetId)
      if (targetIndex === -1) return prev

      const updated = [...prev]
      updated.splice(targetIndex + 1, 0, ...newComponents)
      return updated
    })
  }, [getOrderedSelectedImages, components, imageAssets])

  return (
    <MenuBarProvider>
      <div className="h-full flex bg-gray-50">
        <SideBarMenu
          onAddComponent={handleAddComponent}
        />
        <EditorArea
          dropRef={dropRef}
          components={components}
          selectedComponent={selectedComponent}
          onSelect={setSelectedComponent}
          onDrop={handleDrop}
          onMove={moveComponent}
          onUpdate={handleComponentUpdate}
          onDelete={handleDelete}
          onShowCodePreview={() => setShowCodePreview(true)}
          onAddImages={handleAddImages}
        />
        <Dialog open={showCodePreview} onOpenChange={setShowCodePreview}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>完整代码预览</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <pre className="p-4 bg-gray-50 rounded-lg">
                <code className="text-sm text-gray-700 whitespace-pre-wrap break-all">
                  {generateCode(components)}
                </code>
              </pre>
            </ScrollArea>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCodePreview(false)}
              >
                关闭
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MenuBarProvider>
  )
}