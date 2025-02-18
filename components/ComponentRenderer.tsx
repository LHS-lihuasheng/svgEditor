"use client"

import { useDrag } from 'react-dnd'
import type { Component } from "@/types/svg-editor"
import { useRef } from 'react'

interface ComponentRendererProps {
  component: Component
  isSelected?: boolean
  isDragging?: boolean
  onSelect?: (component: Component) => void
}

export function ComponentRenderer({ 
  component,
  isSelected,
  isDragging: externalIsDragging,
  onSelect
}: ComponentRendererProps) {
  const elementRef = useRef(null)
  const [{ isDragging }, drag] = useDrag<Component, unknown, { isDragging: boolean }>(() => ({
    type: 'COMPONENT',
    item: component,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))

  drag(elementRef)

  const style: React.CSSProperties = {
    position: 'absolute',
    left: component.position.x,
    top: component.position.y,
    width: typeof component.size.width === 'number' ? component.size.width : 100,
    height: typeof component.size.height === 'number' ? component.size.height : 100,
    cursor: 'move',
    ...component.style
  }

  const commonProps = {
    ref: elementRef,
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect?.(component)
    },
    className: `
      relative
      ${isSelected ? 'outline outline-2 outline-blue-500' : ''}
      ${isDragging ? 'opacity-50 shadow-lg' : ''}
      hover:outline hover:outline-1 hover:outline-blue-300
    `,
    style
  }

  switch (component.type) {
    case 'section':
      return <section {...commonProps} />

    case 'svg':
      return (
        <svg
          {...commonProps}
          viewBox={component.viewBox}
          style={{
            ...style,
            backgroundImage: component.backgroundImage ? `url(${component.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
        />
      )

    case 'foreignObject':
      return (
        <foreignObject {...commonProps}>
          <div className="w-full h-full">
            {component.htmlContent}
          </div>
        </foreignObject>
      )

    case 'hotspot':
      return (
        <div {...commonProps}>
          <div className="absolute inset-0 bg-blue-500/20 animate-pulse" />
          <span className="absolute top-1 left-1 text-xs text-blue-500">热区</span>
        </div>
      )

    default:
      return null
  }
} 