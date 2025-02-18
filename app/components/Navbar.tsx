import { Button } from "@/components/ui/button"

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-background border-b">
      <div className="flex items-center">
        <h1 className="text-xl font-bold">SVG Editor</h1>
      </div>
      <div>
        <Button variant="outline" className="mr-2">
          Save
        </Button>
        <Button variant="outline" className="mr-2">
          Export
        </Button>
        <Button variant="default">Preview</Button>
      </div>
    </nav>
  )
}

