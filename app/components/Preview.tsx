import { ScrollArea } from "@/components/ui/scroll-area"

export default function Preview({ elements }) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Preview</h2>
        <div className="bg-white aspect-[9/16] w-full border rounded-lg overflow-hidden">
          <svg width="100%" height="100%">
            {elements.map((el) => (
              <SVGElement key={el.id} element={el} />
            ))}
          </svg>
        </div>
      </div>
    </ScrollArea>
  )
}

function SVGElement({ element }) {
  // Same as in Canvas component
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

