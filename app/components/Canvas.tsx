"use client"

import { useState, useRef, useEffect } from "react"

export default function Canvas({ elements, updateElement, setSelectedElement }) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setIsDragging(true)
      setDragStart({ x, y })
    }

    const handleMouseMove = (e) => {
      if (!isDragging) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const dx = x - dragStart.x
      const dy = y - dragStart.y
      setDragStart({ x, y })
      // Update element position
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragStart])

  return (
    <div className="h-full bg-white" ref={canvasRef}>
      <svg width="100%" height="100%">
        {elements.map((el) => (
          <SVGElement key={el.id} element={el} />
        ))}
      </svg>
    </div>
  )
}

function SVGElement({ element }) {
  switch (element.type) {
    case "rect":
      return <rect x={element.x || 0} y={element.y || 0} width="100" height="100" fill="blue" />
    case "circle":
      return <circle cx={element.x || 50} cy={element.y || 50} r="50" fill="red" />
    case "text":
      return (
        <text x={element.x || 0} y={element.y || 20} fill="black">
          Sample Text
        </text>
      )
    default:
      return null
  }
}

