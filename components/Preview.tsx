"use client"

import { Button } from "@/components/ui/button"
import { Code, RotateCcw, Eye } from "lucide-react"

export default function Preview() {
  return (
    <div className="w-80 border-l bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">预览</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Code className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-lg aspect-[9/16] w-full">{/* Preview content will go here */}</div>
    </div>
  )
}

