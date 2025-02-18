import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Toolbar({ addElement }) {
  const elements = [
    { type: "rect", label: "Rectangle" },
    { type: "circle", label: "Circle" },
    { type: "text", label: "Text" },
  ]

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Tools</h2>
        {elements.map((el) => (
          <Button
            key={el.type}
            variant="outline"
            className="w-full mb-2"
            onClick={() => addElement({ type: el.type, id: Date.now() })}
          >
            {el.label}
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}

